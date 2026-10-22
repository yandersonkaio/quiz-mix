import { CircleAlert, LoaderCircle } from 'lucide-react'

import { ImportQuestionsPreview } from './ImportQuestionsPreview'
import { ImportQuestionsUpload } from './ImportQuestionsUpload'
import type { ImportQuestionsController } from './useImportQuestions'

interface ImportQuestionsBodyProps {
    importer: ImportQuestionsController
}

export function ImportQuestionsBody({ importer }: ImportQuestionsBodyProps) {
    return (
        <div
            data-vaul-no-drag=""
            className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6"
        >
            <ImportQuestionsUpload importer={importer} />

            {importer.isProcessing && (
                <div
                    role="status"
                    className="border-border bg-muted/40 flex items-center gap-3 rounded-xl border p-4"
                >
                    <LoaderCircle
                        size={20}
                        className="text-primary shrink-0 animate-spin"
                        aria-hidden="true"
                    />
                    <span className="text-muted-foreground text-sm">
                        Processando arquivo JSON...
                    </span>
                </div>
            )}

            {importer.fileError && (
                <div
                    role="alert"
                    className="border-destructive/30 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4"
                >
                    <CircleAlert
                        size={19}
                        className="text-destructive mt-0.5 shrink-0"
                        aria-hidden="true"
                    />
                    <p className="text-foreground min-w-0 text-sm leading-relaxed wrap-break-word">
                        {importer.fileError}
                    </p>
                </div>
            )}

            <ImportQuestionsPreview importer={importer} />
        </div>
    )
}
