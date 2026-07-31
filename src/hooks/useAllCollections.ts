import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";

import { db } from "../db/firebase";
import { QuizCollection } from "../types/quiz";
import { useAuth } from "../contexts/AuthContext";

export const useAllCollections = () => {
    const { user } = useAuth();

    const [collections, setCollections] = useState<QuizCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const collectionsQuery = query(
            collection(db, "collections"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            collectionsQuery,
            async (snapshot) => {
                try {
                    const data = await Promise.all(
                        snapshot.docs.map(async (collectionDoc) => {
                            const collectionData = collectionDoc.data();

                            const quizzesSnap = await getDocs(
                                collection(
                                    db,
                                    "collections",
                                    collectionDoc.id,
                                    "quizItems"
                                )
                            );

                            const sectionsSnap = await getDocs(
                                collection(
                                    db,
                                    "collections",
                                    collectionDoc.id,
                                    "sections"
                                )
                            );

                            let creator = null;

                            if (collectionData.userId) {
                                const userSnap = await getDoc(
                                    doc(
                                        db,
                                        "users",
                                        collectionData.userId
                                    )
                                );

                                if (userSnap.exists()) {
                                    const userData = userSnap.data();

                                    creator = {
                                        name: userData.displayName,
                                        photoURL: userData.photoURL
                                    };
                                }
                            }

                            return {
                                id: collectionDoc.id,
                                ...collectionData,
                                creator,
                                quizCount: quizzesSnap.size,
                                sectionCount: sectionsSnap.size,
                                isOwner: user?.uid === collectionData.userId,
                                isFavorite: false,
                            } as QuizCollection;
                        })
                    );

                    setCollections(data);
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                    setError(err as Error);
                    setLoading(false);
                }
            },
            (err) => {
                console.error(err);
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
    };
};