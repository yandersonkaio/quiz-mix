
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    FileJson,
    FileUp,
    LoaderCircle,
} from 'lucide-react'
import { toast } from 'sonner'

import { validateQuestionData } from '../../utils/validation'
import type { Question } from '../../types/quiz'
import { CodeBlock } from '../CodeBlock'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'

type QuestionData = Omit<Question, 'id'>

interface ImportQuestionsModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveImportedQuestions: (
        questions: QuestionData[]
    ) => Promise<void>
    quizId: string
}

interface PreviewQuestion {
    data: Partial<Question>
    errors: string[]
    isValid: boolean
}

interface ImportQuestionsContentProps {
    onClose: () => void
    onSaveImportedQuestions: (
        questions: QuestionData[]
    ) => Promise<void>
}

const exampleJson = `[
  {
    "type": "multiple-choice",
    "question": "Sua pergunta?",
    "options": [
      "Opção A",
      "Opção B",
      "Opção C",
      "Opção D"
    ],
    "correctAnswer": 0,
    "optionFeedback": [
      "Feedback da opção A",
      "Feedback da opção B",
      "Feedback da opção C",
      "Feedback da opção D"
    ]
  },
  {
    "type": "multiple-choice",
    "question": "Sua pergunta 2?",
    "options": [
      "Opção A",
      "Opção B",
      "Opção C",
      "Opção D"
    ],
    "correctAnswer": 2,
    "optionFeedback": [
      "",
      "Feedback da opção B",
      "Feedback da opção C",
      ""
    ]
  }
]`

