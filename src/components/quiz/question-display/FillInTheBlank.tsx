import type { FormEvent } from 'react'
import clsx from 'clsx'

interface FillInTheBlankProps {
    inputValue: string
    onInputChange: (value: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    isUntilCorrect: boolean
    isCorrect: boolean
    hasIncorrectAnswers: boolean
    isSubmitted: boolean
}

export function FillInTheBlank({
    inputValue,
    onInputChange,
    onSubmit,
    isUntilCorrect,
    isCorrect,
    hasIncorrectAnswers,
    isSubmitted,
}: FillInTheBlankProps) {
    const inputColors =
        isUntilCorrect && isCorrect
            ? 'border-answer-correct-foreground/40 bg-answer-correct text-answer-correct-foreground'
            : isUntilCorrect && hasIncorrectAnswers && !isCorrect
              ? 'border-answer-incorrect-foreground/40 bg-answer-incorrect text-answer-incorrect-foreground'
              : inputValue && !isSubmitted && !isCorrect
                ? 'border-answer-selected-foreground/40 bg-answer-selected text-answer-selected-foreground'
                : 'border-input bg-background text-foreground'

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <input
                type="text"
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                className={clsx(
                    'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus-visible:ring-2',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                    inputColors
                )}
                placeholder="Digite sua resposta"
                required
                disabled={isUntilCorrect && isCorrect}
                aria-label="Resposta para a pergunta"
                autoFocus
            />

            <button
                type="submit"
                disabled={
                    (isUntilCorrect && (isCorrect || !inputValue.trim())) ||
                    (!isUntilCorrect && isSubmitted)
                }
                aria-label="Enviar resposta"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
                Responder
            </button>
        </form>
    )
}
