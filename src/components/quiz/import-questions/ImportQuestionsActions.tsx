import { FileUp, LoaderCircle } from 'lucide-react'

import type { ImportQuestionsController } from './useImportQuestions'

interface ImportQuestionsActionsProps {
    importer: ImportQuestionsController
}

export function ImportQuestionsActions({ importer }: ImportQuestionsActionsProps) {
    return (
        <>
            <button
                type="button"
                onClick={importer.handleClose}
                disabled={importer.isBusy}
                className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
                Cancelar
            </button>
            <button
                type="button"
                onClick={importer.handleSave}
                disabled={importer.isBusy || importer.validCount === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
                {importer.isSaving ? (
                    <>
                        <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <FileUp size={17} strokeWidth={1.8} aria-hidden="true" />
                        Importar {importer.validCount}
                        <span className="hidden sm:inline">
                            {importer.validCount === 1 ? ' pergunta' : ' perguntas'}
                        </span>
                    </>
                )}
            </button>
        </>
    )
}
