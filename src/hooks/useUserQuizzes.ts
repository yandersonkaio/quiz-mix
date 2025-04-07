import { useState, useEffect } from "react";
import { db } from "../db/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export interface Quiz {
    id: string;
    name: string;
    userId: string;
    createdAt: Timestamp | any;
    description?: string;
    settings?: {
        timeLimitPerQuestion?: number;
        allowMultipleAttempts?: boolean;
        showAnswersAfter: "immediately" | "end" | "untilCorrect";
    };
}

export const useUserQuizzes = () => {
    const { user } = useAuth();

    const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setUserQuizzes([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const quizzesQuery = query(
            collection(db, "quizzes"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            quizzesQuery,
            (querySnapshot) => {
                const quizzesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Quiz[];

                setUserQuizzes(quizzesData);
                setLoading(false);
            },
            (err) => {
                console.error("Erro ao buscar quizzes do usuário:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, [user]);

    return { userQuizzes, loading, error, user };
};