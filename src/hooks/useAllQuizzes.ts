
import { useEffect, useState } from 'react'
import {
    collection,
    query,
    onSnapshot,
    orderBy,
    getDocs,
    doc,
    getDoc,
} from 'firebase/firestore'

import { db } from '../db/firebase'
import type { Quiz } from '../types/quiz'

interface AllQuizzesState {
    allQuizzes: Quiz[]
    loading: boolean
    error: Error | null
}

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

export const useAllQuizzes = () => {
    const [state, setState] = useState<AllQuizzesState>({
        allQuizzes: [],
        loading: true,
        error: null,
    })

    useEffect(() => {
        let active = true
        let snapshotVersion = 0

        const quizzesQuery = query(
            collection(db, 'quizzes'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(
            quizzesQuery,
            async (querySnapshot) => {
                const currentVersion = ++snapshotVersion

                try {
                    const quizzesData = await Promise.all(
                        querySnapshot.docs.map(async (quizDoc) => {
                            const quizData = quizDoc.data()

                            const questionsQuery = collection(
                                db,
                                `quizzes/${quizDoc.id}/questions`
                            )

                            const questionsSnapshot = await getDocs(
                                questionsQuery
                            )

                            const questionCount = questionsSnapshot.size

                            const creator = await fetchUserData(
                                quizData.userId
                            )

                            return {
                                id: quizDoc.id,
                                ...quizData,
                                questionCount,
                                creator,
                            } as Quiz
                        })
                    )

                    if (
                        !active ||
                        currentVersion !== snapshotVersion
                    ) {
                        return
                    }

                    setState({
                        allQuizzes: quizzesData,
                        loading: false,
                        error: null,
                    })
                } catch (error) {
                    if (
                        !active ||
                        currentVersion !== snapshotVersion
                    ) {
                        return
                    }

                    console.error('Erro ao buscar quizzes:', error)

                    setState((prev) => ({
                        ...prev,
                        loading: false,
                        error:
                            error instanceof Error
                                ? error
                                : new Error('Erro ao buscar quizzes.'),
                    }))
                }
            },
            (error) => {
                if (!active) return

                snapshotVersion++

                console.error(
                    'Erro ao buscar todos os quizzes:',
                    error
                )

                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error,
                }))
            }
        )

        return () => {
            active = false
            unsubscribe()
        }
    }, [])

    return {
        allQuizzes: state.allQuizzes,
        loading: state.loading,
        error: state.error,
    }
}
