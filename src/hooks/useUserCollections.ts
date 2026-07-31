import { useEffect, useState } from "react";
import {
    collection,
    collectionGroup,
    doc,
    getDoc,
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

        const createdQuery = query(
            collection(db, "collections"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            createdQuery,
            async (snapshot) => {
                try {
                    const created = await Promise.all(
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
                                        photoURL: userData.photoURL,
                                    };
                                }
                            }

                            return {
                                id: collectionDoc.id,
                                ...collectionData,
                                creator,
                                quizCount: quizzesSnap.size,
                                sectionCount: sectionsSnap.size,
                                isOwner: true,
                                isFavorite: false,
                            } as QuizCollection;
                        })
                    );

                    const favoritesQuery = query(
                        collectionGroup(db, "favorites"),
                        where("userId", "==", user.uid)
                    );

                    const favoritesSnap = await getDocs(favoritesQuery);

                    const favorites = await Promise.all(
                        favoritesSnap.docs.map(async (favoriteDoc) => {
                            const collectionId =
                                favoriteDoc.ref.parent.parent?.id;

                            if (!collectionId) {
                                return null;
                            }

                            const collectionRef = doc(
                                db,
                                "collections",
                                collectionId
                            );

                            const collectionSnap =
                                await getDoc(collectionRef);

                            if (!collectionSnap.exists()) {
                                return null;
                            }

                            const collectionData =
                                collectionSnap.data();

                            const quizzesSnap = await getDocs(
                                collection(
                                    db,
                                    "collections",
                                    collectionId,
                                    "quizItems"
                                )
                            );

                            const sectionsSnap = await getDocs(
                                collection(
                                    db,
                                    "collections",
                                    collectionId,
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
                                        photoURL: userData.photoURL,
                                    };
                                }
                            }

                            return {
                                id: collectionSnap.id,
                                ...collectionData,
                                creator,
                                quizCount: quizzesSnap.size,
                                sectionCount: sectionsSnap.size,
                                isOwner:
                                    user.uid === collectionData.userId,
                                isFavorite: true,
                            } as QuizCollection;
                        })
                    );

                    const favoriteList = favorites.filter(
                        (item): item is QuizCollection =>
                            item !== null
                    );

                    const map = new Map<string, QuizCollection>();

                    created.forEach((collection) => {
                        map.set(collection.id, collection);
                    });

                    favoriteList.forEach((collection) => {
                        if (!map.has(collection.id)) {
                            map.set(collection.id, collection);
                        }
                    });

                    setCollections(Array.from(map.values()));
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
        user,
    };
};