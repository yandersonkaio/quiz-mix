import { ArrowRight, CheckCircle2, CircleAlert, Send } from 'lucide-react'

import type { Question } from '../../../types/quiz'
import type { Answer, ShowAnswersAfter } from './types'

interface QuestionActionsProps {
    questionType: Question['type']
    showAnswersAfter: ShowAnswersAfter
    selectedAnswer: Answer | null
    isCorrect: boolean
    hasIncorrectAnswers: boolean
    isLastQuestion: boolean
    onSubmit: () => void
    onNext: () => void
}

export function QuestionActions({
    questionType,
    showAnswersAfter,
    selectedAnswer,
    isCorrect,
    hasIncorrectAnswers,
    isLastQuestion,
    onSubmit,
    onNext,
}: QuestionActionsProps) {
    if (showAnswersAfter !== 'untilCorrect') return null

    if (isCorrect) {
        return (
            <div className="mt-6 space-y-4">
                {questionType !== 'fill-in-the-blank' && (
                    <div
                        role="status"
                        className="border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground flex items-center gap-3 rounded-xl border px-4 py-3.5"
                    >
                        <CheckCircle2 size={21} className="shrink-0" aria-hidden="true" />
                        <span className="text-sm font-semibold">Você acertou!</span>
                    </div>
                )}
                <button
                    type="button"
                    onClick={onNext}
                    aria-label={
                        isLastQuestion
                            ? 'Ver resultado do quiz'
                            : 'Avançar para a próxima pergunta'
                    }
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:outline-none"
                >
                    {isLastQuestion ? 'Ver resultado' : 'Próxima pergunta'}
                    <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                </button>
            </div>
        )
    }

    if (questionType === 'fill-in-the-blank') return null

    if (selectedAnswer === null) {
        return hasIncorrectAnswers ? (
            <div
                role="status"
                className="border-answer-incorrect-foreground/20 bg-answer-incorrect text-answer-incorrect-foreground mt-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-relaxed"
            >
                <CircleAlert size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
                Não foi dessa vez. Selecione outra alternativa para continuar.
            </div>
        ) : null
    }

    return (
        <button
            type="button"
            onClick={onSubmit}
            aria-label="Enviar resposta"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:outline-none"
        >
            <Send size={17} strokeWidth={2} aria-hidden="true" />
            Responder
        </button>
    )
}
