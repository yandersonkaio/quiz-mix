import {
    Compass,
    FileQuestion,
    Library,
} from 'lucide-react'
import { Link, NavLink } from 'react-router'

import Logo from '../assets/logo.svg'
import { ThemeSelector } from './ThemeSelector'
import { UserMenu } from './UserMenu'

interface HeaderProps {
    minimal?: boolean
}

const navigation = [
    { to: '/', label: 'Explorar', icon: Compass },
    { to: '/my-quizzes', label: 'Meus quizzes', icon: FileQuestion },
    { to: '/my-collections', label: 'Minhas coleções', icon: Library },
]

export function Header({ minimal = false }: HeaderProps) {
    return (
        <header className="border-border bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
                <Link
                    to="/"
                    className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="bg-primary/10 ring-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl ring-1">
                        <span
                            aria-hidden="true"
                            className="bg-foreground block size-8"
                            style={{
                                maskImage: `url("${Logo}")`,
                                WebkitMaskImage: `url("${Logo}")`,
                                maskSize: 'contain',
                                WebkitMaskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskPosition: 'center',
                            }}
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

                {!minimal && (
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
                                    `group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary ring-primary/20 font-semibold ring-1'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground font-medium'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            size={16}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className="transition-transform duration-200 group-hover:scale-105"
                                        />

                                        <span>{label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                )}

                <div className="flex shrink-0 items-center gap-2">
                    <ThemeSelector />

                    {!minimal && <UserMenu />}
                </div>
            </div>
        </header>
    )
}
