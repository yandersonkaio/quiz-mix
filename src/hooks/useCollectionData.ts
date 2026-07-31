import { useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../db/firebase";
import { useAuth } from "../contexts/AuthContext";
import { QuizCollection } from "@/types/quiz";

export function useCollectionData() {
    const { user } = useAuth();

    const [operationLoading, setOperationLoading] = useState(false);

    const createCollection = async (
        collectionData: Omit<QuizCollection, "id" | "createdAt">
    ) => {
        setOperationLoading(true);

        try {
            const docRef = await addDoc(collection(db, "collections"), {
                ...collectionData,
                createdAt: serverTimestamp(),
            });

            return docRef.id;
        } finally {
            setOperationLoading(false);
        }
    };

    const updateCollection = async (
        id: string,
        data: Partial<QuizCollection>
    ) => {
        setOperationLoading(true);

        try {
            await updateDoc(doc(db, "collections", id), data);
        } finally {
            setOperationLoading(false);
        }
    };

    const deleteCollection = async (id: string) => {
        setOperationLoading(true);

        try {
            await deleteDoc(doc(db, "collections", id));
        } finally {
            setOperationLoading(false);
        }
    };

    return {
        user,
        operationLoading,
        createCollection,
        updateCollection,
        deleteCollection,
    };
}