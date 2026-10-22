import { useState } from 'react'
import { Check, CheckCircle2, ChevronDown, CircleAlert, MessageSquareText } from 'lucide-react'

import type { PreviewQuestion } from './types'

interface QuestionPreviewItemProps {
    preview: PreviewQuestion
    index: number
}

export function QuestionPreviewItem({ preview, index }: QuestionPreviewItemProps) {
    const [expanded, setExpanded] = useState(false)

    const questionText =
        typeof preview.data.question === 'string' && preview.data.question.trim()
            ? preview.data.question
            : 'Pergunta em branco'

    const questionType =
        preview.data.type === 'multiple-choice'
            ? 'Múltipla escolha'
            : preview.data.type === 'true-false'
                ? 'Verdadeiro ou falso'
                : preview.data.type === 'fill-in-the-blank'
                    ? 'Preenchimento de lacunas'
                    : typeof preview.data.type === 'string'
                        ? preview.data.type
                        : 'Tipo inválido'

    const options = Array.isArray(preview.data.options) ? preview.data.options : []
    const feedbacks = Array.isArray(preview.data.optionFeedback)
        ? preview.data.optionFeedback
        : []
    const correctAnswer = preview.data.correctAnswer
    const feedbackCount = feedbacks.filter(
        (feedback) => typeof feedback === 'string' && feedback.trim().length > 0
    ).length

    return (
        <article className={`min-w-0 overflow-hidden rounded-xl border transition-colors ${preview.isValid
            ? 'border-border bg-card'
            : 'border-destructive/30 bg-destructive/5'
            }`}>
            <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                className="hover:bg-accent/30 focus-visible:ring-ring flex w-full cursor-pointer items-start gap-3 p-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none sm:p-4"
            >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${preview.isValid
                    ? 'bg-primary/10 text-primary'
                    : 'bg-answer-incorrect text-answer-incorrect-foreground'
                    }`}>
                    {index + 1}
                </span>

                <span className="min-w-0 flex-1 space-y-1.5">
                    <span className="text-foreground block text-sm leading-relaxed font-medium wrap-break-word">
                        {questionText}
                    </span>
                    <span className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span>{questionType}</span>
                        {options.length > 0 && (
                            <>
                                <span aria-hidden="true">·</span>
                                <span>{options.length} alternativas</span>
                            </>
                        )}
                        {feedbackCount > 0 && (
                            <>
                                <span aria-hidden="true">·</span>
                                <MessageSquareText size={13} aria-hidden="true" />
                                <span>{feedbackCount} {feedbackCount === 1 ? 'feedback' : 'feedbacks'}</span>
                            </>
                        )}
                    </span>
                </span>

                <span className="flex shrink-0 items-center gap-2 pt-1">
                    {preview.isValid ? (
                        <CheckCircle2 size={17} className="text-primary" aria-label="Pergunta válida" />
                    ) : (
                        <CircleAlert size={17} className="text-destructive" aria-label="Pergunta inválida" />
                    )}
                    <ChevronDown
                        size={17}
                        className={`text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </span>
            </button>

            {expanded && (
                <div className="border-border space-y-3 border-t px-3.5 py-4 sm:px-4">
                    {preview.data.type === 'multiple-choice' && options.length > 0 && (
                        <div className="space-y-2">
                            {options.map((option, optionIndex) => {
                                const isCorrect = correctAnswer === optionIndex
                                const feedback = feedbacks[optionIndex]

                                return (
                                    <div
                                        key={optionIndex}
                                        className={`rounded-lg border px-3 py-2.5 ${isCorrect
                                            ? 'border-primary/40 bg-primary/5'
                                            : 'border-border bg-muted/20'
                                            }`}
                                    >
                                        <div className="flex min-w-0 items-start gap-2.5">
                                            <span className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${isCorrect
                                                ? 'bg-primary/15 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {String.fromCharCode(65 + optionIndex)}
                                            </span>
                                            <span className="text-foreground min-w-0 flex-1 text-sm leading-relaxed wrap-break-word">
                                                {String(option)}
                                            </span>
                                            {isCorrect && (
                                                <Check size={16} className="text-primary mt-0.5 shrink-0" aria-label="Resposta correta" />
                                            )}
                                        </div>
                                        {typeof feedback === 'string' && feedback.trim() && (
                                            <div className="text-muted-foreground mt-2 flex items-start gap-2 pl-0.5 text-xs leading-relaxed">
                                                <MessageSquareText size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                <span className="min-w-0 wrap-break-word">{feedback}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {preview.data.type === 'true-false' && (
                        <div className="border-border bg-muted/20 rounded-lg border px-3 py-3">
                            <p className="text-muted-foreground text-xs">Resposta correta</p>
                            <p className="text-foreground mt-1 text-sm font-medium">
                                {correctAnswer === 1
                                    ? 'Verdadeiro'
                                    : correctAnswer === 0
                                        ? 'Falso'
                                        : 'Não definida'}
                            </p>
                        </div>
                    )}

                    {preview.data.type === 'fill-in-the-blank' && (
                        <div className="border-border bg-muted/20 rounded-lg border px-3 py-3">
                            <p className="text-muted-foreground text-xs">Resposta da lacuna</p>
                            <p className="text-foreground mt-1 text-sm font-medium wrap-break-word">
                                {preview.data.blankAnswer || 'Não definida'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {!preview.isValid && preview.errors.length > 0 && (
                <div className="border-destructive/20 space-y-2 border-t px-3.5 py-3.5 sm:px-4">
                    <div className="text-destructive flex items-center gap-2">
                        <CircleAlert size={15} aria-hidden="true" />
                        <span className="text-xs font-semibold">Problemas encontrados</span>
                    </div>
                    <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs leading-relaxed">
                        {preview.errors.map((error, errorIndex) => (
                            <li key={errorIndex}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    )
}
