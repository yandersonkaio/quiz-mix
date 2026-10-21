
import { CircleAlert } from 'lucide-react'

interface ErrorMessageProps {
    message: string
}

export default function ErrorMessage({
    message,
}: ErrorMessageProps) {
    return (
        <div className="bg-background text-foreground flex min-h-[60dvh] w-full items-center justify-center px-4 py-8">
            <div className="border-border bg-card flex w-full max-w-md flex-col items-center rounded-xl border px-6 py-10 text-center sm:px-8">
                {/* Ícone */}
                <div className="bg-destructive/10 text-destructive mb-5 flex size-14 items-center justify-center rounded-xl">
                    <CircleAlert
                        size={26}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </div>

                {/* Conteúdo */}
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                    Algo deu errado
                </h2>

                <p
                    role="alert"
                    className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed wrap-break-word sm:text-base"
                >
                    {message}
                </p>
            </div>
        </div>
    )
}
