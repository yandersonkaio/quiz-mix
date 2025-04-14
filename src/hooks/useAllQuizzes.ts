import { useState, useEffect } from "react";
import { db } from "../db/firebase";
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    Timestamp,
} from "firebase/firestore";

export interface Quiz {
    id: string;
    name: string;
    userId: string;
    createdAt: Timestamp | any;
    description?: string;
    settings?: {
        timeLimitPerQuestion?: number;
        showAnswersAfter: "immediately" | "end" | "untilCorrect";
    };
}

export const useAllQuizzes = () => {
    const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const quizzesQuery = query(
            collection(db, "quizzes"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            quizzesQuery,
            (querySnapshot) => {
                const quizzesData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Quiz[];

                setAllQuizzes(quizzesData);
                setLoading(false);
            },
            (err) => {
                console.error("Erro ao buscar todos os quizzes:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();

    }, []);

    return { allQuizzes, loading, error };
};