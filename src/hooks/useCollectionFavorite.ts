
import { useEffect, useRef, useState } from 'react'
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore'

import { db } from '../db/firebase'
import { useAuth } from '../contexts/AuthContext'

interface FavoriteState {
    collectionId: string
    userId: string
    isFavorite: boolean
}

export function useCollectionFavorite(collectionId?: string) {
    const { user } = useAuth()
    const userId = user?.uid

    const [favoriteState, setFavoriteState] =
        useState<FavoriteState | null>(null)

    const [operationLoading, setOperationLoading] = useState(false)

    const requestVersionRef = useRef(0)

    useEffect(() => {
        if (!collectionId || !userId) return

        let active = true
        const currentVersion = ++requestVersionRef.current

        const loadFavorite = async () => {
            try {
                const favoriteRef = doc(
                    db,
                    'collections',
                    collectionId,
                    'favorites',
                    userId
                )

                const snap = await getDoc(favoriteRef)

                if (!active || currentVersion !== requestVersionRef.current) {
                    return
                }

                setFavoriteState({
                    collectionId,
                    userId,
                    isFavorite: snap.exists(),
                })
            } catch (error) {
                if (!active || currentVersion !== requestVersionRef.current) {
                    return
                }

                console.error('Erro ao carregar favorito:', error)

                setFavoriteState({
                    collectionId,
                    userId,
                    isFavorite: false,
                })
            }
        }

        void loadFavorite()

        return () => {
            active = false
        }
    }, [collectionId, userId])

    const isCurrentFavorite =
        favoriteState !== null &&
        favoriteState.collectionId === collectionId &&
        favoriteState.userId === userId

    const isFavorite =
        isCurrentFavorite && favoriteState?.isFavorite === true

    const loading = Boolean(
        collectionId && userId && !isCurrentFavorite
    )

    async function favoriteCollection() {
        if (!collectionId || !userId || operationLoading) return

        setOperationLoading(true)

        try {
            await setDoc(
                doc(
                    db,
                    'collections',
                    collectionId,
                    'favorites',
                    userId
                ),
                {
                    userId,
                    createdAt: serverTimestamp(),
                }
            )

            requestVersionRef.current++

            setFavoriteState({
                collectionId,
                userId,
                isFavorite: true,
            })
        } finally {
            setOperationLoading(false)
        }
    }

    async function unfavoriteCollection() {
        if (!collectionId || !userId || operationLoading) return

        setOperationLoading(true)

        try {
            await deleteDoc(
                doc(
                    db,
                    'collections',
                    collectionId,
                    'favorites',
                    userId
                )
            )

            requestVersionRef.current++

            setFavoriteState({
                collectionId,
                userId,
                isFavorite: false,
            })
        } finally {
            setOperationLoading(false)
        }
    }

    async function toggleFavorite() {
        if (operationLoading) return

        if (isFavorite) {
            await unfavoriteCollection()
        } else {
            await favoriteCollection()
        }
    }

    return {
        isFavorite,
        loading,
        operationLoading,
        favoriteCollection,
        unfavoriteCollection,
        toggleFavorite,
    }
}
