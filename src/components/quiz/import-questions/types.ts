import type { Question } from '@/types/quiz'

export type QuestionData = Omit<Question, 'id'>

export interface ImportQuestionsModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveImportedQuestions: (questions: QuestionData[]) => Promise<void>
    quizId: string
}

export interface PreviewQuestion {
    data: Partial<Question>
    errors: string[]
    isValid: boolean
}
