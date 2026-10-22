
import { Check, Coffee, Flower2, Leaf, Moon, Palette, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { type Theme, useTheme } from '@/contexts/ThemeContext'

const themes = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'mocha', label: 'Mocha', icon: Coffee },
    { id: 'forest', label: 'Floresta', icon: Leaf },
    { id: 'pink', label: 'Rosa', icon: Flower2 },
] as const

export function ThemeSelector() {
    const { theme, setTheme } = useTheme()

    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        function handleClickOutside(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false)
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false)
            }
        }

        document.addEventListener('pointerdown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('pointerdown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [open])

    function selectTheme(value: Theme) {
        setTheme(value)
        setOpen(false)
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-label="Alterar tema"
                aria-expanded={open}
                aria-controls="theme-options"
                aria-haspopup="menu"
                className={`text-foreground focus-visible:outline-ring flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${open
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
            >
                <Palette className="h-5 w-5" />
            </button>

            {open && (
                <div
                    id="theme-options"
                    role="menu"
                    aria-label="Aparência"
                    className="border-border bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute right-0 z-50 mt-2 w-52 origin-top-right overflow-hidden rounded-xl border shadow-lg motion-reduce:animate-none"
                >
                    <div className="border-border text-muted-foreground flex items-center gap-1.5 border-b px-3 py-2 text-[10px] font-semibold tracking-wider uppercase">
                        <span className="bg-primary size-1.5 rounded-full" />
                        Aparência
                    </div>

                    <div className="p-1.5" role="none">
                        {themes.map((item) => {
                            const Icon = item.icon
                            const selected = theme === item.id

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={selected}
                                    onClick={() => selectTheme(item.id)}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors ${selected
                                        ? 'bg-primary/10 text-foreground font-medium'
                                        : 'hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon
                                            className={`h-4 w-4 ${selected
                                                ? 'text-primary'
                                                : 'text-muted-foreground'
                                                }`}
                                        />

                                        {item.label}
                                    </span>

                                    {selected && (
                                        <Check className="text-primary h-4 w-4 shrink-0" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
