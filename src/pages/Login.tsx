
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { signInWithPopup } from 'firebase/auth'

import { auth, googleProvider } from '../db/firebase'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Loading'
import Logo from '../assets/logo.svg'

export default function Login() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user, loading } = useAuth()

    const rawRedirectTo = searchParams.get('redirectTo')
    const redirectTo =
        rawRedirectTo &&
            rawRedirectTo.startsWith('/') &&
            !rawRedirectTo.startsWith('//')
            ? rawRedirectTo
            : '/'

    useEffect(() => {
        if (!loading && user) {
            navigate(redirectTo, { replace: true })
        }
    }, [loading, user, navigate, redirectTo])

    const handleGoogleLogin = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.error(
                'Login - error during Google login:',
                (error as Error).message
            )
        }
    }

    if (loading || user) {
        return <Loading />
    }

    return (
        <main className="bg-background text-foreground flex min-h-dvh w-full items-center justify-center px-4 py-8 sm:px-6">
            <div className="w-full max-w-md">
                <div className="border-border bg-card text-card-foreground rounded-2xl border p-6 sm:p-10">
                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <img
                            src={Logo}
                            alt="QuizMix"
                            className="h-24 w-52 max-w-full object-contain"
                        />
                    </div>

                    {/* Cabeçalho */}
                    <div className="mb-8 text-center">
                        <h1 className="text-foreground text-2xl font-bold tracking-tight">
                            Acesse sua conta
                        </h1>

                        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                            Seja bem-vindo! Entre com sua conta Google
                            para continuar.
                        </p>
                    </div>

                    {/* Autenticação */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex h-12 w-full items-center justify-center gap-3 rounded-xl border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <svg
                            className="size-5 shrink-0"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
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
                        </svg>

                        <span>Continuar com o Google</span>
                    </button>
                </div>

                {/* Rodapé */}
                <p className="text-muted-foreground mt-6 text-center text-xs">
                    QuizMix — Crie, compartilhe e aprenda.
                </p>
            </div>
        </main>
    )
}
