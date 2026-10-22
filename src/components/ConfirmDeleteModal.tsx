
import { AlertTriangle, LoaderCircle, Trash2, X } from 'lucide-react'

interface ConfirmDeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    isLoading?: boolean
}

export function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Exclusão',
    message = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    isLoading = false,
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]">
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-description"
                aria-busy={isLoading}
                className="border-border bg-card text-card-foreground w-full max-w-sm rounded-2xl border p-5 shadow-2xl sm:p-6"
            >
                {/* Ícone */}
                <div className="bg-destructive/10 text-destructive mb-5 flex size-12 items-center justify-center rounded-xl">
                    <AlertTriangle
                        size={23}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </div>

                {/* Conteúdo */}
                <div className="mb-6">
                    <h2
                        id="confirm-delete-title"
                        className="text-foreground text-lg font-semibold tracking-tight"
                    >
                        {title}
                    </h2>

                    <p
                        id="confirm-delete-description"
                        className="text-muted-foreground mt-2 text-sm leading-relaxed"
                    >
                        {message}
                    </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={16} strokeWidth={2} />
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-destructive hover:bg-destructive/90 focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? (
                            <>
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <Trash2
                                    size={17}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
                                Excluir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
