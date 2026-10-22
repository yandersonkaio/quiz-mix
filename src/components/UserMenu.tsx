import { useEffect, useRef } from 'react'
import { LogIn, LogOut, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'

import { useAuth } from '../contexts/AuthContext'

export function UserMenu() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const menuRef = useRef<HTMLDetailsElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: PointerEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                menuRef.current.open = false
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && menuRef.current) {
                menuRef.current.open = false
            }
        }

        document.addEventListener('pointerdown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('UserMenu - logout error:', error)
        }
    }

    if (!user) {
        return (
            <Link
                to="/login"
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors"
            >
                <LogIn size={17} />
                <span className="hidden sm:inline">Entrar</span>
            </Link>
        )
    }

    return (
        <details ref={menuRef} className="group relative">
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

            <div className="border-border bg-popover text-popover-foreground absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border p-2 shadow-lg">
                <div className="border-border border-b px-3 py-3">
                    <p className="truncate text-sm font-semibold">
                        {user.displayName || 'Usuário'}
                    </p>

                    <p className="text-muted-foreground mt-1 truncate text-xs">
                        {user.email}
                    </p>
                </div>

                <div className="py-1">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-foreground hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
                    >
                        <LogOut size={17} />
                        Sair
                    </button>
                </div>
            </div>
        </details>
    )
}
