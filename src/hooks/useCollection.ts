
import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'

import { db } from '../db/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { QuizCollection } from '../types/quiz'

interface CollectionState {
    collectionId: string
    collection: QuizCollection | null
    error: Error | null
}

export function useCollection(collectionId?: string) {
    const { user } = useAuth()

    const [state, setState] = useState<CollectionState | null>(null)

    useEffect(() => {
        if (!collectionId) return

        let active = true

        const collectionRef = doc(db, 'collections', collectionId)

        const unsubscribe = onSnapshot(
            collectionRef,
            (docSnap) => {
                if (!active) return

                if (!docSnap.exists()) {
                    setState({
                        collectionId,
                        collection: null,
                        error: null,
                    })

                    return
                }

                setState({
                    collectionId,
                    collection: {
                        id: docSnap.id,
                        ...docSnap.data(),
                    } as QuizCollection,
                    error: null,
                })
            },
            (error) => {
                if (!active) return

                console.error('Erro ao carregar coleção:', error)

                setState({
                    collectionId,
                    collection: null,
                    error,
                })
            }
        )

        return () => {
            active = false
            unsubscribe()
        }
    }, [collectionId])

    const isCurrentCollection = Boolean(
        collectionId && state?.collectionId === collectionId
    )

    const collection = isCurrentCollection
        ? (state?.collection ?? null)
        : null

    const loading = Boolean(
        collectionId && !isCurrentCollection
    )

    const error = isCurrentCollection
        ? (state?.error ?? null)
        : null

    return {
        collection,
        loading,
        error,
        user,
    }
}
