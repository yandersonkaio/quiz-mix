import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { toast } from 'sonner'

import { validateQuestionData } from '@/utils/validation'
import type { Question } from '@/types/quiz'
import type {
    ImportQuestionsModalProps,
    PreviewQuestion,
    QuestionData,
} from './types'

type UseImportQuestionsProps = Pick<
    ImportQuestionsModalProps,
    'onClose' | 'onSaveImportedQuestions'
>

export function useImportQuestions({
    onClose,
    onSaveImportedQuestions,
}: UseImportQuestionsProps) {
    const [fileName, setFileName] = useState<string | null>(null)
    const [fileSizeLabel, setFileSizeLabel] = useState<string | null>(null)
    const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([])
    const [fileError, setFileError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showFormatExample, setShowFormatExample] = useState(false)

    const isBusy = isProcessing || isSaving
    const validCount = previewQuestions.filter((question) => question.isValid).length
    const invalidCount = previewQuestions.length - validCount

    const handleClose = () => {
        if (!isBusy) onClose()
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) handleClose()
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        if (isBusy) return

        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) return

        setFileName(null)
        setFileSizeLabel(null)
        setFileError(null)
        setPreviewQuestions([])

        if (!file.name.toLowerCase().endsWith('.json')) {
            setFileError('Formato de arquivo inválido. Selecione um arquivo .json.')
            return
        }

        setFileName(file.name)
        setFileSizeLabel(
            file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        )
        setIsProcessing(true)

        try {
            const content = await file.text()
            const json: unknown = JSON.parse(content)

            if (!Array.isArray(json)) {
                throw new Error('O arquivo JSON deve conter um array de perguntas.')
            }

            if (json.length === 0) {
                throw new Error('O arquivo JSON não contém perguntas.')
            }

            const previews: PreviewQuestion[] = json.map((item: unknown, index) => {
                if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                    return {
                        data: {},
                        errors: [`Item ${index + 1} não é um objeto de pergunta válido.`],
                        isValid: false,
                    }
                }

                const data = item as Partial<Question>
                const errors = validateQuestionData(data)

                return {
                    data,
                    errors,
                    isValid: errors.length === 0,
                }
            })

            setPreviewQuestions(previews)
        } catch (error) {
            console.error('Erro ao processar JSON:', error)
            setFileError(
                `Erro ao processar o arquivo: ${error instanceof Error ? error.message : String(error)}`
            )
            setPreviewQuestions([])
        } finally {
            setIsProcessing(false)
        }
    }

    const handleSave = async () => {
        if (isBusy) return

        const validQuestionsToSave: QuestionData[] = previewQuestions
            .filter((question) => question.isValid)
            .map((question) => question.data as QuestionData)

        if (validQuestionsToSave.length === 0) {
            toast.error('Nenhuma pergunta válida encontrada no arquivo para importar.')
            return
        }

        setIsSaving(true)
        setFileError(null)

        try {
            await onSaveImportedQuestions(validQuestionsToSave)
            toast.success(`${validQuestionsToSave.length} perguntas importadas com sucesso.`)
            onClose()
        } catch (error) {
            console.error('Erro ao salvar perguntas importadas:', error)
            setFileError(
                `Erro ao salvar perguntas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            )
        } finally {
            setIsSaving(false)
        }
    }

    return {
        fileName,
        fileSizeLabel,
        previewQuestions,
        fileError,
        isProcessing,
        isSaving,
        isBusy,
        validCount,
        invalidCount,
        showFormatExample,
        setShowFormatExample,
        handleFileChange,
        handleClose,
        handleOpenChange,
        handleSave,
    }
}

export type ImportQuestionsController = ReturnType<typeof useImportQuestions>
