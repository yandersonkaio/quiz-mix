import { Compass, FileQuestion, Library } from 'lucide-react'
import { NavLink } from 'react-router'

const navigation = [
    {
        to: '/',
        label: 'Explorar',
        icon: Compass,
    },
    {
        to: '/my-quizzes',
        label: 'Quizzes',
        icon: FileQuestion,
    },
    {
        to: '/my-collections',
        label: 'Coleções',
        icon: Library,
    },
]

export function BottomBar() {
    return (
        <nav
            aria-label="Navegação inferior"
            className="border-border bg-card/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
            <div className="mx-auto grid h-16 max-w-lg grid-cols-3 items-center px-2">
                {navigation.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `group flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 transition-colors ${isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div
                                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 ${isActive
                                            ? 'bg-primary/10 ring-primary/20 ring-1'
                                            : 'group-hover:bg-accent'
                                        }`}
                                >
                                    <Icon
                                        size={21}
                                        strokeWidth={isActive ? 2.5 : 1.8}
                                        className={`transition-transform duration-200 ${isActive
                                                ? 'scale-105'
                                                : 'group-hover:scale-105'
                                            }`}
                                    />
                                </div>

                                <span
                                    className={`max-w-full truncate text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'
                                        }`}
                                >
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    )
}