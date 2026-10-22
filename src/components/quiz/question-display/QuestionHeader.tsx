import { BookOpen, CircleHelp, ListChecks, TextCursorInput } from 'lucide-react'

import type { Question } from '../../../types/quiz'
import type { ShowAnswersAfter } from './types'

interface QuestionHeaderProps {
    question: Question
    showAnswersAfter: ShowAnswersAfter
}

export function QuestionHeader({ question, showAnswersAfter }: QuestionHeaderProps) {
    const isStudyMode = showAnswersAfter === 'untilCorrect'

    const typeConfig =
        question.type === 'multiple-choice'
            ? {
                  label: 'Múltipla escolha',
                  instruction: isStudyMode
                      ? 'Selecione uma alternativa e confirme sua resposta.'
                      : 'Escolha a alternativa que considera correta.',
                  Icon: ListChecks,
              }
            : question.type === 'true-false'
              ? {
                    label: 'Verdadeiro ou falso',
                    instruction: isStudyMode
                        ? 'Selecione uma opção e confirme sua resposta.'
                        : 'Escolha entre verdadeiro e falso.',
                    Icon: CircleHelp,
                }
              : {
                    label: 'Complete a resposta',
                    instruction: 'Digite sua resposta no campo abaixo.',
                    Icon: TextCursorInput,
                }

    const { Icon } = typeConfig

    return (
        <div className="border-border/70 mb-6 border-b pb-5 sm:mb-7 sm:pb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold">
                    <Icon size={15} strokeWidth={2} aria-hidden="true" />
                    {typeConfig.label}
                </span>

                {isStudyMode && (
                    <span className="border-border bg-muted/60 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
                        <BookOpen size={14} strokeWidth={1.8} aria-hidden="true" />
                        Modo estudo
                    </span>
                )}
            </div>

            <h2 className="text-foreground text-xl leading-snug font-semibold tracking-tight wrap-break-word sm:text-2xl sm:leading-snug">
                {question.question}
            </h2>

            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {typeConfig.instruction}
            </p>
        </div>
    )
}
