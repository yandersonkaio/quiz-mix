
import { useEffect, useState } from 'react'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    deleteDoc,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore'

import { db } from '../db/firebase'
import type { CollectionQuiz } from '../types/quiz'

interface CollectionQuizzesState {
    collectionId: string
    quizzes: CollectionQuiz[]
}

const EMPTY_QUIZZES: CollectionQuiz[] = []

const fetchUserData = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
            return {
                id: userSnap.id,
                name:
                    userSnap.data().displayName ||
                    'Usuário desconhecido',
                photoUrl: userSnap.data().photoURL || null,
            }
        }

        return {
            id: userId,
            name: 'Usuário desconhecido',
            photoUrl: null,
        }
    } catch (error) {
        console.error('Error fetching user data:', error)

        return {
            id: userId,
            name: 'Usuário',
            photoUrl: null,
        }
    }
}

export function useCollectionQuizzes(collectionId?: string) {
    const [state, setState] = useState<CollectionQuizzesState | null>(
        null
    )

    const [operationLoading, setOperationLoading] = useState(false)

    useEffect(() => {
        if (!collectionId) return

        let active = true
        let snapshotVersion = 0

        const quizzesQuery = query(
            collection(db, 'collections', collectionId, 'quizItems'),
            orderBy('order')
        )

        const unsubscribe = onSnapshot(
            quizzesQuery,
            async (snapshot) => {
                const currentVersion = ++snapshotVersion

                try {
                    const quizList = await Promise.all(
                        snapshot.docs.map(async (item) => {
                            const data = item.data()

                            const quizSnap = await getDoc(
                                doc(db, 'quizzes', data.quizId)
                            )

                            if (!quizSnap.exists()) {
                                return null
                            }

                            const quizData = quizSnap.data()

                            const questionsSnapshot = await getDocs(
                                collection(
                                    db,
                                    'quizzes',
                                    data.quizId,
                                    'questions'
                                )
                            )

                            const questionCount = questionsSnapshot.size

                            let creator = quizData.creator || null

                            if (!creator && quizData.userId) {
                                creator = await fetchUserData(quizData.userId)
                            }

                            return {
                                id: quizSnap.id,
                                collectionItemId: item.id,
                                sectionId: data.sectionId ?? null,
                                order: data.order ?? 0,
                                ...quizData,
                                questionCount,
                                creator,
                            } as CollectionQuiz
                        })
                    )

                    if (!active || currentVersion !== snapshotVersion) {
                        return
                    }

                    const validQuizzes = quizList.filter(
                        (quiz): quiz is CollectionQuiz => quiz !== null
                    )

                    setState({
                        collectionId,
                        quizzes: validQuizzes,
                    })
                } catch (error) {
                    if (!active || currentVersion !== snapshotVersion) {
                        return
                    }

                    console.error(
                        'Erro ao carregar quizzes da coleção:',
                        error
                    )

                    setState({
                        collectionId,
                        quizzes: [],
                    })
                }
            },
            (error) => {
                if (!active) return

                snapshotVersion++

                console.error(
                    'Erro ao carregar quizzes da coleção:',
                    error
                )

                setState({
                    collectionId,
                    quizzes: [],
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

    const quizzes = isCurrentCollection
        ? state.quizzes
        : EMPTY_QUIZZES

    const loading = Boolean(collectionId && !isCurrentCollection)

    async function updateQuizSection(
        itemId: string,
        sectionId: string | null
    ) {
        if (!collectionId) return

        setOperationLoading(true)

        try {
            await updateDoc(
                doc(
                    db,
                    'collections',
                    collectionId,
                    'quizItems',
                    itemId
                ),
                {
                    sectionId,
                }
            )
        } finally {
            setOperationLoading(false)
        }
    }

    async function addQuizToCollection(
        quizId: string,
        sectionId: string | null = null
    ) {
        if (!collectionId) return

        setOperationLoading(true)

        try {
            const ref = doc(
                collection(db, 'collections', collectionId, 'quizItems')
            )

            await setDoc(ref, {
                quizId,
                sectionId,
                order: quizzes.length,
                addedAt: serverTimestamp(),
            })
        } finally {
            setOperationLoading(false)
        }
    }

    async function removeQuizFromCollection(itemId: string) {
        if (!collectionId) return

        setOperationLoading(true)

        try {
            await deleteDoc(
                doc(
                    db,
                    'collections',
                    collectionId,
                    'quizItems',
                    itemId
                )
            )
        } finally {
            setOperationLoading(false)
        }
    }

    return {
        quizzes,
        loading,
        operationLoading,
        updateQuizSection,
        addQuizToCollection,
        removeQuizFromCollection,
    }
}
