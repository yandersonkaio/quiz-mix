import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";

import { db } from "../db/firebase";
import { useAuth } from "../contexts/AuthContext";
import { QuizCollection } from "../types/quiz";

export const useUserCollections = () => {
    const { user } = useAuth();

    const [collections, setCollections] = useState<QuizCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setCollections([]);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const collectionsQuery = query(
            collection(db, "collections"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            collectionsQuery,
            async (snapshot) => {
                try {
                    const data = await Promise.all(
                        snapshot.docs.map(async (doc) => {
                            const quizzesSnap = await getDocs(
                                collection(
                                    db,
                                    "collections",
                                    doc.id,
                                    "quizItems"
                                )
                            );

                            const sectionsSnap = await getDocs(
                                collection(
                                    db,
                                    "collections",
                                    doc.id,
                                    "sections"
                                )
                            );

                            return {
                                id: doc.id,
                                ...doc.data(),
                                quizCount: quizzesSnap.size,
                                sectionCount: sectionsSnap.size,
                            } as QuizCollection;
                        })
                    );

                    setCollections(data);
                    setLoading(false);
                } catch (err) {
                    console.error("Erro ao buscar coleções:", err);
                    setError(err as Error);
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Erro ao buscar coleções:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return {
        collections,
        loading,
        error,
        user,
    };
};