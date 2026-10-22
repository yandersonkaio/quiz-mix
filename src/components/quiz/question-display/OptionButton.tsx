import { useId } from 'react'
import type { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'
import clsx from 'clsx'

import type { Answer, ShowAnswersAfter } from './types'

interface OptionButtonProps {
    option: Answer
    isSelected: boolean
    isCorrect: boolean
    isIncorrect: boolean
    isSubmitted: boolean
    showAnswersAfter: ShowAnswersAfter
    onClick: () => void
    disabled: boolean
    label: string
    icon?: ReactNode
    isCorrectAnswer?: boolean
    feedback?: string | null
}

export function OptionButton({
    option,
    isSelected,
    isCorrect,
    isIncorrect,
    isSubmitted,
    showAnswersAfter,
    onClick,
    disabled,
    label,
    icon,
    isCorrectAnswer,
    feedback,
}: OptionButtonProps) {
    const feedbackId = useId()
    const isUntilCorrect = showAnswersAfter === 'untilCorrect'

    const showCorrect =
        (isUntilCorrect && isCorrect && isCorrectAnswer) ||
        (showAnswersAfter === 'immediately' &&
            isSubmitted &&
            isCorrectAnswer)

    const showIncorrect =
        (isUntilCorrect && isIncorrect) ||
        (showAnswersAfter === 'immediately' &&
            isSubmitted &&
            isSelected &&
            !isCorrectAnswer)

    const showSelected =
        isSelected &&
        (!isSubmitted || showAnswersAfter === 'end') &&
        !isCorrect &&
        !isIncorrect

    const isDisabled =
        disabled ||
        isIncorrect ||
        (isUntilCorrect && isCorrect && !isCorrectAnswer) ||
        (!isUntilCorrect && isSubmitted)

    const optionColors = showCorrect
        ? 'border-answer-correct-foreground/30 bg-answer-correct text-answer-correct-foreground'
        : showIncorrect
          ? 'border-answer-incorrect-foreground/30 bg-answer-incorrect text-answer-incorrect-foreground'
          : showSelected
            ? 'border-answer-selected-foreground/35 bg-answer-selected text-answer-selected-foreground ring-1 ring-answer-selected-foreground/15'
            : isDisabled
              ? 'border-border bg-muted/30 text-muted-foreground'
              : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent/50'

    const indicatorColors = showCorrect
        ? 'bg-answer-correct-foreground text-answer-correct'
        : showIncorrect
          ? 'bg-answer-incorrect-foreground text-answer-incorrect'
          : showSelected
            ? 'bg-answer-selected-foreground text-answer-selected'
            : 'border-border bg-muted/60 text-foreground border'

    return (
        <div
            className={clsx(
                'group w-full min-w-0 overflow-hidden rounded-2xl border shadow-xs transition-all duration-200',
                'focus-within:ring-ring/30 focus-within:ring-2',
                !isDisabled && 'motion-safe:hover:-translate-y-0.5',
                optionColors
            )}
        >
            <button
                type="button"
                onClick={onClick}
                disabled={isDisabled}
                aria-label={`Opção ${label}: ${option}`}
                aria-pressed={isSelected}
                aria-describedby={feedback ? feedbackId : undefined}
                className={clsx(
                    'block w-full min-w-0 p-3.5 text-left focus-visible:outline-none sm:p-4',
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
            >
                <span className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <span
                        className={clsx(
                            'flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors',
                            indicatorColors
                        )}
                        aria-hidden="true"
                    >
                        {label}
                    </span>

                    <span className="min-w-0 flex-1 self-center text-sm leading-relaxed font-medium wrap-break-word sm:text-base">
                        {option}
                    </span>

                    {icon && (
                        <span
                            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-current/20 bg-background/25"
                            aria-hidden="true"
                        >
                            {icon}
                        </span>
                    )}
                </span>

                {(showCorrect || showIncorrect) && (
                    <span className="mt-2 ml-[3.25rem] block text-xs font-semibold sm:ml-14">
                        {showCorrect ? 'Resposta correta' : 'Resposta incorreta'}
                    </span>
                )}
            </button>

            {feedback && (
                <div
                    id={feedbackId}
                    className="border-current/15 bg-background/20 border-t px-3.5 py-3.5 sm:pr-4 sm:pl-[4.5rem]"
                >
                    <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
                        <Lightbulb size={14} strokeWidth={2} aria-hidden="true" />
                        Explicação
                    </span>
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                        {feedback}
                    </p>
                </div>
            )}
        </div>
    )
}
