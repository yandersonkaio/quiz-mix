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
    writeBatch,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";
import { Quiz, Question, UserAnswer, Attempt, RankingEntry } from "../types/quiz";
import { toast } from "sonner";

export type QuestionData = Omit<Question, "id">;

export interface QuizStatistics {
    totalAttempts: number;
    totalUniqueUsers: number;
    bestPercentage: number;
    averagePercentage: number;
    bestEfficiency?: number;
    averageEfficiency?: number;
    minTotalAttempts?: number;
    averageTotalAttempts?: number;
}

export const useQuizData = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [ranking, setRanking] = useState<Attempt[]>([]);
    const [studyRanking, setStudyRanking] = useState<RankingEntry[]>([]);
    const [allUserAttempts, setAllUserAttempts] = useState<{ [userId: string]: Attempt[] }>({});
    const [statistics, setStatistics] = useState<QuizStatistics | null>(null);
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
                    toast.error("Quiz não encontrado.");
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
                    difficulty: quizData.difficulty,
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
                toast.error("Erro ao carregar quiz.");
                setLoading(false);
            }
        };

        fetchQuizAndCheckAttempts();
    }, [quizId, navigate, user]);

    const calculateQuizStatistics = (
        allAttempts: Attempt[],
        userAttemptsMap: { [userId: string]: Attempt[] }
    ): QuizStatistics => {
        const totalAttempts = allAttempts.length;

        const challengeFirstAttempts = Object.values(userAttemptsMap)
            .map(attempts => {
                const challengeAttempts = attempts
                    .filter(a => a.mode !== "study")
                    .sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis());

                return challengeAttempts[0];
            })
            .filter(Boolean);

        const studyFirstAttempts = Object.values(userAttemptsMap)
            .map(attempts => {
                const studyAttempts = attempts
                    .filter(a => a.mode === "study")
                    .sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis());

                return studyAttempts[0];
            })
            .filter(Boolean);

        const totalUniqueUsers = Object.keys(userAttemptsMap).length;

        const bestPercentage = challengeFirstAttempts.length > 0
            ? Math.max(...challengeFirstAttempts.map(a => a.percentage))
            : 0;

        const averagePercentage = challengeFirstAttempts.length > 0
            ? challengeFirstAttempts.reduce(
                (sum, a) => sum + a.percentage,
                0
            ) / challengeFirstAttempts.length
            : 0;

        const bestEfficiency = studyFirstAttempts.length > 0
            ? Math.max(
                ...studyFirstAttempts.map(a => {
                    const totalQ = a.totalQuestions || 0;
                    const totalAtt = a.totalAttempts || 1;

                    return totalQ > 0
                        ? (totalQ / totalAtt) * 100
                        : 0;
                })
            )
            : 0;

        const averageEfficiency = studyFirstAttempts.length > 0
            ? studyFirstAttempts.reduce((sum, a) => {
                const totalQ = a.totalQuestions || 0;
                const totalAtt = a.totalAttempts || 1;

                const efficiency = totalQ > 0
                    ? (totalQ / totalAtt) * 100
                    : 0;

                return sum + efficiency;
            }, 0) / studyFirstAttempts.length
            : 0;

        const minTotalAttempts = studyFirstAttempts.length > 0
            ? Math.min(
                ...studyFirstAttempts.map(a => a.totalAttempts || 0)
            )
            : 0;

        const averageTotalAttempts = studyFirstAttempts.length > 0
            ? studyFirstAttempts.reduce(
                (sum, a) => sum + (a.totalAttempts || 0),
                0
            ) / studyFirstAttempts.length
            : 0;

        return {
            totalAttempts,
            totalUniqueUsers,
            bestPercentage: Number(bestPercentage.toFixed(2)),
            averagePercentage: Number(averagePercentage.toFixed(2)),
            bestEfficiency: Number(bestEfficiency.toFixed(1)),
            averageEfficiency: Number(averageEfficiency.toFixed(1)),
            minTotalAttempts,
            averageTotalAttempts: Number(averageTotalAttempts.toFixed(1)),
        };
    };

    const fetchRanking = async (mode: 'challenge' | 'study' = 'challenge') => {
        if (!quizId) return;
        console.log(mode)
        const rankingQuery = query(
            collection(db, "attempts"),
            where("quizId", "==", quizId),
            orderBy("completedAt", "asc")
        );
        const rankingSnapshot = await getDocs(rankingQuery);
        const allAttempts = rankingSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }) as Attempt);

        const userAttemptsMap: { [userId: string]: Attempt[] } = {};
        allAttempts.forEach((attempt) => {
            if (!userAttemptsMap[attempt.userId]) {
                userAttemptsMap[attempt.userId] = [];
            }
            userAttemptsMap[attempt.userId].push(attempt);
        });

        const stats = calculateQuizStatistics(allAttempts, userAttemptsMap);
        setStatistics(stats);
        setAllUserAttempts(userAttemptsMap);

        const studyRankingEntries: RankingEntry[] = Object.values(userAttemptsMap)
            .filter(attempts => attempts.some(a => a.mode === 'study'))
            .map((attempts) => {
                const studyAttempts = attempts.filter(a => a.mode === 'study');
                studyAttempts.sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis());
                const bestAttempt = studyAttempts[0];

                const efficiency = bestAttempt.totalQuestions > 0 && bestAttempt.totalAttempts
                    ? Number(((bestAttempt.totalQuestions / bestAttempt.totalAttempts) * 100).toFixed(1))
                    : 0;

                return {
                    userId: bestAttempt.userId,
                    userName: bestAttempt.displayName || "Anônimo",
                    displayName: bestAttempt.displayName,
                    photoURL: bestAttempt.photoURL,
                    score: efficiency,
                    correctAnswers: bestAttempt.correctAnswers,
                    totalQuestions: bestAttempt.totalQuestions,
                    totalAttempts: bestAttempt.totalAttempts || bestAttempt.totalQuestions,
                    completedAt: bestAttempt.completedAt,
                    mode: 'study' as const,
                };
            })
            .sort((a, b) => a.totalAttempts - b.totalAttempts);

        setStudyRanking(studyRankingEntries);

        const filteredRanking = Object.values(userAttemptsMap)
            .filter(attempts => attempts.some(a => a.mode !== 'study'))
            .map((attempts) => {
                const challengeAttempts = attempts.filter(a => a.mode !== 'study');
                challengeAttempts.sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis());
                return challengeAttempts[0];
            })
            .sort(
                (a, b) =>
                    b.correctAnswers - a.correctAnswers || a.completedAt.toMillis() - b.completedAt.toMillis()
            );

        setRanking(filteredRanking);
    };

    const createQuiz = async (quizData: Omit<Quiz, "id" | "createdAt">) => {
        if (!user) {
            toast.error("Faça login para criar um quiz.");
            return null;
        }

        try {
            setOperationLoading(true);
            const settings: Quiz["settings"] = {
                showAnswersAfter: quizData.settings.showAnswersAfter,
            };
            if (quizData.settings?.timeLimitPerQuestion !== undefined) {
                settings.timeLimitPerQuestion = quizData.settings.timeLimitPerQuestion;
            }

            const quiz = {
                name: quizData.name,
                description: quizData.description || "",
                userId: user.uid,
                createdAt: Timestamp.now(),
                settings,
                ...(quizData.difficulty && { difficulty: quizData.difficulty }),
            };

            const quizRef = await addDoc(collection(db, "quizzes"), quiz);

            toast.success("Quiz criado com sucesso!");
            return quizRef.id;
        } catch (error) {
            console.error("Erro ao criar quiz:", error);
            toast.error("Erro ao criar quiz.");
            return null;
        } finally {
            setOperationLoading(false);
        }
    };

    const saveAttempt = async (
        correctAnswers: number,
        totalQuestions: number,
        answers: UserAnswer[],
        totalAttempts?: number,
        mode: 'challenge' | 'study' = 'challenge'
    ) => {
        if (!user || !quizId) return;

        const percentage = totalQuestions > 0
            ? mode === 'study'
                ? 100 // No modo estudo, sempre acerta todas
                : (correctAnswers / totalQuestions) * 100
            : 0;

        const attemptData: any = {
            userId: user.uid,
            quizId,
            completedAt: Timestamp.now(),
            correctAnswers,
            totalQuestions,
            percentage: Number(percentage.toFixed(2)),
            displayName: user.displayName || "Anônimo",
            photoURL: user.photoURL || undefined,
            answers,
            mode,
        };

        if (mode === 'study' && totalAttempts !== undefined) {
            attemptData.totalAttempts = totalAttempts;
        }

        await addDoc(collection(db, "attempts"), attemptData);

        fetchRanking(mode);
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

            const updatedData: any = {
                name: updatedQuiz.name ?? quiz.name,
                description: updatedQuiz.description ?? quiz.description,
                settings: cleanedSettings,
            };

            if (updatedQuiz.difficulty !== undefined) {
                updatedData.difficulty = updatedQuiz.difficulty;
            }

            await updateDoc(doc(db, "quizzes", quizId), updatedData);

            setQuiz((prev) =>
                prev
                    ? {
                        ...prev,
                        ...updatedQuiz,
                        settings: cleanedSettings,
                    }
                    : prev
            );

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

            toast.success("Quiz excluído com sucesso!");
            navigate("/my-quizzes");
            return true;
        } catch (error) {
            console.error("Erro ao excluir quiz:", error);
            toast.error("Erro ao excluir quiz.");
            throw error;
        }
    };

    const addQuestion = async (questionData: QuestionData) => {
        if (!quizId) return;
        setOperationLoading(true);
        try {
            const cleanedQuestion: any = {
                type: questionData.type,
                question: questionData.question,
            };

            if (questionData.type === "multiple-choice") {
                cleanedQuestion.options = questionData.options || [];
                cleanedQuestion.correctAnswer = questionData.correctAnswer;

                if (questionData.optionFeedback && Array.isArray(questionData.optionFeedback)) {
                    const feedback = questionData.optionFeedback.map(f => {
                        if (f === null || f === undefined) return null;
                        const trimmed = f.trim();
                        return trimmed === "" ? null : trimmed;
                    });

                    if (feedback.some(f => f !== null)) {
                        cleanedQuestion.optionFeedback = feedback;
                    }
                }
            }

            if (questionData.type === "true-false") {
                cleanedQuestion.correctAnswer = questionData.correctAnswer;
            }

            if (questionData.type === "fill-in-the-blank") {
                cleanedQuestion.blankAnswer = questionData.blankAnswer || "";
            }

            await addDoc(collection(db, "quizzes", quizId, "questions"), cleanedQuestion);

            toast.success("Questão adicionada com sucesso!");
        } catch (error) {
            console.error("Erro ao adicionar questão:", error);
            toast.error("Erro ao adicionar questão.");
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

            questionsData.forEach((questionData) => {
                const cleanedQuestion: any = {
                    type: questionData.type,
                    question: questionData.question,
                };

                if (questionData.type === "multiple-choice") {
                    cleanedQuestion.options = questionData.options || [];
                    cleanedQuestion.correctAnswer = questionData.correctAnswer;

                    if (questionData.optionFeedback && Array.isArray(questionData.optionFeedback)) {
                        const feedback = questionData.optionFeedback.map(f => {
                            if (f === null || f === undefined) return null;
                            const trimmed = f.trim();
                            return trimmed === "" ? null : trimmed;
                        });

                        if (feedback.some(f => f !== null)) {
                            cleanedQuestion.optionFeedback = feedback;
                        }
                    }
                }

                if (questionData.type === "true-false") {
                    cleanedQuestion.correctAnswer = questionData.correctAnswer;
                }

                if (questionData.type === "fill-in-the-blank") {
                    cleanedQuestion.blankAnswer = questionData.blankAnswer || "";
                }

                const docRef = doc(questionsRef);
                batch.set(docRef, cleanedQuestion);
            });

            await batch.commit();
            toast.success(`${questionsData.length} questões adicionadas com sucesso!`);
            return true;
        } catch (error) {
            console.error("Erro ao adicionar múltiplas questões:", error);
            toast.error("Erro ao adicionar questões.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const updateQuestion = async (questionId: string, questionData: Partial<Question>) => {
        if (!quizId || !questionId) return;
        setOperationLoading(true);
        try {
            const cleanedQuestion: any = {
                ...questionData,
            };

            if (questionData.type === "multiple-choice") {
                cleanedQuestion.options = questionData.options;
                cleanedQuestion.correctAnswer = questionData.correctAnswer;
                cleanedQuestion.blankAnswer = undefined;

                if (questionData.optionFeedback !== undefined) {
                    const feedback = questionData.optionFeedback.map(f => {
                        if (f === null || f === undefined) return null;
                        const trimmed = f.trim();
                        return trimmed === "" ? null : trimmed;
                    });

                    if (feedback.every(f => f === null)) {
                        cleanedQuestion.optionFeedback = undefined;
                    } else {
                        cleanedQuestion.optionFeedback = feedback;
                    }
                }
            }

            if (questionData.type === "true-false") {
                cleanedQuestion.correctAnswer = questionData.correctAnswer;
                cleanedQuestion.options = undefined;
                cleanedQuestion.blankAnswer = undefined;
                cleanedQuestion.optionFeedback = undefined;
            }

            if (questionData.type === "fill-in-the-blank") {
                cleanedQuestion.blankAnswer = questionData.blankAnswer || "";
                cleanedQuestion.options = undefined;
                cleanedQuestion.correctAnswer = undefined;
                cleanedQuestion.optionFeedback = undefined;
            }

            Object.keys(cleanedQuestion).forEach((key) => {
                if (cleanedQuestion[key] === undefined) {
                    delete cleanedQuestion[key];
                }
            });

            await updateDoc(doc(db, "quizzes", quizId, "questions", questionId), cleanedQuestion);
            toast.success("Questão atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar questão:", error);
            toast.error("Erro ao atualizar questão.");
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
            toast.success("Questão removida com sucesso!");
        } catch (error) {
            console.error("Erro ao remover questão:", error);
            toast.error("Erro ao remover questão.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const deleteAllAttempts = async () => {
        if (!quizId) return;
        setOperationLoading(true);
        try {
            const attemptsQuery = query(collection(db, "attempts"), where("quizId", "==", quizId));
            const attemptsSnapshot = await getDocs(attemptsQuery);
            const batch = writeBatch(db);

            attemptsSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            await batch.commit();
            await fetchRanking();
            toast.success("Todas as tentativas foram excluídas com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir todas as tentativas:", error);
            toast.error("Erro ao excluir todas as tentativas.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    const deleteAttempt = async (attemptId: string) => {
        if (!quizId || !attemptId) return;
        setOperationLoading(true);
        try {
            await deleteDoc(doc(db, "attempts", attemptId));
            await fetchRanking();
            toast.success("Tentativa excluída com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir tentativa:", error);
            toast.error("Erro ao excluir tentativa.");
            throw error;
        } finally {
            setOperationLoading(false);
        }
    };

    return {
        quiz,
        questions,
        ranking,
        studyRanking,
        allUserAttempts,
        statistics,
        loading,
        operationLoading,
        user,
        fetchRanking,
        saveAttempt,
        updateQuizDetails,
        deleteQuiz,
        addQuestion,
        addMultipleQuestions,
        updateQuestion,
        deleteQuestion,
        createQuiz,
        deleteAllAttempts,
        deleteAttempt
    };
};