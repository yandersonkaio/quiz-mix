import type { ReactNode } from 'react'
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
        isSelected && !isSubmitted && !isCorrect && !isIncorrect

    const isDisabled =
        disabled ||
        isIncorrect ||
        (isUntilCorrect && isCorrect && !isCorrectAnswer) ||
        (showAnswersAfter === 'immediately' && isSubmitted)

    const optionColors = showCorrect
        ? 'border-answer-correct-foreground/30 bg-answer-correct text-answer-correct-foreground'
        : showIncorrect
          ? 'border-answer-incorrect-foreground/30 bg-answer-incorrect text-answer-incorrect-foreground'
          : showSelected
            ? 'border-answer-selected-foreground/30 bg-answer-selected text-answer-selected-foreground'
            : isDisabled
              ? 'border-border bg-muted/50 text-muted-foreground'
              : 'border-border bg-muted/50 text-foreground hover:border-ring/50 hover:bg-accent hover:text-accent-foreground'

    const indicatorColors = showCorrect
        ? 'bg-answer-correct-foreground text-answer-correct'
        : showIncorrect
          ? 'bg-answer-incorrect-foreground text-answer-incorrect'
          : showSelected
            ? 'bg-answer-selected-foreground text-answer-selected'
            : 'border-border bg-background text-foreground border'

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            aria-label={`Opção ${label}: ${option}`}
            aria-pressed={isSelected}
            className={clsx(
                'flex w-full min-w-0 items-start rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                optionColors,
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
            )}
        >
            <div className="flex w-full min-w-0 flex-col">
                <div className="flex min-w-0 items-center gap-3">
                    <span
                        className={clsx(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                            indicatorColors
                        )}
                    >
                        {icon || label}
                    </span>

                    <span className="min-w-0 flex-1 text-sm leading-relaxed wrap-break-word sm:text-base">
                        {option}
                    </span>
                </div>

                {feedback && (
                    <div className="mt-3 ml-12 border-t border-current/20 pt-3 text-sm leading-relaxed whitespace-pre-line">
                        {feedback}
                    </div>
                )}
            </div>
        </button>
    )
}
