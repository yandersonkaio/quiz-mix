
import { Compass, FolderTree, ListChecks } from 'lucide-react'
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
        icon: ListChecks,
    },
    {
        to: '/my-collections',
        label: 'Coleções',
        icon: FolderTree,
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
                            `flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 transition-colors ${isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div
                                    className={`flex h-7 w-12 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-accent' : ''
                                        }`}
                                >
                                    <Icon
                                        size={21}
                                        strokeWidth={isActive ? 2.4 : 1.8}
                                    />
                                </div>

                                <span
                                    className={`truncate text-[10px] leading-none ${isActive ? 'font-semibold' : 'font-medium'
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
