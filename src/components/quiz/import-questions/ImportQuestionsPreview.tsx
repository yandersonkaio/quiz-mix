import { useState } from 'react'
import { CheckCircle2, CircleAlert, ListFilter } from 'lucide-react'

import { QuestionPreviewItem } from './QuestionPreviewItem'
import type { ImportQuestionsController } from './useImportQuestions'

type PreviewFilter = 'all' | 'valid' | 'invalid'

interface ImportQuestionsPreviewProps {
    importer: ImportQuestionsController
}

const previewPageSize = 8

export function ImportQuestionsPreview({ importer }: ImportQuestionsPreviewProps) {
    const [filter, setFilter] = useState<PreviewFilter>('all')
    const [visibleCount, setVisibleCount] = useState(previewPageSize)
    const { previewQuestions, validCount, invalidCount } = importer

    if (previewQuestions.length === 0) return null

    const filtered = previewQuestions
        .map((preview, index) => ({ preview, index }))
        .filter(({ preview }) => {
            if (filter === 'valid') return preview.isValid
            if (filter === 'invalid') return !preview.isValid
            return true
        })

    const visible = filtered.slice(0, visibleCount)
    const remaining = filtered.length - visible.length

    const chooseFilter = (nextFilter: PreviewFilter) => {
        setFilter(nextFilter)
        setVisibleCount(previewPageSize)
    }

    return (
        <section className="space-y-4">
            <div className="border-border bg-muted/20 space-y-4 rounded-2xl border p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-foreground text-base font-semibold">
                            Pré-visualização
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                            {previewQuestions.length} {previewQuestions.length === 1 ? 'pergunta encontrada' : 'perguntas encontradas'} no arquivo
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-answer-correct text-answer-correct-foreground inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium">
                            <CheckCircle2 size={14} aria-hidden="true" />
                            {validCount} {validCount === 1 ? 'válida' : 'válidas'}
                        </span>
                        {invalidCount > 0 && (
                            <span className="bg-answer-incorrect text-answer-incorrect-foreground inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium">
                                <CircleAlert size={14} aria-hidden="true" />
                                {invalidCount} {invalidCount === 1 ? 'inválida' : 'inválidas'}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    role="progressbar"
                    aria-label="Porcentagem de perguntas válidas"
                    aria-valuemin={0}
                    aria-valuemax={previewQuestions.length}
                    aria-valuenow={validCount}
                    className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
                >
                    <div
                        className="bg-primary h-full rounded-full transition-[width]"
                        style={{ width: `${(validCount / previewQuestions.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    {([
                        ['all', 'Todas', previewQuestions.length],
                        ['valid', 'Válidas', validCount],
                        ['invalid', 'Inválidas', invalidCount],
                    ] as const).map(([value, label, count]) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => chooseFilter(value)}
                            aria-pressed={filter === value}
                            className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${filter === value
                                ? 'border-primary/40 bg-primary/10 text-primary'
                                : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                        >
                            {label}
                            <span className="text-[11px] opacity-70">{count}</span>
                        </button>
                    ))}
                </div>
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
                    <ListFilter size={14} aria-hidden="true" />
                    {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
                </span>
            </div>

            {visible.length > 0 ? (
                <div className="space-y-2.5">
                    {visible.map(({ preview, index }) => (
                        <QuestionPreviewItem
                            key={index}
                            preview={preview}
                            index={index}
                        />
                    ))}
                </div>
            ) : (
                <div className="border-border bg-muted/20 rounded-xl border border-dashed px-4 py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        Nenhuma pergunta nesta categoria.
                    </p>
                </div>
            )}

            {remaining > 0 && (
                <div className="flex flex-col items-center gap-2 pt-1">
                    <span className="text-muted-foreground text-xs">
                        Exibindo {visible.length} de {filtered.length}
                    </span>
                    <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + previewPageSize)}
                        className="border-border bg-card text-foreground hover:bg-accent focus-visible:ring-ring inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
                    >
                        Mostrar mais {Math.min(previewPageSize, remaining)}
                    </button>
                </div>
            )}

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
