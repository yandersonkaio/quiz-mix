import { CheckCircle2, CircleAlert } from 'lucide-react'

import type { PreviewQuestion } from './types'

interface QuestionPreviewItemProps {
    preview: PreviewQuestion
    index: number
}

export function QuestionPreviewItem({ preview, index }: QuestionPreviewItemProps) {
    const questionText =
        typeof preview.data.question === 'string' && preview.data.question.trim()
            ? preview.data.question
            : 'Pergunta em branco'

    const questionType =
        typeof preview.data.type === 'string'
            ? preview.data.type
            : 'Tipo inválido'

    return (
        <div className="border-border bg-muted/30 min-w-0 rounded-xl border p-4">
            <div className="flex min-w-0 items-start gap-3">
                <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${preview.isValid
                        ? 'bg-answer-correct text-answer-correct-foreground'
                        : 'bg-answer-incorrect text-answer-incorrect-foreground'
                    }`}
                >
                    {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm leading-relaxed font-medium wrap-break-word">
                        {questionText}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        {questionType}
                    </p>

                    {!preview.isValid && preview.errors.length > 0 && (
                        <div className="border-destructive/20 mt-3 border-t pt-3">
                            <div className="text-destructive mb-2 flex items-center gap-2">
                                <CircleAlert size={15} aria-hidden="true" />
                                <span className="text-xs font-medium">Problemas encontrados</span>
                            </div>
                            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs leading-relaxed">
                                {preview.errors.map((error, errorIndex) => (
                                    <li key={errorIndex}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {preview.isValid && (
                    <CheckCircle2
                        size={18}
                        className="text-muted-foreground shrink-0"
                        aria-label="Pergunta válida"
                    />
                )}
            </div>
        </div>
    )
}
