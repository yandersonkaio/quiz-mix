import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

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

        const fetchCollection = async () => {
            try {
                setLoading(true);

                const docRef = doc(db, "collections", collectionId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    setCollection(null);
                    return;
                }

                setCollection({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as QuizCollection);
            } catch (err) {
                console.error("Erro ao carregar coleção:", err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [collectionId]);

    return {
        collection,
        loading,
        error,
        user,
    };
}