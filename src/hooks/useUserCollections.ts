
import { useEffect, useState } from 'react'
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
} from 'firebase/firestore'

import { db } from '../db/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { QuizCollection } from '../types/quiz'

interface UserCollectionsState {
    userId: string | null
    collections: QuizCollection[]
    error: Error | null
}

export const useUserCollections = () => {
    const { user } = useAuth()
    const userId = user?.uid ?? null

    const [state, setState] = useState<UserCollectionsState>({
        userId: null,
        collections: [],
        error: null,
    })

    useEffect(() => {
        if (!userId) return

        let active = true
        let snapshotVersion = 0

        const createdQuery = query(
            collection(db, 'collections'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(
            createdQuery,
            async (snapshot) => {
                const currentVersion = ++snapshotVersion

                try {
                    const created = await Promise.all(
                        snapshot.docs.map(async (collectionDoc) => {
                            const collectionData = collectionDoc.data()

                            const quizzesSnap = await getDocs(
                                collection(
                                    db,
                                    'collections',
                                    collectionDoc.id,
                                    'quizItems'
                                )
                            )

                            const sectionsSnap = await getDocs(
                                collection(
                                    db,
                                    'collections',
                                    collectionDoc.id,
                                    'sections'
                                )
                            )

                            let creator = null

                            if (collectionData.userId) {
                                const userSnap = await getDoc(
                                    doc(
                                        db,
                                        'users',
                                        collectionData.userId
                                    )
                                )

                                if (userSnap.exists()) {
                                    const userData = userSnap.data()

                                    creator = {
                                        name: userData.displayName,
                                        photoURL: userData.photoURL,
                                    }
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
                            } as QuizCollection
                        })
                    )

                    const favoritesQuery = query(
                        collectionGroup(db, 'favorites'),
                        where('userId', '==', userId)
                    )

                    const favoritesSnap = await getDocs(favoritesQuery)

                    const favorites = await Promise.all(
                        favoritesSnap.docs.map(async (favoriteDoc) => {
                            const collectionId =
                                favoriteDoc.ref.parent.parent?.id

                            if (!collectionId) {
                                return null
                            }

                            const collectionRef = doc(
                                db,
                                'collections',
                                collectionId
                            )

                            const collectionSnap = await getDoc(collectionRef)

                            if (!collectionSnap.exists()) {
                                return null
                            }

                            const collectionData = collectionSnap.data()

                            const quizzesSnap = await getDocs(
                                collection(
                                    db,
                                    'collections',
                                    collectionId,
                                    'quizItems'
                                )
                            )

                            const sectionsSnap = await getDocs(
                                collection(
                                    db,
                                    'collections',
                                    collectionId,
                                    'sections'
                                )
                            )

                            let creator = null

                            if (collectionData.userId) {
                                const userSnap = await getDoc(
                                    doc(
                                        db,
                                        'users',
                                        collectionData.userId
                                    )
                                )

                                if (userSnap.exists()) {
                                    const userData = userSnap.data()

                                    creator = {
                                        name: userData.displayName,
                                        photoURL: userData.photoURL,
                                    }
                                }
                            }

                            return {
                                id: collectionSnap.id,
                                ...collectionData,
                                creator,
                                quizCount: quizzesSnap.size,
                                sectionCount: sectionsSnap.size,
                                isOwner:
                                    userId === collectionData.userId,
                                isFavorite: true,
                            } as QuizCollection
                        })
                    )

                    const favoriteList = favorites.filter(
                        (item): item is QuizCollection => item !== null
                    )

                    const map = new Map<string, QuizCollection>()

                    created.forEach((item) => {
                        map.set(item.id, item)
                    })

                    favoriteList.forEach((item) => {
                        if (!map.has(item.id)) {
                            map.set(item.id, item)
                        }
                    })

                    if (!active || currentVersion !== snapshotVersion) {
                        return
                    }

                    setState({
                        userId,
                        collections: Array.from(map.values()),
                        error: null,
                    })
                } catch (error) {
                    if (!active || currentVersion !== snapshotVersion) {
                        return
                    }

                    console.error(
                        'Erro ao buscar coleções do usuário:',
                        error
                    )

                    setState({
                        userId,
                        collections: [],
                        error:
                            error instanceof Error
                                ? error
                                : new Error('Erro ao buscar coleções.'),
                    })
                }
            },
            (error) => {
                if (!active) return

                snapshotVersion++

                console.error(
                    'Erro ao buscar coleções do usuário:',
                    error
                )

                setState({
                    userId,
                    collections: [],
                    error,
                })
            }
        )

        return () => {
            active = false
            unsubscribe()
        }
    }, [userId])

    const isCurrentUser = state.userId === userId

    const collections =
        userId && isCurrentUser ? state.collections : []

    const loading = Boolean(userId && !isCurrentUser)

    const error = isCurrentUser ? state.error : null

    return {
        collections,
        loading,
        error,
        user,
    }
}
