
import { useState } from 'react'
import { BookOpen, LoaderCircle, X } from 'lucide-react'
import { toast } from 'sonner'

import { useUserQuizzes } from '../../hooks/useUserQuizzes'
import { useCollectionQuizzes } from '../../hooks/useCollectionQuizzes'
import { useCollectionSections } from '@/hooks/useCollectionSections'

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
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-[2px] sm:p-6"
                onClick={onClose}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Carregando coleção"
                    className="border-border bg-card text-card-foreground flex w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border px-5 py-12 shadow-2xl"
                    onClick={(event) => event.stopPropagation()}
                >
                    <LoaderCircle
                        size={26}
                        className="text-primary animate-spin"
                        aria-hidden="true"
                    />
                    <p className="text-muted-foreground text-sm">
                        Carregando quizzes da coleção...
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="border-border bg-muted text-foreground hover:bg-accent rounded-lg border px-4 py-2 text-sm transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-[2px] sm:p-6"
            onClick={handleClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-quizzes-modal-title"
                aria-describedby="add-quizzes-modal-description"
                aria-busy={isBusy}
                className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className="border-border flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                            <BookOpen
                                size={20}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </div>

                        <div className="min-w-0">
                            <h2
                                id="add-quizzes-modal-title"
                                className="text-foreground text-lg font-semibold tracking-tight sm:text-xl"
                            >
                                Gerenciar quizzes
                            </h2>

                            <p
                                id="add-quizzes-modal-description"
                                className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm"
                            >
                                Selecione os quizzes e organize nas seções.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isBusy}
                        aria-label="Fechar modal"
                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
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

                {/* Rodapé */}
                <div className="border-border bg-card flex shrink-0 items-center justify-end gap-3 border-t px-5 py-4 sm:px-6">
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
            </div>
        </div>
    )
}