function ImportQuestionsContent({
    onClose,
    onSaveImportedQuestions,
}: ImportQuestionsContentProps) {
    const [fileName, setFileName] = useState<string | null>(null)

    const [previewQuestions, setPreviewQuestions] = useState<
        PreviewQuestion[]
    >([])

    const [fileError, setFileError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showFormatExample, setShowFormatExample] = useState(false)

    const isBusy = isProcessing || isSaving

    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' &&
        window.matchMedia('(max-width: 767px)').matches
    )

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 767px)')
        const onChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches)
        }

        mediaQuery.addEventListener('change', onChange)
        return () => mediaQuery.removeEventListener('change', onChange)
    }, [])

    const validCount = previewQuestions.filter(
        (question) => question.isValid
    ).length

    const invalidCount = previewQuestions.length - validCount

    const handleClose = () => {
        if (!isBusy) {
            onClose()
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) handleClose()
    }

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        if (isBusy) return

        const file = event.target.files?.[0]

        event.target.value = ''

        if (!file) return

        setFileName(null)
        setFileError(null)
        setPreviewQuestions([])

        if (!file.name.toLowerCase().endsWith('.json')) {
            setFileError(
                'Formato de arquivo inválido. Selecione um arquivo .json.'
            )
            return
        }

        setFileName(file.name)
        setIsProcessing(true)

        try {
            const text = await file.text()
            const json: unknown = JSON.parse(text)

            if (!Array.isArray(json)) {
                throw new Error(
                    'O arquivo JSON deve conter um array de perguntas.'
                )
            }

            if (json.length === 0) {
                throw new Error(
                    'O arquivo JSON não contém perguntas.'
                )
            }

            const previews: PreviewQuestion[] = json.map(
                (item: unknown, index: number) => {
                    if (
                        typeof item !== 'object' ||
                        item === null ||
                        Array.isArray(item)
                    ) {
                        return {
                            data: {},
                            errors: [
                                `Item ${index + 1} não é um objeto de pergunta válido.`,
                            ],
                            isValid: false,
                        }
                    }

                    const questionData = item as Partial<Question>
                    const errors = validateQuestionData(questionData)

                    return {
                        data: questionData,
                        errors,
                        isValid: errors.length === 0,
                    }
                }
            )

            setPreviewQuestions(previews)
        } catch (error) {
            console.error('Erro ao processar JSON:', error)

            setFileError(
                `Erro ao processar o arquivo: ${error instanceof Error
                    ? error.message
                    : String(error)
                }`
            )

            setPreviewQuestions([])
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSave = async () => {
        if (isBusy) return

        const validQuestionsToSave: QuestionData[] =
            previewQuestions
                .filter((question) => question.isValid)
                .map((question) => question.data as QuestionData)

        if (validQuestionsToSave.length === 0) {
            toast.error(
                'Nenhuma pergunta válida encontrada no arquivo para importar.'
            )
            return
        }

        setIsSaving(true)
        setFileError(null)

        try {
            await onSaveImportedQuestions(validQuestionsToSave)

            toast.success(
                `${validQuestionsToSave.length} perguntas importadas com sucesso.`
            )

            onClose()
        } catch (error) {
            console.error(
                'Erro ao salvar perguntas importadas:',
                error
            )

            setFileError(
                `Erro ao salvar perguntas: ${error instanceof Error
                    ? error.message
                    : 'Erro desconhecido'
                }`
            )
        } finally {
            setIsSaving(false)
        }
    }

    const scrollContent = (
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
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
                    onChange={handleFileChange}
                    disabled={isBusy}
                    className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/30 block w-full cursor-pointer rounded-xl border p-2 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium file:text-foreground hover:file:bg-accent"
                />

                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    Selecione um arquivo .json contendo uma lista
                    de perguntas.
                </p>

                {fileName && (
                    <div className="text-muted-foreground mt-3 flex min-w-0 items-center gap-2 text-xs">
                        <FileJson
                            size={15}
                            className="shrink-0"
                            aria-hidden="true"
                        />

                        <span className="truncate">
                            {fileName}
                        </span>
                    </div>
                )}
            </section>

            <section>
                <button
                    type="button"
                    onClick={() =>
                        setShowFormatExample((prev) => !prev)
                    }
                    aria-expanded={showFormatExample}
                    className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors"
                >
                    <FileJson
                        size={16}
                        aria-hidden="true"
                    />

                    {showFormatExample
                        ? 'Ocultar formato de exemplo'
                        : 'Mostrar formato de exemplo'}

                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${showFormatExample ? 'rotate-180' : ''
                            }`}
                        aria-hidden="true"
                    />
                </button>

                {showFormatExample && (
                    <div className="mt-3 min-w-0">
                        <CodeBlock
                            language="json"
                            code={exampleJson}
                        />
                    </div>
                )}
            </section>

            {isProcessing && (
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

            {fileError && (
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
                        {fileError}
                    </p>
                </div>
            )}

            {previewQuestions.length > 0 && (
                <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-foreground text-base font-semibold">
                                Pré-visualização
                            </h3>

                            <p className="text-muted-foreground mt-1 text-xs">
                                Confira as perguntas antes de importar.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-answer-correct text-answer-correct-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium">
                                <CheckCircle2
                                    size={13}
                                    aria-hidden="true"
                                />

                                {validCount} válidas
                            </span>

                            {invalidCount > 0 && (
                                <span className="bg-answer-incorrect text-answer-incorrect-foreground inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium">
                                    <CircleAlert
                                        size={13}
                                        aria-hidden="true"
                                    />

                                    {invalidCount} inválidas
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {previewQuestions.map((preview, index) => {
                            const questionText =
                                typeof preview.data.question === 'string' &&
                                    preview.data.question.trim()
                                    ? preview.data.question
                                    : 'Pergunta em branco'

                            const questionType =
                                typeof preview.data.type === 'string'
                                    ? preview.data.type
                                    : 'Tipo inválido'

                            return (
                                <div
                                    key={index}
                                    className="border-border bg-muted/30 min-w-0 rounded-xl border p-4"
                                >
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

                                            {/* Erros da pergunta */}
                                            {!preview.isValid &&
                                                preview.errors.length > 0 && (
                                                    <div className="border-destructive/20 mt-3 border-t pt-3">
                                                        <div className="text-destructive mb-2 flex items-center gap-2">
                                                            <CircleAlert
                                                                size={15}
                                                                aria-hidden="true"
                                                            />

                                                            <span className="text-xs font-medium">
                                                                Problemas encontrados
                                                            </span>
                                                        </div>

                                                        <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs leading-relaxed">
                                                            {preview.errors.map(
                                                                (error, errorIndex) => (
                                                                    <li key={errorIndex}>
                                                                        {error}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                        </div>

                                        {/* Indicador */}
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
                        })}
                    </div>

                    {invalidCount > 0 && validCount > 0 && (
                        <div className="border-border bg-muted/30 flex items-start gap-3 rounded-xl border p-4">
                            <CircleAlert
                                size={18}
                                className="text-muted-foreground mt-0.5 shrink-0"
                                aria-hidden="true"
                            />

                            <p className="text-muted-foreground text-xs leading-relaxed">
                                Apenas as {validCount} perguntas válidas
                                serão importadas. As {invalidCount} perguntas
                                inválidas serão ignoradas.
                            </p>
                        </div>
                    )}
                </section>
            )}
        </div>

    )

    const footerActions = (
        <>
            <button
                type="button"
                onClick={handleClose}
                disabled={isBusy}
                className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
                Cancelar
            </button>

            <button
                type="button"
                onClick={handleSave}
                disabled={isBusy || validCount === 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
                {isSaving ? (
                    <>
                        <LoaderCircle
                            size={17}
                            className="animate-spin"
                            aria-hidden="true"
                        />

                        Salvando...
                    </>
                ) : (
                    <>
                        <FileUp
                            size={17}
                            strokeWidth={1.8}
                            aria-hidden="true"
                        />

                        Importar {validCount}
                        <span className="hidden sm:inline">
                            {validCount === 1
                                ? ' pergunta'
                                : ' perguntas'}
                        </span>
                    </>
                )}
            </button>
        </>
    )

    if (isMobile) {
        return (
            <Drawer
                open
                onOpenChange={handleOpenChange}
                dismissible={!isBusy}
            >
                <DrawerContent
                    aria-busy={isBusy}
                    className="bg-card text-card-foreground flex max-h-[92dvh] min-h-0 flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
                >
                    <DrawerHeader className="border-border shrink-0 border-b px-5 pt-5 pb-4 text-left">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                                <FileJson size={20} strokeWidth={1.8} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <DrawerTitle className="text-foreground text-lg font-semibold tracking-tight">
                                    Importar perguntas
                                </DrawerTitle>
                                <DrawerDescription className="text-muted-foreground mt-1 text-xs leading-relaxed">
                                    Importe perguntas de um arquivo JSON para o seu quiz.
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    {scrollContent}

                    <DrawerFooter className="border-border bg-card flex shrink-0 flex-row items-center justify-end gap-3 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        {footerActions}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open onOpenChange={handleOpenChange}>
            <DialogContent
                aria-busy={isBusy}
                onEscapeKeyDown={(event) => {
                    if (isBusy) event.preventDefault()
                }}
                onInteractOutside={(event) => {
                    if (isBusy) event.preventDefault()
                }}
                className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl"
            >
                <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pr-12 text-left sm:px-6 sm:pr-14">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                            <FileJson size={20} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                                Importar perguntas
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
                                Importe perguntas de um arquivo JSON para o seu quiz.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {scrollContent}

                <DialogFooter className="border-border bg-card flex shrink-0 flex-row items-center justify-end gap-3 border-t px-5 py-4 sm:px-6">
                    {footerActions}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function ImportQuestionsModal({
    isOpen,
    onClose,
    onSaveImportedQuestions,
}: ImportQuestionsModalProps) {
    if (!isOpen) return null

    return (
        <ImportQuestionsContent
            onClose={onClose}
            onSaveImportedQuestions={onSaveImportedQuestions}
        />
    )
}
