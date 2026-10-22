import { useState } from 'react'
import type { FormEvent } from 'react'
import {
    ChevronDown,
    ChevronUp,
    LoaderCircle,
    MessageSquareText,
    X,
} from 'lucide-react'
import { toast } from 'sonner'

import type { Question } from '../../types/quiz'

interface QuestionModalProps {
    isOpen: boolean
    onClose: () => void
    question: Question
    onSave: (question: Question) => Promise<void>
    isEditing: boolean
}

const inputClassName =
    'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60'

const labelClassName = 'text-foreground mb-2 block text-sm font-medium'

// O conteúdo só é montado quando o modal abre, garantindo dados novos
// a cada abertura sem precisar sincronizar o formulário via useEffect.
function QuestionModalContent({
    onClose,
    question,
    onSave,
    isEditing,
}: Omit<QuestionModalProps, 'isOpen'>) {
    const [formData, setFormData] = useState<Question>(() => {
        const initialData = { ...question }

        if (initialData.type === 'multiple-choice' && !initialData.optionFeedback) {
            initialData.optionFeedback = Array(
                initialData.options?.length || 4
            ).fill(null)
        }

        return initialData
    })

    const [isSaving, setIsSaving] = useState(false)
    const [expandedFeedbacks, setExpandedFeedbacks] = useState<
        Record<number, boolean>
    >({})

    const handleOptionChange = (index: number, value: string) => {
        setFormData((prev) => {
            const options = [...(prev.options || ['', '', '', ''])]
            options[index] = value

            return {
                ...prev,
                options,
                optionFeedback:
                    prev.optionFeedback ?? Array(options.length).fill(''),
            }
        })
    }

    const handleFeedbackChange = (index: number, value: string) => {
        setFormData((prev) => {
            const feedback = [
                ...(prev.optionFeedback ?? Array(prev.options?.length ?? 4).fill('')),
            ]
            feedback[index] = value

            return { ...prev, optionFeedback: feedback }
        })
    }

    const toggleFeedback = (index: number) => {
        setExpandedFeedbacks((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    const toggleAllFeedbacks = () => {
        const allExpanded = formData.options?.every(
            (_, index) => expandedFeedbacks[index]
        )

        const nextExpanded: Record<number, boolean> = {}
        formData.options?.forEach((_, index) => {
            nextExpanded[index] = !allExpanded
        })
        setExpandedFeedbacks(nextExpanded)
    }

    const validateQuestion = (value: Question): boolean => {
        if (!value.question.trim()) {
            toast.error('A pergunta não pode estar vazia.')
            return false
        }

        if (value.type === 'multiple-choice') {
            if (
                !value.options ||
                value.options.length < 2 ||
                value.correctAnswer === undefined
            ) {
                toast.error(
                    'Perguntas de múltipla escolha devem ter pelo menos 2 opções e uma resposta correta definida.'
                )
                return false
            }

            if (value.options.some((option) => !option.trim())) {
                toast.error('Todas as opções devem ser preenchidas.')
                return false
            }
        } else if (
            value.type === 'true-false' &&
            value.correctAnswer === undefined
        ) {
            toast.error('Perguntas verdadeiro/falso devem ter uma resposta correta definida.')
            return false
        } else if (
            value.type === 'fill-in-the-blank' &&
            !value.blankAnswer?.trim()
        ) {
            toast.error('Perguntas de preenchimento devem ter uma resposta definida.')
            return false
        }

        return true
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isSaving) return

        const dataToSave = { ...formData }
        if (!validateQuestion(dataToSave)) return

        setIsSaving(true)

        try {
            await onSave(dataToSave)
            onClose()
        } catch (error) {
            console.error('Erro ao salvar pergunta:', error)
            toast.error('Erro ao salvar a pergunta.')
        } finally {
            setIsSaving(false)
        }
    }

    const allFeedbacksExpanded =
        (formData.options?.length ?? 0) > 0 &&
        formData.options?.every((_, index) => expandedFeedbacks[index])

    const filledFeedbacks =
        formData.optionFeedback?.filter((feedback) => feedback?.trim()).length ?? 0

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 backdrop-blur-[2px] sm:p-6"
            onClick={() => {
                if (!isSaving) onClose()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="question-modal-title"
                className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Cabeçalho */}
                <div className="border-border flex shrink-0 items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                        <h2
                            id="question-modal-title"
                            className="text-foreground text-lg font-semibold tracking-tight sm:text-xl"
                        >
                            {isEditing ? 'Editar Pergunta' : 'Adicionar Nova Pergunta'}
                        </h2>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {isEditing
                                ? 'Atualize o conteúdo e as respostas desta pergunta.'
                                : 'Configure a pergunta e defina a resposta correta.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Fechar modal"
                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Formulário com rolagem */}
                <form
                    id="question-modal-form"
                    onSubmit={handleSubmit}
                    className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6"
                >
                    <div>
                        <label htmlFor="question-type" className={labelClassName}>
                            Tipo de pergunta
                        </label>
                        <select
                            id="question-type"
                            value={formData.type}
                            onChange={(event) => {
                                const type = event.target.value as Question['type']
                                setFormData((prev) => ({
                                    ...prev,
                                    type,
                                    options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
                                    correctAnswer: type === 'fill-in-the-blank' ? undefined : 0,
                                    blankAnswer: type === 'fill-in-the-blank' ? '' : undefined,
                                    optionFeedback: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
                                }))
                                setExpandedFeedbacks({})
                            }}
                            className={inputClassName}
                            disabled={isSaving}
                        >
                            <option value="multiple-choice">Múltipla Escolha</option>
                            <option value="true-false">Verdadeiro ou Falso</option>
                            <option value="fill-in-the-blank">Preenchimento de Lacunas</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="question-text" className={labelClassName}>
                            Pergunta
                        </label>
                        <input
                            id="question-text"
                            type="text"
                            value={formData.question}
                            onChange={(event) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    question: event.target.value,
                                }))
                            }
                            className={inputClassName}
                            placeholder="Digite a pergunta"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {formData.type === 'multiple-choice' && (
                        <section className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-foreground text-sm font-semibold">
                                    Opções
                                </h3>
                                <span className="border-border bg-muted text-muted-foreground rounded-full border px-2.5 py-1 text-xs font-medium">
                                    {filledFeedbacks} de {formData.options?.length ?? 0} com feedback
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={toggleAllFeedbacks}
                                disabled={isSaving}
                                className="border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                            >
                                {allFeedbacksExpanded ? (
                                    <ChevronUp size={15} />
                                ) : (
                                    <ChevronDown size={15} />
                                )}
                                {allFeedbacksExpanded
                                    ? 'Recolher todos os feedbacks'
                                    : 'Expandir todos os feedbacks'}
                            </button>

                            <div className="space-y-3">
                                {formData.options?.map((option, index) => {
                                    const expanded = !!expandedFeedbacks[index]
                                    const feedback = formData.optionFeedback?.[index] ?? ''
                                    const hasFeedback = !!feedback.trim()
                                    const letter = String.fromCharCode(65 + index)

                                    return (
                                        <div
                                            key={index}
                                            className={`rounded-xl border transition-colors ${expanded
                                                ? 'border-ring/50 bg-muted/30'
                                                : 'border-border bg-background/40'
                                                }`}
                                        >
                                            <div className="p-3 sm:p-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="border-border bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold">
                                                        {letter}
                                                    </span>
                                                    <label htmlFor={`question-option-${index}`} className="sr-only">
                                                        Opção {letter}
                                                    </label>
                                                    <input
                                                        id={`question-option-${index}`}
                                                        type="text"
                                                        value={option}
                                                        onChange={(event) =>
                                                            handleOptionChange(index, event.target.value)
                                                        }
                                                        className={inputClassName}
                                                        placeholder={`Opção ${letter}`}
                                                        required
                                                        disabled={isSaving}
                                                    />
                                                </div>

                                                <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleFeedback(index)}
                                                        disabled={isSaving}
                                                        aria-expanded={expanded}
                                                        aria-controls={`question-feedback-panel-${index}`}
                                                        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-8 items-center gap-1.5 rounded-lg px-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 sm:text-sm"
                                                    >
                                                        {expanded ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <MessageSquareText size={16} />
                                                        )}
                                                        {expanded
                                                            ? 'Ocultar feedback'
                                                            : hasFeedback
                                                                ? 'Editar feedback'
                                                                : 'Adicionar feedback explicativo'}
                                                        {hasFeedback && !expanded && (
                                                            <span
                                                                className="bg-primary ml-1 size-1.5 rounded-full"
                                                                title="Feedback definido"
                                                            />
                                                        )}
                                                    </button>

                                                    {hasFeedback && !expanded && (
                                                        <span className="text-muted-foreground max-w-40 truncate text-xs italic sm:max-w-52">
                                                            {feedback}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {expanded && (
                                                <div
                                                    id={`question-feedback-panel-${index}`}
                                                    className="border-border space-y-3 border-t px-3 py-3 sm:px-4"
                                                >
                                                    <div>
                                                        <label
                                                            htmlFor={`question-feedback-${index}`}
                                                            className={labelClassName}
                                                        >
                                                            Feedback da opção {letter}
                                                        </label>
                                                        <textarea
                                                            id={`question-feedback-${index}`}
                                                            rows={4}
                                                            className={`${inputClassName} resize-y`}
                                                            placeholder="Explique por que esta alternativa está correta ou incorreta. Este feedback será mostrado após responder."
                                                            value={feedback}
                                                            onChange={(event) =>
                                                                handleFeedbackChange(index, event.target.value)
                                                            }
                                                            maxLength={500}
                                                            disabled={isSaving}
                                                        />
                                                        <div className="text-muted-foreground mt-1.5 flex items-start justify-between gap-3 text-xs">
                                                            <span>Explique o raciocínio por trás da opção.</span>
                                                            <span className="shrink-0 tabular-nums">
                                                                {feedback.length}/500
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {hasFeedback ? (
                                                        <div className="border-border bg-muted/50 rounded-lg border p-3">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <MessageSquareText
                                                                    size={15}
                                                                    className="text-muted-foreground"
                                                                />
                                                                <p className="text-foreground text-xs font-semibold">
                                                                    Prévia do feedback
                                                                </p>
                                                            </div>
                                                            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line wrap-break-word">
                                                                {feedback}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-3 text-center text-xs">
                                                            Nenhum feedback definido ainda.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div>
                                <label htmlFor="question-correct" className={labelClassName}>
                                    Resposta correta
                                </label>
                                <select
                                    id="question-correct"
                                    value={formData.correctAnswer ?? 0}
                                    onChange={(event) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            correctAnswer: Number(event.target.value),
                                        }))
                                    }
                                    className={inputClassName}
                                    disabled={isSaving}
                                >
                                    {formData.options?.map((_, index) => (
                                        <option key={index} value={index}>
                                            {String.fromCharCode(65 + index)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>
                    )}

                    {formData.type === 'true-false' && (
                        <div>
                            <label htmlFor="question-correct" className={labelClassName}>
                                Resposta correta
                            </label>
                            <select
                                id="question-correct"
                                value={formData.correctAnswer ?? 0}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        correctAnswer: Number(event.target.value),
                                    }))
                                }
                                className={inputClassName}
                                disabled={isSaving}
                            >
                                <option value={1}>Verdadeiro</option>
                                <option value={0}>Falso</option>
                            </select>
                        </div>
                    )}

                    {formData.type === 'fill-in-the-blank' && (
                        <div>
                            <label htmlFor="question-blank-answer" className={labelClassName}>
                                Resposta da lacuna
                            </label>
                            <input
                                id="question-blank-answer"
                                type="text"
                                value={formData.blankAnswer || ''}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        blankAnswer: event.target.value,
                                    }))
                                }
                                className={inputClassName}
                                placeholder="Digite a resposta correta"
                                required
                                disabled={isSaving}
                            />
                        </div>
                    )}
                </form>

                {/* Ações fixas no rodapé */}
                <div className="border-border bg-card flex shrink-0 gap-3 border-t px-5 py-4 sm:justify-end sm:px-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 flex-1 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        form="question-modal-form"
                        disabled={isSaving}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-28 sm:flex-none"
                    >
                        {isSaving && (
                            <LoaderCircle size={17} className="animate-spin" />
                        )}
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function QuestionModal({
    isOpen,
    onClose,
    question,
    onSave,
    isEditing,
}: QuestionModalProps) {
    if (!isOpen) return null

    return (
        <QuestionModalContent
            question={question}
            onClose={onClose}
            onSave={onSave}
            isEditing={isEditing}
        />
    )
}
