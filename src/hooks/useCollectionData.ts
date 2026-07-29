import { useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";

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

            toast.success("Coleção criada com sucesso.");

            return docRef.id;
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar coleção.");
            return null;
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

            toast.success("Coleção atualizada.");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar coleção.");
        } finally {
            setOperationLoading(false);
        }
    };

    const deleteCollection = async (id: string) => {
        setOperationLoading(true);

        try {
            await deleteDoc(doc(db, "collections", id));

            toast.success("Coleção removida.");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover coleção.");
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