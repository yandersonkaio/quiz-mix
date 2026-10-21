
import {
    Compass,
    FolderTree,
    ListChecks,
    LogIn,
    LogOut,
    UserRound,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'

import LogoSmall from '../assets/logo-small.svg'
import { useAuth } from '../contexts/AuthContext'
import { ThemeSelector } from './ThemeSelector'

const navigation = [
    { to: '/', label: 'Explorar', icon: Compass },
    { to: '/my-quizzes', label: 'Meus quizzes', icon: ListChecks },
    { to: '/my-collections', label: 'Minhas coleções', icon: FolderTree },
]

export function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Header - logout error:', error)
        }
    }

    return (
        <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
                {/* Logo */}
                <Link
                    to="/"
                    className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="bg-primary/10 ring-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                        <img
                            src={LogoSmall}
                            alt=""
                            className="size-8 object-contain"
                        />
                    </div>

                    <div className="flex min-w-0 flex-col">
                        <span className="text-foreground text-lg leading-tight font-semibold">
                            QuizMix
                        </span>

                        <span className="text-muted-foreground hidden truncate text-xs sm:block">
                            Crie, compartilhe e aprenda
                        </span>
                    </div>
                </Link>

                {/* Navegação desktop */}
                <nav
                    aria-label="Navegação principal"
                    className="hidden items-center gap-1 lg:flex"
                >
                    {navigation.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`
                            }
                        >
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Ações */}
                <div className="flex shrink-0 items-center gap-2">
                    <ThemeSelector />

                    {user ? (
                        <details className="group relative">
                            <summary
                                className="border-border hover:bg-accent flex size-10 cursor-pointer list-none items-center justify-center rounded-full border transition-colors [&::-webkit-details-marker]:hidden"
                                aria-label="Abrir menu da conta"
                            >
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Foto de perfil"
                                        className="size-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <UserRound
                                        size={20}
                                        className="text-muted-foreground"
                                    />
                                )}
                            </summary>

                            <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 w-60 rounded-xl border p-2 shadow-lg">
                                <div className="border-border border-b px-3 py-2">
                                    <p className="truncate text-sm font-medium">
                                        {user.displayName || 'Usuário'}
                                    </p>

                                    <p className="text-muted-foreground truncate text-xs">
                                        {user.email}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="hover:bg-accent flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
                                >
                                    <LogOut size={17} />
                                    Sair
                                </button>
                            </div>
                        </details>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors"
                        >
                            <LogIn size={17} />
                            <span className="hidden sm:inline">Entrar</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
