import { ArrowRight } from 'lucide-react'

import type { Question } from '../../../types/quiz'
import type { Answer, ShowAnswersAfter } from './types'

interface QuestionActionsProps {
    questionType: Question['type']
    showAnswersAfter: ShowAnswersAfter
    selectedAnswer: Answer | null
    isCorrect: boolean
    isLastQuestion: boolean
    onSubmit: () => void
    onNext: () => void
}

export function QuestionActions({
    questionType,
    showAnswersAfter,
    selectedAnswer,
    isCorrect,
    isLastQuestion,
    onSubmit,
    onNext,
}: QuestionActionsProps) {
    if (showAnswersAfter !== 'untilCorrect') return null

    if (isCorrect) {
        return (
            <button
                type="button"
                onClick={onNext}
                aria-label={
                    isLastQuestion
                        ? 'Ver resultado do quiz'
                        : 'Avançar para a próxima pergunta'
                }
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                {isLastQuestion ? 'Ver resultado' : 'Avançar'}
                <ArrowRight size={18} />
            </button>
        )
    }

    if (questionType === 'fill-in-the-blank' || selectedAnswer === null) {
        return null
    }

    return (
        <button
            type="button"
            onClick={onSubmit}
            aria-label="Enviar resposta"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-5 flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
            Responder
        </button>
    )
}
