import type { FormEvent } from 'react'
import { CheckCircle2, CircleAlert, PencilLine, Send } from 'lucide-react'
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
            <div className="space-y-2">
                <label htmlFor="quiz-blank-answer" className="text-foreground block text-sm font-medium">
                    Sua resposta
                </label>

                <div className="relative">
                    <PencilLine
                        size={19}
                        strokeWidth={1.8}
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 opacity-70"
                        aria-hidden="true"
                    />
                    <input
                        id="quiz-blank-answer"
                        type="text"
                        value={inputValue}
                        onChange={(event) => onInputChange(event.target.value)}
                        className={clsx(
                            'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border pr-4 pl-11 text-base outline-none transition-colors focus-visible:ring-2',
                            'disabled:cursor-not-allowed disabled:opacity-60',
                            inputColors
                        )}
                        placeholder="Digite sua resposta"
                        required
                        disabled={isUntilCorrect && isCorrect}
                        aria-label="Resposta para a pergunta"
                        autoFocus
                    />
                </div>
            </div>

            {isUntilCorrect && hasIncorrectAnswers && !isCorrect && (
                <p
                    role="status"
                    className="border-answer-incorrect-foreground/20 bg-answer-incorrect text-answer-incorrect-foreground flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm leading-relaxed"
                >
                    <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    A tentativa anterior não estava correta. Tente novamente.
                </p>
            )}

            {isUntilCorrect && isCorrect && (
                <p
                    role="status"
                    className="border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm leading-relaxed"
                >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    Resposta correta! Você pode avançar.
                </p>
            )}

            {!(isUntilCorrect && isCorrect) && (
                <button
                    type="submit"
                    disabled={
                        (isUntilCorrect && (isCorrect || !inputValue.trim())) ||
                        (!isUntilCorrect && isSubmitted)
                    }
                    aria-label="Enviar resposta"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Send size={17} strokeWidth={2} aria-hidden="true" />
                    Responder
                </button>
            )}
        </form>
    )
}
