
import { useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { BookOpen, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'

import { useUserQuizzes } from '../../hooks/useUserQuizzes'
import { useCollectionQuizzes } from '../../hooks/useCollectionQuizzes'
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

interface ResponsiveModalShellProps {
    children: ReactNode
    isBusy: boolean
    onClose: () => void
}

function ResponsiveModalShell({
    children,
    isBusy,
    onClose,
}: ResponsiveModalShellProps) {
    const isMobile = useSyncExternalStore(
        subscribeToMobileViewport,
        getMobileViewportSnapshot,
        getServerViewportSnapshot
    )

    const handleOpenChange = (open: boolean) => {
        if (!open && !isBusy) onClose()
    }

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
                                <BookOpen size={20} strokeWidth={1.8} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <DrawerTitle className="text-foreground text-left text-lg font-semibold tracking-tight">
                                    Gerenciar quizzes
                                </DrawerTitle>
                                <DrawerDescription className="text-muted-foreground mt-1 text-left text-xs leading-relaxed">
                                    Selecione os quizzes e organize nas seções.
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>
                    {children}
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
                className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-3rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl"
            >
                <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pr-14 text-left sm:px-6">
                    <div className="flex min-w-0 items-center gap-3 text-left">
                        <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                            <BookOpen size={20} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-foreground text-left text-lg font-semibold tracking-tight sm:text-xl">
                                Gerenciar quizzes
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-left text-xs leading-relaxed sm:text-sm">
                                Selecione os quizzes e organize nas seções.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}

interface AddQuizToCollectionModalProps {
    isOpen: boolean
    onClose: () => void
    collectionId: string
}

interface SelectedQuiz {
    quizId: string
    sectionId: string | null
}

export default function AddQuizToCollectionModal({
    isOpen,
    onClose,
    collectionId,
}: AddQuizToCollectionModalProps) {
    if (!isOpen) return null

    return (
        <OpenAddQuizToCollectionModal
            key={collectionId}
            onClose={onClose}
            collectionId={collectionId}
        />
    )
}

interface OpenModalProps {
    onClose: () => void
    collectionId: string
}

function OpenAddQuizToCollectionModal({
    onClose,
    collectionId,
}: OpenModalProps) {
    const { userQuizzes, loading } = useUserQuizzes()

    const {
        quizzes: collectionQuizzes,
        loading: collectionLoading,
        addQuizToCollection,
        updateQuizSection,
        removeQuizFromCollection,
        operationLoading,
    } = useCollectionQuizzes(collectionId)

    const { sections, loading: sectionsLoading } =
        useCollectionSections(collectionId)

    if (collectionLoading || sectionsLoading) {
        return (
            <ResponsiveModalShell isBusy={false} onClose={onClose}>
                <div
                    role="status"
                    className="flex min-h-52 flex-1 flex-col items-center justify-center gap-4 px-5 py-10"
                >
                    <LoaderCircle
                        size={26}
                        className="text-primary animate-spin"
                        aria-hidden="true"
                    />
                    <p className="text-muted-foreground text-sm">
                        Carregando quizzes da coleção...
                    </p>
                </div>
                <div className="border-border bg-card flex shrink-0 justify-end border-t px-5 py-4 sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="border-border bg-muted text-foreground hover:bg-accent inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </ResponsiveModalShell>
        )
    }

    return (
        <AddQuizToCollectionModalContent
            onClose={onClose}
            userQuizzes={userQuizzes}
            loading={loading}
            collectionQuizzes={collectionQuizzes}
            addQuizToCollection={addQuizToCollection}
            updateQuizSection={updateQuizSection}
            removeQuizFromCollection={removeQuizFromCollection}
            operationLoading={operationLoading}
            sections={sections}
        />
    )
}

interface ModalContentProps {
    onClose: () => void
    userQuizzes: ReturnType<typeof useUserQuizzes>['userQuizzes']
    loading: boolean
    collectionQuizzes: ReturnType<typeof useCollectionQuizzes>['quizzes']
    addQuizToCollection: ReturnType<typeof useCollectionQuizzes>['addQuizToCollection']
    updateQuizSection: ReturnType<typeof useCollectionQuizzes>['updateQuizSection']
    removeQuizFromCollection: ReturnType<typeof useCollectionQuizzes>['removeQuizFromCollection']
    operationLoading: boolean
    sections: ReturnType<typeof useCollectionSections>['sections']
}

function AddQuizToCollectionModalContent({
    onClose,
    userQuizzes,
    loading,
    collectionQuizzes,
    addQuizToCollection,
    updateQuizSection,
    removeQuizFromCollection,
    operationLoading,
    sections,
}: ModalContentProps) {
    const [selectedQuizzes, setSelectedQuizzes] = useState<SelectedQuiz[]>(
        () =>
            collectionQuizzes.map((quiz) => ({
                quizId: quiz.id,
                sectionId: quiz.sectionId ?? null,
            }))
    )

    const [saving, setSaving] = useState(false)
    const isBusy = saving || operationLoading

    const toggleQuiz = (quizId: string) => {
        setSelectedQuizzes((prev) =>
            prev.some((quiz) => quiz.quizId === quizId)
                ? prev.filter((quiz) => quiz.quizId !== quizId)
                : [
                    ...prev,
                    {
                        quizId,
                        sectionId: null,
                    },
                ]
        )
    }

    const handleChangeQuizSection = (
        quizId: string,
        sectionId: string | null
    ) => {
        setSelectedQuizzes((prev) =>
            prev.map((quiz) =>
                quiz.quizId === quizId
                    ? {
                        ...quiz,
                        sectionId,
                    }
                    : quiz
            )
        )
    }

    const handleClose = () => {
        if (!isBusy) {
            onClose()
        }
    }

    const handleSave = async () => {
        if (isBusy) return

        try {
            setSaving(true)

            for (const quiz of selectedQuizzes) {
                const existingQuiz = collectionQuizzes.find(
                    (item) => item.id === quiz.quizId
                )

                if (!existingQuiz) {
                    await addQuizToCollection(
                        quiz.quizId,
                        quiz.sectionId
                    )
                } else if (
                    existingQuiz.sectionId !== quiz.sectionId
                ) {
                    await updateQuizSection(
                        existingQuiz.collectionItemId,
                        quiz.sectionId
                    )
                }
            }

            for (const quiz of collectionQuizzes) {
                const exists = selectedQuizzes.some(
                    (item) => item.quizId === quiz.id
                )

                if (!exists && quiz.collectionItemId) {
                    await removeQuizFromCollection(
                        quiz.collectionItemId
                    )
                }
            }

            toast.success('Coleção atualizada.')
            onClose()
        } catch (error) {
            console.error(error)
            toast.error('Erro ao atualizar coleção.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ResponsiveModalShell isBusy={isBusy} onClose={handleClose}>
            <div data-vaul-no-drag="" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
                {loading ? (
                    <div
                        role="status"
                        className="flex min-h-48 flex-col items-center justify-center gap-3"
                    >
                        <LoaderCircle
                            size={26}
                            className="text-primary animate-spin"
                            aria-hidden="true"
                        />

                        <p className="text-muted-foreground text-sm">
                            Carregando quizzes...
                        </p>
                    </div>
                ) : userQuizzes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="bg-muted text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-xl">
                            <BookOpen
                                size={25}
                                strokeWidth={1.7}
                                aria-hidden="true"
                            />
                        </div>

                        <h3 className="text-foreground text-base font-semibold">
                            Nenhum quiz disponível
                        </h3>

                        <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
                            Você ainda não possui quizzes para adicionar
                            a esta coleção.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-muted-foreground text-sm">
                                Seus quizzes
                            </p>

                            <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-medium">
                                {selectedQuizzes.length}{' '}
                                {selectedQuizzes.length === 1
                                    ? 'selecionado'
                                    : 'selecionados'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {userQuizzes.map((quiz) => {
                                const selected = selectedQuizzes.find(
                                    (item) => item.quizId === quiz.id
                                )

                                return (
                                    <div
                                        key={quiz.id}
                                        className={`min-w-0 rounded-xl border p-4 transition-colors duration-200 ${selected
                                            ? 'border-ring/50 bg-accent/30'
                                            : 'border-border bg-card hover:bg-accent/20'
                                            }`}
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <input
                                                id={`collection-quiz-${quiz.id}`}
                                                type="checkbox"
                                                checked={!!selected}
                                                onChange={() => toggleQuiz(quiz.id)}
                                                disabled={isBusy}
                                                className="border-input text-primary focus:ring-ring mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <label
                                                    htmlFor={`collection-quiz-${quiz.id}`}
                                                    className="text-foreground block cursor-pointer text-sm font-semibold leading-relaxed wrap-break-word sm:text-base"
                                                >
                                                    {quiz.name}
                                                </label>

                                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
                                                    {quiz.description || 'Sem descrição'}
                                                </p>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
                                                        {quiz.questionCount ?? 0}{' '}
                                                        {(quiz.questionCount ?? 0) === 1
                                                            ? 'pergunta'
                                                            : 'perguntas'}
                                                    </span>

                                                    {selected && (
                                                        <span className="bg-primary/10 text-primary inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium">
                                                            Adicionado
                                                        </span>
                                                    )}
                                                </div>

                                                {selected && (
                                                    <div className="border-border mt-4 border-t pt-4">
                                                        <label
                                                            htmlFor={`quiz-section-${quiz.id}`}
                                                            className="text-muted-foreground mb-2 block text-xs font-medium"
                                                        >
                                                            Seção da coleção
                                                        </label>

                                                        <select
                                                            id={`quiz-section-${quiz.id}`}
                                                            value={selected.sectionId ?? ''}
                                                            onChange={(event) =>
                                                                handleChangeQuizSection(
                                                                    quiz.id,
                                                                    event.target.value || null
                                                                )
                                                            }
                                                            disabled={isBusy}
                                                            className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="">
                                                                Sem seção
                                                            </option>

                                                            {sections.map((section) => (
                                                                <option
                                                                    key={section.id}
                                                                    value={section.id}
                                                                >
                                                                    {section.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="border-border bg-card flex shrink-0 items-center justify-end gap-3 border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:pb-4">
                <button
                    type="button"
                    onClick={handleClose}
                    disabled={isBusy}
                    className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isBusy || loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                    {isBusy ? (
                        <>
                            <LoaderCircle
                                size={16}
                                className="animate-spin"
                                aria-hidden="true"
                            />
                            Salvando...
                        </>
                    ) : (
                        'Salvar'
                    )}
                </button>
            </div>
        </ResponsiveModalShell>
    )
}
