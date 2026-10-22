import type { Question } from '../../../types/quiz'

export type Answer = number | string

export type ShowAnswersAfter = 'immediately' | 'end' | 'untilCorrect'

export interface QuestionDisplayProps {
    question: Question
    onAnswer: (answer: Answer) => void
    showAnswersAfter: ShowAnswersAfter
    onNext: () => void
    currentAttempt?: Answer[]
    isLastQuestion?: boolean
}
