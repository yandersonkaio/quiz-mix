import { ChevronDown, FileJson } from 'lucide-react'

import { CodeBlock } from '@/components/CodeBlock'
import { exampleJson } from './exampleJson'
import type { ImportQuestionsController } from './useImportQuestions'

interface ImportQuestionsUploadProps {
    importer: ImportQuestionsController
}

export function ImportQuestionsUpload({ importer }: ImportQuestionsUploadProps) {
    return (
        <div className="space-y-6">
            <section>
                <label
                    htmlFor="questions-json-file"
                    className="text-foreground mb-2 block text-sm font-medium"
                >
                    Arquivo JSON
                </label>
                <input
                    id="questions-json-file"
                    type="file"
                    accept=".json,application/json"
                    onChange={importer.handleFileChange}
                    disabled={importer.isBusy}
                    className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 block w-full cursor-pointer rounded-xl border p-2 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium file:text-foreground hover:file:bg-accent"
                />
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    Selecione um arquivo .json contendo uma lista de perguntas.
                </p>

                {importer.fileName && (
                    <div className="text-muted-foreground mt-3 flex min-w-0 items-center gap-2 text-xs">
                        <FileJson size={15} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{importer.fileName}</span>
                    </div>
                )}
            </section>

            <section>
                <button
                    type="button"
                    onClick={() => importer.setShowFormatExample((prev) => !prev)}
                    aria-expanded={importer.showFormatExample}
                    className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors"
                >
                    <FileJson size={16} aria-hidden="true" />
                    {importer.showFormatExample
                        ? 'Ocultar formato de exemplo'
                        : 'Mostrar formato de exemplo'}
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${importer.showFormatExample ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                    />
                </button>

                {importer.showFormatExample && (
                    <div className="mt-3 min-w-0">
                        <CodeBlock language="json" code={exampleJson} />
                    </div>
                )}
            </section>
        </div>
    )
}
