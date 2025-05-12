import React, { useEffect } from 'react';
import { auth, googleProvider } from '../db/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/logo.svg';
import Loading from '../components/Loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading } = useAuth();

    const rawRedirectTo = searchParams.get('redirectTo');
    const redirectTo = rawRedirectTo && rawRedirectTo.startsWith('/') ? rawRedirectTo : '/';

    useEffect(() => {
        if (!loading && user) {
            navigate(redirectTo, { replace: true });
        }
    }, [loading, user, navigate, redirectTo]);

    const handleGoogleLogin = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error('Login - error during Google login:', (error as Error).message);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-200">
            <Card className="max-w-md w-full border-border p-8 animate-fadeIn">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <img src={Logo} className="w-52 h-24" alt="Logo" />
                    </div>
                    <CardTitle className="text-xl font-semibold">Acesse sua conta</CardTitle>
                    <CardDescription className="text-sm">
                        Seja bem-vindo! Por favor, entre para continuar
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2"
                        variant="outline"
                    >
                        <svg
                            className="w-5 h-5"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6z"
                            />
                            <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        Entrar com o Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;