import { useEffect, useState } from "react";
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "../db/firebase";
import { useAuth } from "../contexts/AuthContext";

export function useCollectionFavorite(collectionId?: string) {
    const { user } = useAuth();

    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        if (!collectionId || !user) {
            setIsFavorite(false);
            setLoading(false);
            return;
        }

        const loadFavorite = async () => {
            try {
                const favoriteRef = doc(
                    db,
                    "collections",
                    collectionId,
                    "favorites",
                    user.uid
                );

                const snap = await getDoc(favoriteRef);

                setIsFavorite(snap.exists());
            } finally {
                setLoading(false);
            }
        };

        loadFavorite();
    }, [collectionId, user]);

    async function favoriteCollection() {
        if (!collectionId || !user) return;

        setOperationLoading(true);

        try {
            await setDoc(
                doc(
                    db,
                    "collections",
                    collectionId,
                    "favorites",
                    user.uid
                ),
                {
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                }
            );

            setIsFavorite(true);
        } finally {
            setOperationLoading(false);
        }
    }

    async function unfavoriteCollection() {
        if (!collectionId || !user) return;

        setOperationLoading(true);

        try {
            await deleteDoc(
                doc(
                    db,
                    "collections",
                    collectionId,
                    "favorites",
                    user.uid
                )
            );

            setIsFavorite(false);
        } finally {
            setOperationLoading(false);
        }
    }

    async function toggleFavorite() {
        if (isFavorite) {
            await unfavoriteCollection();
        } else {
            await favoriteCollection();
        }
    }

    return {
        isFavorite,
        loading,
        operationLoading,
        favoriteCollection,
        unfavoriteCollection,
        toggleFavorite,
    };
}