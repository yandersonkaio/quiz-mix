import { useEffect, useState } from "react";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    deleteDoc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../db/firebase";
import { CollectionQuiz } from "../types/quiz";

export function useCollectionQuizzes(collectionId?: string) {
    const [quizzes, setQuizzes] = useState<CollectionQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);

    const fetchUserData = async (userId: string) => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return {
                    id: userSnap.id,
                    name:
                        userSnap.data().displayName ||
                        "Usuário desconhecido",
                    photoUrl:
                        userSnap.data().photoURL || null,
                };
            }

            return {
                id: userId,
                name: "Usuário desconhecido",
                photoUrl: null,
            };
        } catch (error) {
            console.error(
                "Error fetching user data:",
                error
            );

            return {
                id: userId,
                name: "Usuário",
                photoUrl: null,
            };
        }
    };

    useEffect(() => {
        if (!collectionId) {
            setQuizzes([]);
            setLoading(false);
            return;
        }

        setLoading(true);

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
                try {
                    const quizList = await Promise.all(
                        snapshot.docs.map(async (item) => {
                            const data = item.data();

                            const quizSnap = await getDoc(
                                doc(
                                    db,
                                    "quizzes",
                                    data.quizId
                                )
                            );

                            if (!quizSnap.exists()) {
                                return null;
                            }

                            const quizData =
                                quizSnap.data();

                            const questionsSnapshot =
                                await getDocs(
                                    collection(
                                        db,
                                        "quizzes",
                                        data.quizId,
                                        "questions"
                                    )
                                );

                            const questionCount =
                                questionsSnapshot.size;

                            let creator =
                                quizData.creator || null;

                            if (
                                !creator &&
                                quizData.userId
                            ) {
                                creator =
                                    await fetchUserData(
                                        quizData.userId
                                    );
                            }

                            return {
                                id: quizSnap.id,
                                collectionItemId: item.id,
                                sectionId:
                                    data.sectionId ?? null,
                                order: data.order ?? 0,
                                ...quizData,
                                questionCount,
                                creator,
                            } as CollectionQuiz;
                        })
                    );

                    setQuizzes(
                        quizList.filter(
                            (
                                quiz
                            ): quiz is CollectionQuiz =>
                                quiz !== null
                        )
                    );

                    setLoading(false);
                } catch (error) {
                    console.error(
                        "Erro ao carregar quizzes da coleção:",
                        error
                    );
                    setLoading(false);
                }
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

    async function updateQuizSection(
        itemId: string,
        sectionId: string | null
    ) {
        if (!collectionId) return;

        setOperationLoading(true);

        try {
            await updateDoc(
                doc(
                    db,
                    "collections",
                    collectionId,
                    "quizItems",
                    itemId
                ),
                {
                    sectionId,
                }
            );
        } finally {
            setOperationLoading(false);
        }
    }

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
                addedAt: serverTimestamp(),
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
        updateQuizSection,
        addQuizToCollection,
        removeQuizFromCollection,
    };
}