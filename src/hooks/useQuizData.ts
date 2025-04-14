import { useState, useEffect } from "react";
import { db } from "../db/firebase";
import {
    doc,
    getDoc,
    collection,
    onSnapshot,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    updateDoc,
    deleteDoc,
    setDoc,
    writeBatch,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import { UserAnswer } from "../pages/PlayQuiz";

export interface Question {
    id: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank";
    question: string;
    options?: string[];
    correctAnswer?: number;
    blankAnswer?: string;
}

export interface Quiz {
    id: string;
    name: string;
    description?: string;
    userId: string;
    createdAt: any;
    settings: {
        showAnswersAfter: "immediately" | "end" | "untilCorrect";
        timeLimitPerQuestion?: number;
    };
}

export interface Attempt {
    userId: string;
    quizId: string;
    completedAt: any;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    displayName: string;
    photoURL?: string;
    answers: UserAnswer[];
}

export interface QuestionData extends Omit<Question, "id"> { }

export const useQuizData = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [ranking, setRanking] = useState<Attempt[]>([]);
    const [allUserAttempts, setAllUserAttempts] = useState<{ [userId: string]: Attempt[] }>({});
    const [loading, setLoading] = useState(!!quizId);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        if (!quizId) {
            setLoading(false);
            return;
        }

        if (!user) {
            setLoading(false);
            navigate("/login");
            return;
        }

        const fetchQuizAndCheckAttempts = async () => {
            try {
                const quizDoc = await getDoc(doc(db, "quizzes", quizId));

                if (!quizDoc.exists()) {
                    alert("Quiz não encontrado.");
                    navigate("/my-quizzes");
                    return;
                }

                const quizData = quizDoc.data();
                const quizSettings = {
                    showAnswersAfter: quizData.settings?.showAnswersAfter || "end",
                    timeLimitPerQuestion: quizData.settings?.timeLimitPerQuestion || undefined,
                };
                setQuiz({
                    id: quizDoc.id,
                    name: quizData.name,
                    description: quizData.description,
                    userId: quizData.userId,
                    createdAt: quizData.createdAt,
                    settings: quizSettings,
                });

                const unsubscribe = onSnapshot(
                    collection(db, "quizzes", quizId, "questions"),
                    (snapshot) => {
                        const fetchedQuestions = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as Question[];
                        setQuestions(fetchedQuestions);
                        setLoading(false);
                    },
                    (error) => {
                        console.error("useQuizData: Erro ao carregar perguntas:", error);
                        setLoading(false);
                    }
                );

                return () => unsubscribe();
            } catch (error) {
                console.error("useQuizData: Erro ao carregar quiz:", error);
                alert("Erro ao carregar quiz.");
                setLoading(false);
            }
        };

        fetchQuizAndCheckAttempts();
    }, [quizId, navigate, user]);

    const createQuiz = async (quizData: Omit<Quiz, "id" | "createdAt">) => {
        if (!user) {
            alert("Faça login para criar um quiz.");
            return null;
        }

        try {
            setOperationLoading(true);
            const settings: Quiz["settings"] = {
                showAnswersAfter: quizData.settings.showAnswersAfter,
            };
            if (quizData.settings.timeLimitPerQuestion !== undefined) {
                settings.timeLimitPerQuestion = quizData.settings.timeLimitPerQuestion;
            }

            const quizRef = await addDoc(collection(db, "quizzes"), {
                name: quizData.name,
                description: quizData.description || "",
                userId: user.uid,
                createdAt: Timestamp.now(),
                settings,
            });

            alert("Quiz criado com sucesso!");
            return quizRef.id;
        } catch (error) {
            console.error("Erro ao criar quiz:", error);
            alert("Erro ao criar quiz.");
            return null;
        } finally {
            setOperationLoading(false);
        }
    };

    const fetchRanking = async () => {
        if (!quizId) return;
        const rankingQuery = query(
            collection(db, "attempts"),
            where("quizId", "==", quizId),
            orderBy("completedAt", "asc")
        );
        const rankingSnapshot = await getDocs(rankingQuery);
        const allAttempts = rankingSnapshot.docs.map((doc) => doc.data() as Attempt);

        const userAttemptsMap: { [userId: string]: Attempt[] } = {};
        allAttempts.forEach((attempt) => {
            if (!userAttemptsMap[attempt.userId]) {
                userAttemptsMap[attempt.userId] = [];
            }
            userAttemptsMap[attempt.userId].push(attempt);
        });

        const filteredRanking = Object.values(userAttemptsMap)
            .map((attempts) => {
                attempts.sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis());
                return attempts[0];
            })
            .sort(
                (a, b) =>
                    b.correctAnswers - a.correctAnswers || a.completedAt.toMillis() - b.completedAt.toMillis()
            );

        setRanking(filteredRanking);
        setAllUserAttempts(userAttemptsMap);
    };

    const saveAttempt = async (correctAnswers: number, totalQuestions: number, answers: UserAnswer[]) => {
        if (!user || !quizId) return;

        const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        await addDoc(collection(db, "attempts"), {
            userId: user.uid,
            quizId,
            completedAt: Timestamp.now(),
            correctAnswers,
            totalQuestions,
            percentage: Number(percentage.toFixed(2)),
            displayName: user.displayName || "Anônimo",
            photoURL: user.photoURL || undefined,
            answers,
        });

        fetchRanking();
    };

    const updateQuizDetails = async (updatedQuiz: Partial<Quiz>) => {
        if (!quizId || !quiz) return;

        try {
            const cleanedSettings: any = {
                ...quiz.settings,
                ...updatedQuiz.settings,
            };

            if (cleanedSettings.timeLimitPerQuestion === undefined) {
                delete cleanedSettings.timeLimitPerQuestion;
            }

            const updatedData = {
                name: updatedQuiz.name ?? quiz.name,
                description: updatedQuiz.description ?? quiz.description,
                settings: cleanedSettings,
            };

            await updateDoc(doc(db, "quizzes", quizId), updatedData);

            setQuiz((prev) => (prev ? { ...prev, ...updatedQuiz, settings: cleanedSettings } : prev));
            return true;
        } catch (error) {
            console.error("Erro ao atualizar detalhes do quiz:", error);
            throw error;
        }
    };

    const deleteQuiz = async () => {
        if (!quizId || !quiz) return false;

        try {
            const questionsSnapshot = await getDocs(collection(db, "quizzes", quizId, "questions"));
            const batch = writeBatch(db);

            questionsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            batch.delete(doc(db, "quizzes", quizId));

            await batch.commit();

            alert("Quiz excluído com sucesso!");
            navigate("/my-quizzes");
            return true;
        } catch (error) {
            console.error("Erro ao excluir quiz:", error);
            alert("Erro ao excluir quiz.");
            throw error;
        }
    };

    const addQuestion = async (questionData: QuestionData) => {
        if (!quizId) return;
        setOperationLoading(true);
        try {
            const cleanedQuestion = {
                type: questionData.type,
                question: questionData.question,
                ...(questionData.type === "multiple-choice" && {
                    options: questionData.options,
                    correctAnswer: questionData.correctAnswer,
                }),
                ...(questionData.type === "true-false" && {
                    correctAnswer: questionData.correctAnswer,
                }),
                ...(questionData.type === "fill-in-the-blank" && {
                    blankAnswer: questionData.blankAnswer || "",
                }),
            };

            await addDoc(collection(db, "quizzes", quizId, "questions"), cleanedQuestion);
            alert("Questão adicionada com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar questão:", error);
            alert("Erro ao adicionar questão.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const addMultipleQuestions = async (questionsData: QuestionData[]) => {
        if (!quizId) return;
        setOperationLoading(true);
        try {
            const batch = writeBatch(db);
            const questionsRef = collection(db, "quizzes", quizId, "questions");

            questionsData.forEach((question) => {
                const cleanedQuestion = {
                    type: question.type,
                    question: question.question,
                    ...(question.type === "multiple-choice" && {
                        options: question.options,
                        correctAnswer: question.correctAnswer,
                    }),
                    ...(question.type === "true-false" && {
                        correctAnswer: question.correctAnswer,
                    }),
                    ...(question.type === "fill-in-the-blank" && {
                        blankAnswer: question.blankAnswer || "",
                    }),
                };

                const docRef = doc(questionsRef);
                batch.set(docRef, cleanedQuestion);
            });

            await batch.commit();
            alert(`${questionsData.length} questões adicionadas com sucesso!`);
            return true;
        } catch (error) {
            console.error("Erro ao adicionar múltiplas questões:", error);
            alert("Erro ao adicionar questões.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const updateQuestion = async (questionId: string, questionData: Partial<Question>) => {
        if (!quizId || !questionId) return;
        setOperationLoading(true);
        try {
            const cleanedQuestion: Partial<Question> = {
                ...questionData,
                ...(questionData.type === "multiple-choice" && {
                    options: questionData.options,
                    correctAnswer: questionData.correctAnswer,
                    blankAnswer: undefined,
                }),
                ...(questionData.type === "true-false" && {
                    correctAnswer: questionData.correctAnswer,
                    options: undefined,
                    blankAnswer: undefined,
                }),
                ...(questionData.type === "fill-in-the-blank" && {
                    blankAnswer: questionData.blankAnswer || "",
                    options: undefined,
                    correctAnswer: undefined,
                }),
            };

            Object.keys(cleanedQuestion).forEach((key) => {
                if (cleanedQuestion[key as keyof Question] === undefined) {
                    delete cleanedQuestion[key as keyof Question];
                }
            });

            await setDoc(doc(db, "quizzes", quizId, "questions", questionId), cleanedQuestion, {
                merge: true,
            });
            alert("Questão atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar questão:", error);
            alert("Erro ao atualizar questão.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const deleteQuestion = async (questionId: string) => {
        if (!quizId || !questionId) return;
        setOperationLoading(true);
        try {
            await deleteDoc(doc(db, "quizzes", quizId, "questions", questionId));
            alert("Questão removida com sucesso!");
        } catch (error) {
            console.error("Erro ao remover questão:", error);
            alert("Erro ao remover questão.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    return {
        quiz,
        questions,
        ranking,
        allUserAttempts,
        loading,
        operationLoading,
        fetchRanking,
        saveAttempt,
        updateQuizDetails,
        deleteQuiz,
        addQuestion,
        addMultipleQuestions,
        updateQuestion,
        deleteQuestion,
        user,
        createQuiz,
    };
};