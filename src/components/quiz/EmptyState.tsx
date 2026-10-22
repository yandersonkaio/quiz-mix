
import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
    title: string
    description: string
    icon?: ReactNode
    action?: ReactNode
}

export function EmptyState({
    title,
    description,
    icon,
    action,
}: EmptyStateProps) {
    return (
        <div className="border-border bg-card text-card-foreground mx-auto flex w-full max-w-2xl flex-col items-center rounded-xl border px-6 py-12 text-center sm:py-16">
            {/* Ícone */}
            <div className="bg-muted text-muted-foreground mb-5 flex size-16 shrink-0 items-center justify-center rounded-2xl">
                {icon ?? (
                    <Inbox
                        size={30}
                        strokeWidth={1.5}
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Conteúdo */}
            <div className="flex max-w-md flex-col items-center gap-2">
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                    {title}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    {description}
                </p>
            </div>

            {/* Ação opcional */}
            {action && (
                <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-3">
                    {action}
                </div>
            )}
        </div>
    )
}
