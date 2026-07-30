import { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "../db/firebase";

export interface CollectionSection {
    id: string;
    name: string;
    order: number;
    createdAt?: any;
}

export function useCollectionSections(collectionId?: string) {
    const [sections, setSections] = useState<CollectionSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        if (!collectionId) {
            setSections([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(
                db,
                "collections",
                collectionId,
                "sections"
            ),
            orderBy("order")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const sectionList = snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                })) as CollectionSection[];

                setSections(sectionList);
                setLoading(false);
            },
            (error) => {
                console.error("Erro ao carregar seções:", error);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [collectionId]);

    const addSection = async (name: string) => {
        if (!collectionId) return;

        setOperationLoading(true);

        try {
            await addDoc(
                collection(
                    db,
                    "collections",
                    collectionId,
                    "sections"
                ),
                {
                    name,
                    order: sections.length,
                    createdAt: serverTimestamp(),
                }
            );
        } finally {
            setOperationLoading(false);
        }
    };

    const updateSection = async (
        sectionId: string,
        name: string
    ) => {
        if (!collectionId) return;

        setOperationLoading(true);

        try {
            await updateDoc(
                doc(
                    db,
                    "collections",
                    collectionId,
                    "sections",
                    sectionId
                ),
                {
                    name,
                }
            );
        } finally {
            setOperationLoading(false);
        }
    };

    const removeSection = async (sectionId: string) => {
        if (!collectionId) return;

        setOperationLoading(true);

        try {
            await deleteDoc(
                doc(
                    db,
                    "collections",
                    collectionId,
                    "sections",
                    sectionId
                )
            );
        } finally {
            setOperationLoading(false);
        }
    };

    return {
        sections,
        loading,
        operationLoading,
        addSection,
        updateSection,
        removeSection,
    };
}