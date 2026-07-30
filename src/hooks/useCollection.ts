import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../db/firebase";
import { useAuth } from "../contexts/AuthContext";
import { QuizCollection } from "../types/quiz";

export function useCollection(collectionId?: string) {
    const { user } = useAuth();

    const [collection, setCollection] = useState<QuizCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!collectionId) {
            setCollection(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = onSnapshot(
            doc(db, "collections", collectionId),
            (docSnap) => {
                if (!docSnap.exists()) {
                    setCollection(null);
                    setLoading(false);
                    return;
                }

                setCollection({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as QuizCollection);

                setLoading(false);
            },
            (err) => {
                console.error("Erro ao carregar coleção:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionId]);

    return {
        collection,
        loading,
        error,
        user,
    };
}