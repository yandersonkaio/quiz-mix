
import { useEffect, useState } from 'react'
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    getDocs,
    doc,
    getDoc,
} from 'firebase/firestore'

import { db } from '../db/firebase'
import { useAuth } from '../contexts/AuthContext'
import type { Quiz, QuizUser } from '../types/quiz'

interface UserQuizzesState {
    userId: string | null
    quizzes: Quiz[]
    error: Error | null
}

const fetchUserData = async (userId: string): Promise<QuizUser> => {
    try {
        const userRef = doc(db, 'users', userId)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
            const userData = userSnap.data()

            return {
                id: userSnap.id,
                name: userData.displayName || 'Usuário desconhecido',
                photoUrl: userData.photoURL || null,
            }
        }

        return {
            id: userId,
            name: 'Usuário desconhecido',
            photoUrl: undefined,
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error)

        return {
            id: userId,
            name: 'Usuário desconhecido',
            photoUrl: undefined,
        }
    }
}

export const useUserQuizzes = () => {
    const { user } = useAuth()
    const userId = user?.uid ?? null

    const [state, setState] = useState<UserQuizzesState>({
        userId: null,
        quizzes: [],
        error: null,
    })

    useEffect(() => {
        if (!userId) return

        let active = true
        let snapshotVersion = 0

        const quizzesQuery = query(
            collection(db, 'quizzes'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(
            quizzesQuery,
            async (querySnapshot) => {
                const currentVersion = ++snapshotVersion

                try {
                    const quizzesData = await Promise.all(
                        querySnapshot.docs.map(async (quizDoc) => {
                            const questionsQuery = collection(
                                db,
                                `quizzes/${quizDoc.id}/questions`
                            )

                            const questionsSnapshot = await getDocs(
                                questionsQuery
                            )

                            const questionCount = questionsSnapshot.size

                            const creator = await fetchUserData(
                                quizDoc.data().userId
                            )

                            return {
                                id: quizDoc.id,
                                ...quizDoc.data(),
                                questionCount,
                                creator,
                            } as Quiz
                        })
                    )

                    if (!active || currentVersion !== snapshotVersion) {
                        return
                    }

                    setState({
                        userId,
                        quizzes: quizzesData,
                        error: null,
                    })
                } catch (error) {
                    if (!active || currentVersion !== snapshotVersion) {
                        return
                    }

                    console.error('Erro ao buscar dados:', error)

                    setState({
                        userId,
                        quizzes: [],
                        error:
                            error instanceof Error
                                ? error
                                : new Error('Erro ao buscar quizzes.'),
                    })
                }
            },
            (error) => {
                if (!active) return

                snapshotVersion++

                console.error(
                    'Erro ao buscar quizzes do usuário:',
                    error
                )

                setState({
                    userId,
                    quizzes: [],
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

    const userQuizzes =
        userId && isCurrentUser ? state.quizzes : []

    const loading = Boolean(userId && !isCurrentUser)

    const error = isCurrentUser ? state.error : null

    return {
        userQuizzes,
        loading,
        error,
        user,
    }
}
