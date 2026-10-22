import { useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { FolderPlus, LoaderCircle, Pencil } from 'lucide-react'

import { useCollectionData } from '../../hooks/useCollectionData'
import type { QuizCollection } from '@/types/quiz'
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

const mobileQuery = '(max-width: 767px)'

function subscribeToMobileViewport(callback: () => void) {
    const mediaQuery = window.matchMedia(mobileQuery)
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
}

function getMobileViewportSnapshot() {
    return window.matchMedia(mobileQuery).matches
}

function getServerViewportSnapshot() {
    return false
}

interface CollectionSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    collection?: Partial<QuizCollection>
    onSave?: (
        updatedCollection: Partial<QuizCollection>
    ) => Promise<void>
    isCreating?: boolean
}

interface CollectionSettingsContentProps {
    onClose: () => void
    collection?: Partial<QuizCollection>
    onSave?: (
        updatedCollection: Partial<QuizCollection>
    ) => Promise<void>
    isCreating: boolean
}

function CollectionSettingsContent({
    onClose,
    collection,
    onSave,
    isCreating,
}: CollectionSettingsContentProps) {
    const isMobile = useSyncExternalStore(
        subscribeToMobileViewport,
        getMobileViewportSnapshot,
        getServerViewportSnapshot
    )

    const navigate = useNavigate()

    const {
        user,
        createCollection,
        operationLoading,
    } = useCollectionData()

    const [formData, setFormData] = useState({
        name: collection?.name ?? '',
        description: collection?.description ?? '',
    })

    const [isSaving, setIsSaving] = useState(false)

    const isBusy = isSaving || operationLoading

    const handleClose = () => {
        if (!isBusy) {
            onClose()
        }
    }

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (isBusy) return

        if (!formData.name.trim()) {
            toast.error('O nome da coleção é obrigatório.')
            return
        }

        setIsSaving(true)

        try {
            const updatedCollection: Partial<QuizCollection> = {
                name: formData.name,
                description: formData.description,
            }

            if (isCreating) {
                if (!user?.uid) {
                    toast.error(
                        'Você precisa estar logado para criar uma coleção.'
                    )
                    return
                }

                const createdCollectionId = await createCollection({
                    name: formData.name,
                    description: formData.description,
                    userId: user.uid,
                })

                if (!createdCollectionId) {
                    throw new Error('Falha ao criar coleção.')
                }

                toast.success('Coleção criada com sucesso.')

                onClose()
                navigate(`/collections/${createdCollectionId}`)
            } else if (onSave) {
                await onSave(updatedCollection)
            }
        } catch (error) {
            console.error('Erro ao salvar coleção:', error)

            toast.error(
                `Erro ao ${isCreating ? 'criar' : 'salvar'} a coleção.`
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open && !isBusy) onClose()
    }

    const title = isCreating ? 'Criar nova coleção' : 'Editar coleção'
    const description = isCreating
        ? 'Organize seus quizzes em uma coleção.'
        : 'Atualize as informações da sua coleção.'

    const formContent = (
        <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
        >
            <div data-vaul-no-drag=""
                className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label
                            htmlFor="settings-collection-name"
                            className="text-foreground text-sm font-medium"
                        >
                            Nome da coleção
                        </label>

                        <span className="text-muted-foreground text-xs tabular-nums">
                            {formData.name.length}/50
                        </span>
                    </div>

                    <input
                        id="settings-collection-name"
                        type="text"
                        required
                        maxLength={50}
                        value={formData.name}
                        onChange={(event) =>
                            setFormData((prev) => ({
                                ...prev,
                                name: event.target.value,
                            }))
                        }
                        disabled={isBusy}
                        placeholder="Ex.: Anatomia Humana"
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-11 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div>
                    <label
                        htmlFor="settings-collection-description"
                        className="text-foreground mb-2 block text-sm font-medium"
                    >
                        Descrição
                        <span className="text-muted-foreground ml-1 font-normal">
                            (opcional)
                        </span>
                    </label>

                    <textarea
                        id="settings-collection-description"
                        rows={4}
                        value={formData.description}
                        onChange={(event) =>
                            setFormData((prev) => ({
                                ...prev,
                                description: event.target.value,
                            }))
                        }
                        disabled={isBusy}
                        placeholder="Descreva o objetivo desta coleção..."
                        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                        Uma boa descrição ajuda outras pessoas a
                        entenderem o conteúdo da coleção.
                    </p>
                </div>
            </div>

            <div className="border-border bg-card flex shrink-0 items-center justify-end gap-3 border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:pb-4">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isBusy}
                    className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isBusy}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                    {isBusy ? (
                        <>
                            <LoaderCircle
                                size={17}
                                className="animate-spin"
                                aria-hidden="true"
                            />

                            {isCreating ? 'Criando...' : 'Salvando...'}
                        </>
                    ) : isCreating ? (
                        <>
                            <FolderPlus
                                size={17}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />

                            Criar coleção
                        </>
                    ) : (
                        'Salvar'
                    )}
                </button>
            </div>
        </form>
    )

    if (isMobile) {
        return (
            <Drawer
                open={true}
                onOpenChange={handleOpenChange}
                dismissible={!isBusy}
            >
                <DrawerContent
                    aria-busy={isBusy}
                    className="border-border bg-card text-card-foreground flex max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
                >
                    <DrawerHeader className="border-border shrink-0 border-b px-5 pt-5 pb-4 text-left">
                        <div className="flex min-w-0 items-center gap-3 text-left">
                            <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                                {isCreating ? (
                                    <FolderPlus size={20} strokeWidth={1.8} aria-hidden="true" />
                                ) : (
                                    <Pencil size={19} strokeWidth={1.8} aria-hidden="true" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <DrawerTitle className="text-foreground text-left text-lg font-semibold tracking-tight">
                                    {title}
                                </DrawerTitle>
                                <DrawerDescription className="text-muted-foreground mt-1 text-left text-xs leading-relaxed">
                                    {description}
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>
                    {formContent}
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={true} onOpenChange={handleOpenChange}>
            <DialogContent
                aria-busy={isBusy}
                onEscapeKeyDown={(event) => {
                    if (isBusy) event.preventDefault()
                }}
                onPointerDownOutside={(event) => {
                    if (isBusy) event.preventDefault()
                }}
                className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-3rem)] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl"
            >
                <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pr-14 text-left sm:px-6">
                    <div className="flex min-w-0 items-center gap-3 text-left">
                        <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                            {isCreating ? (
                                <FolderPlus size={20} strokeWidth={1.8} aria-hidden="true" />
                            ) : (
                                <Pencil size={19} strokeWidth={1.8} aria-hidden="true" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-foreground text-left text-lg font-semibold tracking-tight sm:text-xl">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-left text-xs leading-relaxed sm:text-sm">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                {formContent}
            </DialogContent>
        </Dialog>
    )
}

export function CollectionSettingsModal({
    isOpen,
    onClose,
    collection,
    onSave,
    isCreating = false,
}: CollectionSettingsModalProps) {
    if (!isOpen) return null

    return (
        <CollectionSettingsContent
            key={`${isCreating ? 'create' : 'edit'}-${collection?.id ?? ''}`}
            onClose={onClose}
            collection={collection}
            onSave={onSave}
            isCreating={isCreating}
        />
    )
}
