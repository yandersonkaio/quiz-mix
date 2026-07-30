import { useEffect, useState } from "react";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../db/firebase";
import { CollectionQuiz } from "../types/quiz";

export function useCollectionQuizzes(collectionId?: string) {
    const [quizzes, setQuizzes] = useState<CollectionQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        if (!collectionId) {
            setQuizzes([]);
            setLoading(false);

            return;
        }

        const q = query(
            collection(
                db,
                "collections",
                collectionId,
                "quizItems"
            ),
            orderBy("order")
        );

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const quizList: CollectionQuiz[] = [];

                for (const item of snapshot.docs) {
                    const data = item.data();

                    const quizRef = doc(
                        db,
                        "quizzes",
                        data.quizId
                    );

                    const quizSnap = await getDoc(quizRef);

                    if (quizSnap.exists()) {
                        quizList.push({
                            id: quizSnap.id,
                            collectionItemId: item.id,
                            sectionId: data.sectionId ?? null,
                            order: data.order ?? 0,
                            ...quizSnap.data()
                        } as CollectionQuiz);
                    }
                }

                setQuizzes(quizList);
                setLoading(false);
            },
            (error) => {
                console.error(
                    "Erro ao carregar quizzes da coleção:",
                    error
                );
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [collectionId]);

    async function addQuizToCollection(
        quizId: string,
        sectionId: string | null = null
    ) {
        if (!collectionId) return;

        setOperationLoading(true);

        try {
            const ref = doc(
                collection(
                    db,
                    "collections",
                    collectionId,
                    "quizItems"
                )
            );

            await setDoc(ref, {
                quizId,
                sectionId,
                order: quizzes.length,
                addedAt: serverTimestamp()
            });
        } finally {
            setOperationLoading(false);
        }
    }

    async function removeQuizFromCollection(
        itemId: string
    ) {
        if (!collectionId) return;

        setOperationLoading(true);

        try {

            await deleteDoc(
                doc(
                    db,
                    "collections",
                    collectionId,
                    "quizItems",
                    itemId
                )
            );


        } finally {
            setOperationLoading(false);
        }
    }

    return {
        quizzes,
        loading,
        operationLoading,
        addQuizToCollection,
        removeQuizFromCollection
    };
}