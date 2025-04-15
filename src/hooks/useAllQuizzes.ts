import { useState, useEffect } from "react";
import { db } from "../db/firebase";
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore";
import { Quiz } from "../types/quiz";

export const useAllQuizzes = () => {
    const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUserData = async (userId: string) => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return {
                    id: userSnap.id,
                    name: userSnap.data().displayName || 'Usuário desconhecido',
                    photoUrl: userSnap.data().photoURL || null
                };
            }
            return {
                id: userId,
                name: 'Usuário desconhecido',
                photoUrl: null
            };
        } catch (error) {
            console.error("Error fetching user data:", error);
            return {
                id: userId,
                name: 'Usuário',
                photoUrl: null
            };
        }
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        const quizzesQuery = query(
            collection(db, "quizzes"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            quizzesQuery,
            async (querySnapshot) => {
                try {
                    const quizzesData = await Promise.all(
                        querySnapshot.docs.map(async (doc) => {
                            const quizData = doc.data();
                            const questionsQuery = collection(db, `quizzes/${doc.id}/questions`);
                            const questionsSnapshot = await getDocs(questionsQuery);
                            const questionCount = questionsSnapshot.size;

                            const creator = await fetchUserData(quizData.userId);

                            return {
                                id: doc.id,
                                ...quizData,
                                questionCount,
                                creator
                            } as Quiz;
                        })
                    );

                    setAllQuizzes(quizzesData);
                    setLoading(false);
                } catch (err) {
                    console.error("Erro ao buscar quizzes:", err);
                    setError(err as Error);
                    setLoading(false);
                }
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