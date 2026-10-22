
import { useEffect, useState, type ReactNode } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged, type User } from 'firebase/auth'

import { auth, db } from '../db/firebase'
import { AuthContext } from './AuthContext'

interface UserData {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
    createdAt: string
    lastLogin: string
}

const saveUserData = async (firebaseUser: User) => {
    try {
        const userRef = doc(db, 'users', firebaseUser.uid)
        const userSnap = await getDoc(userRef)

        if (!userSnap.exists()) {
            const userData: UserData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
            }

            await setDoc(userRef, userData)
        } else {
            await setDoc(
                userRef,
                { lastLogin: new Date().toISOString() },
                { merge: true }
            )
        }
    } catch (error) {
        console.error('AuthProvider - error saving user data:', error)
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)

            if (currentUser) {
                void saveUserData(currentUser)
            }
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const logout = async () => {
        try {
            await auth.signOut()
        } catch (error) {
            console.error('AuthProvider - logout error:', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
