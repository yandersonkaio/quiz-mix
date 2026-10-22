
import { useEffect, useState } from 'react'
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
} from 'firebase/firestore'

import type { Timestamp } from 'firebase/firestore'
import { db } from '../db/firebase'

export interface CollectionSection {
    id: string
    name: string
    order: number
    createdAt?: Timestamp
}

interface SectionsState {
    collectionId: string
    sections: CollectionSection[]
}

export function useCollectionSections(collectionId?: string) {
    const [state, setState] = useState<SectionsState | null>(null)
    const [operationLoading, setOperationLoading] = useState(false)

    useEffect(() => {
        if (!collectionId) return

        let active = true

        const sectionsQuery = query(
            collection(db, 'collections', collectionId, 'sections'),
            orderBy('order')
        )

        const unsubscribe = onSnapshot(
            sectionsQuery,
            (snapshot) => {
                if (!active) return

                const sectionList = snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                })) as CollectionSection[]

                setState({
                    collectionId,
                    sections: sectionList,
                })
            },
            (error) => {
                if (!active) return

                console.error('Erro ao carregar seções:', error)

                setState({
                    collectionId,
                    sections: [],
                })
            }
        )

        return () => {
            active = false
            unsubscribe()
        }
    }, [collectionId])

    const isCurrentCollection =
        !!collectionId && state?.collectionId === collectionId

    const sections = isCurrentCollection
        ? state.sections
        : []

    const loading = Boolean(collectionId && !isCurrentCollection)

    const addSection = async (name: string) => {
        if (!collectionId) return

        setOperationLoading(true)

        try {
            await addDoc(
                collection(db, 'collections', collectionId, 'sections'),
                {
                    name,
                    order: sections.length,
                    createdAt: serverTimestamp(),
                }
            )
        } finally {
            setOperationLoading(false)
        }
    }

    const updateSection = async (
        sectionId: string,
        name: string
    ) => {
        if (!collectionId) return

        setOperationLoading(true)

        try {
            await updateDoc(
                doc(
                    db,
                    'collections',
                    collectionId,
                    'sections',
                    sectionId
                ),
                {
                    name,
                }
            )
        } finally {
            setOperationLoading(false)
        }
    }

    const removeSection = async (sectionId: string) => {
        if (!collectionId) return

        setOperationLoading(true)

        try {
            await deleteDoc(
                doc(
                    db,
                    'collections',
                    collectionId,
                    'sections',
                    sectionId
                )
            )
        } finally {
            setOperationLoading(false)
        }
    }

    return {
        sections,
        loading,
        operationLoading,
        addSection,
        updateSection,
        removeSection,
    }
}
