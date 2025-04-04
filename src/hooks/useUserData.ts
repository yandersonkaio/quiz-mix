import { useEffect, useState } from 'react';
import { auth, db } from '../db/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { User, signOut } from 'firebase/auth';

interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: string;
    lastLogin: string;
}

export const useUserData = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const saveUserData = async (firebaseUser: User) => {
        try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const userData: UserData = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                };
                await setDoc(userRef, userData);
            } else {
                await setDoc(
                    userRef,
                    { lastLogin: new Date().toISOString() },
                    { merge: true }
                );
            }
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Erro ao deslogar:', error);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (isMounted) {
                setUser(firebaseUser);
                if (firebaseUser) {
                    await saveUserData(firebaseUser);
                }
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return { user, loading, logout: handleLogout };
};