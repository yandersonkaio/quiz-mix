import { useState, useEffect } from "react";
import { db } from "../db/firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, query, where, getDocs, orderBy, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Timestamp } from "firebase/firestore";

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
        showAnswersAfter: "immediately" | "end";
        timeLimitPerQuestion?: number;
        allowMultipleAttempts?: boolean;
    };
}

export interface Attempt {
    userId: string;
    quizId: string;
    completedAt: any;
    correctAnswers: number;
    displayName: string;
    photoURL?: string;
}

export const useQuizData = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [canPlay, setCanPlay] = useState<boolean>(false);
    const [ranking, setRanking] = useState<Attempt[]>([]);
    const [allUserAttempts, setAllUserAttempts] = useState<{ [userId: string]: Attempt[] }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!quizId || !user) {
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
                    allowMultipleAttempts: quizData.settings?.allowMultipleAttempts || false,
                };
                setQuiz({
                    id: quizDoc.id,
                    name: quizData.name,
                    description: quizData.description,
                    userId: quizData.userId,
                    createdAt: quizData.createdAt,
                    settings: quizSettings,
                });

                setCanPlay(true);

                const unsubscribe = onSnapshot(collection(db, "quizzes", quizId, "questions"), (snapshot) => {
                    const fetchedQuestions = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as Question[];
                    setQuestions(fetchedQuestions);
                    setLoading(false);
                }, (error) => {
                    console.error("useQuizData: Erro ao carregar perguntas:", error);
                    setLoading(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("useQuizData: Erro ao carregar quiz:", error);
                alert("Erro ao carregar quiz.");
                setLoading(false);
            }
        };

        fetchQuizAndCheckAttempts();
    }, [quizId, navigate, user]);

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

    const saveAttempt = async (correctAnswers: number) => {
        if (!user || !quizId) return;

        await addDoc(collection(db, "attempts"), {
            userId: user.uid,
            quizId,
            completedAt: Timestamp.now(),
            correctAnswers,
            displayName: user.displayName || "Anônimo",
            photoURL: user.photoURL || undefined,
        });
        console.log("Tentativa salva com sucesso:", { correctAnswers, displayName: user.displayName });

        fetchRanking();
    };

    const updateQuizDetails = async (updatedQuiz: Partial<Quiz>) => {
        if (!quizId || !quiz) return;

        try {
            await updateDoc(doc(db, "quizzes", quizId), {
                name: updatedQuiz.name ?? quiz.name,
                description: updatedQuiz.description ?? quiz.description,
                settings: updatedQuiz.settings ?? quiz.settings,
            });
            setQuiz((prev) => prev ? { ...prev, ...updatedQuiz } : prev);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar detalhes do quiz:", error);
            throw error;
        }
    };

    return { quiz, questions, canPlay, ranking, allUserAttempts, loading, fetchRanking, saveAttempt, updateQuizDetails, user };
};