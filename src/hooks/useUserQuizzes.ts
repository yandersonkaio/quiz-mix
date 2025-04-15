import { useState, useEffect } from "react";
import { db } from "../db/firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Quiz, QuizUser } from "../types/quiz";

export const useUserQuizzes = () => {
    const { user } = useAuth();

    const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUserData = async (userId: string): Promise<QuizUser> => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                return {
                    id: userSnap.id,
                    name: userData.displayName || 'Usuário desconhecido',
                    photoUrl: userData.photoURL || null
                };
            }
            return {
                id: userId,
                name: 'Usuário desconhecido',
                photoUrl: undefined
            };
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
            return {
                id: userId,
                name: 'Usuário desconhecido',
                photoUrl: undefined
            };
        }
    };

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
            async (querySnapshot) => {
                try {
                    const quizzesData = await Promise.all(
                        querySnapshot.docs.map(async (doc) => {
                            const questionsQuery = collection(
                                db,
                                `quizzes/${doc.id}/questions`
                            );
                            const questionsSnapshot = await getDocs(questionsQuery);
                            const questionCount = questionsSnapshot.size;

                            const creator = await fetchUserData(doc.data().userId);

                            return {
                                id: doc.id,
                                ...doc.data(),
                                questionCount,
                                creator
                            } as Quiz;
                        })
                    );

                    setUserQuizzes(quizzesData);
                    setLoading(false);
                } catch (err) {
                    console.error("Erro ao buscar dados:", err);
                    setError(err as Error);
                    setLoading(false);
                }
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