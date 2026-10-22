import { CheckCircle2, ChevronDown, FileJson, FileUp, Info } from 'lucide-react'

import { CodeBlock } from '@/components/CodeBlock'
import { exampleJson } from './exampleJson'
import type { ImportQuestionsController } from './useImportQuestions'

interface ImportQuestionsUploadProps {
    importer: ImportQuestionsController
}

export function ImportQuestionsUpload({ importer }: ImportQuestionsUploadProps) {
    const hasFile = Boolean(importer.fileName)
    const hasValidQuestions = importer.validCount > 0

    return (
        <div className="space-y-4">
            <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="text-foreground text-sm font-semibold">
                            Arquivo de perguntas
                        </h3>
                        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                            Escolha um JSON com a lista de perguntas para importar.
                        </p>
                    </div>
                    <span className="border-border bg-muted text-muted-foreground shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold">
                        .JSON
                    </span>
                </div>

                <input
                    id="questions-json-file"
                    type="file"
                    accept=".json,application/json"
                    onChange={importer.handleFileChange}
                    disabled={importer.isBusy}
                    className="peer sr-only"
                />
                <label
                    htmlFor="questions-json-file"
                    className={`border-border bg-muted/20 peer-focus-visible:ring-ring/40 group flex min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-7 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:outline-none sm:py-8 ${importer.isBusy
                        ? 'cursor-not-allowed opacity-60'
                        : 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                        }`}
                >
                    <div className={`flex size-12 items-center justify-center rounded-2xl ${hasFile && hasValidQuestions
                        ? 'bg-answer-correct text-answer-correct-foreground'
                        : 'bg-primary/10 text-primary'
                        }`}>
                        {hasFile && hasValidQuestions ? (
                            <CheckCircle2 size={24} strokeWidth={1.8} aria-hidden="true" />
                        ) : (
                            <FileUp size={24} strokeWidth={1.8} aria-hidden="true" />
                        )}
                    </div>
                    <div className="min-w-0 max-w-full space-y-1">
                        {hasFile ? (
                            <>
                                <p className="text-foreground max-w-full truncate text-sm font-semibold">
                                    {importer.fileName}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {importer.fileSizeLabel ? `${importer.fileSizeLabel} · ` : ''}
                                    Clique para escolher outro arquivo
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-foreground text-sm font-semibold">
                                    Clique para selecionar seu arquivo
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    Formato .json
                                </p>
                            </>
                        )}
                    </div>
                </label>
            </section>

            <section className="border-border overflow-hidden rounded-xl border">
                <button
                    type="button"
                    onClick={() => importer.setShowFormatExample((prev) => !prev)}
                    aria-expanded={importer.showFormatExample}
                    className="hover:bg-accent/50 flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
                >
                    <span className="flex min-w-0 items-center gap-2.5">
                        <Info size={17} className="text-muted-foreground shrink-0" aria-hidden="true" />
                        <span className="min-w-0">
                            <span className="text-foreground block text-sm font-medium">
                                Formato do arquivo JSON
                            </span>
                            <span className="text-muted-foreground mt-0.5 block text-xs">
                                Confira um exemplo com feedbacks
                            </span>
                        </span>
                    </span>
                    <ChevronDown
                        size={17}
                        className={`text-muted-foreground shrink-0 transition-transform ${importer.showFormatExample ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </button>
                {importer.showFormatExample && (
                    <div className="border-border min-w-0 border-t p-3 sm:p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <FileJson size={15} className="text-muted-foreground" aria-hidden="true" />
                            <span className="text-muted-foreground text-xs">Exemplo de importação</span>
                        </div>
                        <CodeBlock language="json" code={exampleJson} />
                    </div>
                )}
            </section>
        </div>
    )
}
