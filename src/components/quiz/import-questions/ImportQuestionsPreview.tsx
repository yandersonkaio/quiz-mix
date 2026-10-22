import { CheckCircle2, CircleAlert } from 'lucide-react'

import { QuestionPreviewItem } from './QuestionPreviewItem'
import type { ImportQuestionsController } from './useImportQuestions'

interface ImportQuestionsPreviewProps {
    importer: ImportQuestionsController
}

export function ImportQuestionsPreview({ importer }: ImportQuestionsPreviewProps) {
    const { previewQuestions, validCount, invalidCount } = importer

    if (previewQuestions.length === 0) return null

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-foreground text-base font-semibold">Pré-visualização</h3>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Confira as perguntas antes de importar.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-answer-correct text-answer-correct-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium">
                        <CheckCircle2 size={13} aria-hidden="true" />
                        {validCount} válidas
                    </span>
                    {invalidCount > 0 && (
                        <span className="bg-answer-incorrect text-answer-incorrect-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium">
                            <CircleAlert size={13} aria-hidden="true" />
                            {invalidCount} inválidas
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {previewQuestions.map((preview, index) => (
                    <QuestionPreviewItem key={index} preview={preview} index={index} />
                ))}
            </div>

            {invalidCount > 0 && validCount > 0 && (
                <div className="border-border bg-muted/30 flex items-start gap-3 rounded-xl border p-4">
                    <CircleAlert
                        size={18}
                        className="text-muted-foreground mt-0.5 shrink-0"
                        aria-hidden="true"
                    />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        Apenas as {validCount} perguntas válidas serão importadas.
                        As {invalidCount} perguntas inválidas serão ignoradas.
                    </p>
                </div>
            )}
        </section>
    )
}
