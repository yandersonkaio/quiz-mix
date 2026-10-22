
import { useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import {
    Check,
    FolderOpen,
    FolderPlus,
    LoaderCircle,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import { useCollectionSections } from '@/hooks/useCollectionSections'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'

const desktopQuery = '(min-width: 768px)'

function subscribeToViewport(callback: () => void) {
    const mediaQuery = window.matchMedia(desktopQuery)
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
}

function isDesktopViewport() {
    return typeof window !== 'undefined' && window.matchMedia(desktopQuery).matches
}

function isServerViewport() {
    return true
}

interface ManageSectionsModalProps {
    isOpen: boolean
    onClose: () => void
    collectionId: string
}

interface ManageSectionsContentProps {
    onClose: () => void
    collectionId: string
}

function ManageSectionsContent({
    onClose,
    collectionId,
}: ManageSectionsContentProps) {
    const {
        sections,
        addSection,
        updateSection,
        removeSection,
        operationLoading,
    } = useCollectionSections(collectionId)

    const [sectionName, setSectionName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const isBusy = isSaving || operationLoading
    const isEditing = editingId !== null
    const isDesktop = useSyncExternalStore(
        subscribeToViewport,
        isDesktopViewport,
        isServerViewport
    )

    const resetForm = () => {
        setSectionName('')
        setEditingId(null)
    }

    const handleClose = () => {
        if (!isBusy) {
            onClose()
        }
    }

    const handleSave = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (isBusy) return

        const name = sectionName.trim()

        if (!name) {
            toast.error('Informe o nome da seção.')
            return
        }

        setIsSaving(true)

        try {
            if (editingId) {
                await updateSection(editingId, name)
                toast.success('Seção atualizada.')
            } else {
                await addSection(name)
                toast.success('Seção criada.')
            }

            resetForm()
        } catch (error) {
            console.error('Erro ao salvar seção:', error)
            toast.error('Erro ao salvar seção.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (section: { id: string; name: string }) => {
        if (isBusy) return

        setEditingId(section.id)
        setSectionName(section.name)
    }

    const handleDelete = async (sectionId: string) => {
        if (isBusy) return

        setIsSaving(true)

        try {
            await removeSection(sectionId)

            if (editingId === sectionId) {
                resetForm()
            }

            toast.success('Seção excluída.')
        } catch (error) {
            console.error('Erro ao excluir seção:', error)
            toast.error('Erro ao excluir seção.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) handleClose()
    }

    const content = (
        <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">

                <form onSubmit={handleSave} className="mb-6">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor="section-name"
                            className="text-foreground text-sm font-medium"
                        >
                            {isEditing ? 'Editar seção' : 'Nova seção'}
                        </label>

                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isBusy}
                                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancelar edição
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            id="section-name"
                            type="text"
                            value={sectionName}
                            onChange={(event) =>
                                setSectionName(event.target.value)
                            }
                            placeholder="Nome da seção"
                            disabled={isBusy}
                            required
                            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full shrink-0 sm:w-auto sm:min-w-0 sm:flex-1 rounded-xl border px-4 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />

                        <button
                            type="submit"
                            disabled={isBusy}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isBusy ? (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : isEditing ? (
                                <Check size={17} aria-hidden="true" />
                            ) : (
                                <Plus size={17} aria-hidden="true" />
                            )}

                            {isBusy
                                ? 'Salvando...'
                                : isEditing
                                    ? 'Salvar'
                                    : 'Adicionar'}
                        </button>
                    </div>
                </form>

                <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-foreground text-sm font-semibold">
                            Seções da coleção
                        </h3>

                        <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-medium">
                            {sections.length}{' '}
                            {sections.length === 1 ? 'seção' : 'seções'}
                        </span>
                    </div>

                    {sections.length === 0 ? (
                        <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed px-5 py-10 text-center">
                            <div className="bg-muted text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-xl">
                                <FolderPlus
                                    size={25}
                                    strokeWidth={1.7}
                                    aria-hidden="true"
                                />
                            </div>

                            <h4 className="text-foreground text-sm font-semibold">
                                Nenhuma seção criada
                            </h4>

                            <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
                                Crie sua primeira seção para organizar
                                os quizzes desta coleção.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sections.map((section) => {
                                const isCurrentEditing = editingId === section.id

                                return (
                                    <div
                                        key={section.id}
                                        className={`flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${isCurrentEditing
                                            ? 'border-ring/50 bg-accent/40'
                                            : 'border-border bg-muted/30 hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
                                                <FolderOpen
                                                    size={18}
                                                    strokeWidth={1.8}
                                                    aria-hidden="true"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-foreground truncate text-sm font-medium">
                                                    {section.name}
                                                </p>

                                                {isCurrentEditing && (
                                                    <p className="text-muted-foreground mt-1 text-xs">
                                                        Em edição
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(section)}
                                                disabled={isBusy}
                                                aria-label={`Editar seção ${section.name}`}
                                                title="Editar seção"
                                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Pencil
                                                    size={17}
                                                    strokeWidth={1.8}
                                                    aria-hidden="true"
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(section.id)}
                                                disabled={isBusy}
                                                aria-label={`Excluir seção ${section.name}`}
                                                title="Excluir seção"
                                                className="text-destructive hover:bg-destructive/10 focus-visible:ring-ring flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Trash2
                                                    size={17}
                                                    strokeWidth={1.8}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    )

    if (isDesktop) {
        return (
            <Dialog open onOpenChange={handleOpenChange}>
                <DialogContent
                    aria-busy={isBusy}
                    className="flex max-h-[calc(100dvh-3rem)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0"
                    onEscapeKeyDown={(event) => {
                        if (isBusy) event.preventDefault()
                    }}
                    onInteractOutside={(event) => {
                        if (isBusy) event.preventDefault()
                    }}
                >
                    <DialogHeader className="border-border flex shrink-0 flex-row items-center gap-3 border-b px-5 py-4 pr-12 text-left sm:px-6 sm:pr-12">
                        <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                            <FolderOpen size={20} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                                Gerenciar seções
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
                                Organize os quizzes da coleção em seções.
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open onOpenChange={handleOpenChange} dismissible={!isBusy}>
            <DrawerContent
                aria-busy={isBusy}
                className="flex max-h-[92dvh] flex-col overflow-hidden p-0"
            >
                <DrawerHeader className="border-border flex shrink-0 flex-row items-center gap-3 border-b px-5 pt-5 pb-4 text-left">
                    <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                        <FolderOpen size={20} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <DrawerTitle className="text-foreground text-lg font-semibold tracking-tight">
                            Gerenciar seções
                        </DrawerTitle>
                        <DrawerDescription className="text-muted-foreground mt-1 text-xs leading-relaxed">
                            Organize os quizzes da coleção em seções.
                        </DrawerDescription>
                    </div>
                </DrawerHeader>
                {content}
            </DrawerContent>
        </Drawer>
    )
}

export default function ManageSectionsModal({
    isOpen,
    onClose,
    collectionId,
}: ManageSectionsModalProps) {
    if (!isOpen) return null

    return (
        <ManageSectionsContent
            key={collectionId}
            onClose={onClose}
            collectionId={collectionId}
        />
    )
}
