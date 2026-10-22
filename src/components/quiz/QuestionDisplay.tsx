
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Check, X, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

import type { Question } from '../../types/quiz'

interface QuestionDisplayProps {
    question: Question
    onAnswer: (answer: number | string) => void
    showAnswersAfter: 'immediately' | 'end' | 'untilCorrect'
    onNext: () => void
    currentAttempt?: (number | string)[]
    isLastQuestion?: boolean
}

interface OptionButtonProps {
    option: string | number
    isSelected: boolean
    isCorrect: boolean
    isIncorrect: boolean
    isSubmitted: boolean
    showAnswersAfter: QuestionDisplayProps['showAnswersAfter']
    onClick: (option: number | string) => void
    disabled: boolean
    label: string
    icon?: ReactNode
    isCorrectAnswer?: boolean
    feedback?: string | null
}

function OptionButton({
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
        isSelected &&
        !isSubmitted &&
        !isCorrect &&
        !isIncorrect

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
            onClick={() => onClick(option)}
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
                    {/* Identificador da alternativa */}
                    <span
                        className={clsx(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                            indicatorColors
                        )}
                    >
                        {icon || label}
                    </span>

                    {/* Texto da alternativa */}
                    <span className="min-w-0 flex-1 text-sm leading-relaxed wrap-break-word sm:text-base">
                        {option}
                    </span>
                </div>

                {/* Feedback individual */}
                {feedback && (
                    <div className="mt-3 ml-12 border-t border-current/20 pt-3 text-sm leading-relaxed whitespace-pre-line">
                        {feedback}
                    </div>
                )}
            </div>
        </button>
    )
}

export function QuestionDisplay(props: QuestionDisplayProps) {
    return <QuestionDisplayContent key={props.question.id} {...props} />
}

function QuestionDisplayContent({
    question,
    onAnswer,
    showAnswersAfter,
    onNext,
    currentAttempt,
    isLastQuestion = false,
}: QuestionDisplayProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<
        number | string | null
    >(null)

    const [isSubmitted, setIsSubmitted] = useState(false)

    const [incorrectAnswers, setIncorrectAnswers] = useState<
        Set<number | string>
    >(new Set())

    const [inputValue, setInputValue] = useState('')

    const isUntilCorrect = showAnswersAfter === 'untilCorrect'

    const latestAttempt =
        currentAttempt && currentAttempt.length > 0
            ? currentAttempt[currentAttempt.length - 1]
            : null

    const isCorrect =
        latestAttempt !== null &&
        (question.type === 'multiple-choice' ||
            question.type === 'true-false'
            ? Number(latestAttempt) === question.correctAnswer
            : String(latestAttempt).trim().toLowerCase() ===
            question.blankAnswer?.trim().toLowerCase())

    const handleOptionClick = (answer: number | string) => {
        if (isUntilCorrect && isCorrect) return
        if (!isUntilCorrect && isSubmitted) return
        if (incorrectAnswers.has(answer)) return

        setSelectedAnswer(answer)

        if (!isUntilCorrect) {
            setIsSubmitted(true)
            onAnswer(answer)

            if (showAnswersAfter === 'immediately') {
                if (isLastQuestion) {
                    onNext()
                } else {
                    setTimeout(() => {
                        setSelectedAnswer(null)
                        setIsSubmitted(false)
                        onNext()
                    }, 2000)
                }
            }
        }
    }

    const handleSubmit = () => {
        if (
            isUntilCorrect &&
            selectedAnswer !== null &&
            !isCorrect
        ) {
            setIsSubmitted(true)
            onAnswer(selectedAnswer)

            const isAnswerCorrect =
                question.type === 'multiple-choice' ||
                    question.type === 'true-false'
                    ? Number(selectedAnswer) === question.correctAnswer
                    : String(selectedAnswer).trim().toLowerCase() ===
                    question.blankAnswer?.trim().toLowerCase()

            if (!isAnswerCorrect) {
                setIncorrectAnswers(
                    (prev) => new Set([...prev, selectedAnswer])
                )
            }

            setSelectedAnswer(null)
            setIsSubmitted(false)
        }
    }

    const handleInputSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault()

        if (!inputValue.trim()) return

        if (isUntilCorrect) {
            setIsSubmitted(true)
            onAnswer(inputValue)

            const isAnswerCorrect =
                String(inputValue).trim().toLowerCase() ===
                question.blankAnswer?.trim().toLowerCase()

            if (!isAnswerCorrect) {
                setIncorrectAnswers(
                    (prev) =>
                        new Set([
                            ...prev,
                            inputValue.trim().toLowerCase(),
                        ])
                )
            }

            setInputValue('')
            setIsSubmitted(false)
        } else {
            handleOptionClick(inputValue)
        }
    }

    const getOptionLetter = (index: number): string => {
        return String.fromCharCode(65 + index)
    }

    const renderOptions = () => {
        if (question.type === 'multiple-choice') {
            return question.options?.map((option, index) => (
                <OptionButton
                    key={index}
                    option={option}
                    isSelected={selectedAnswer === index}
                    isCorrect={isCorrect && latestAttempt === index}
                    isIncorrect={incorrectAnswers.has(index)}
                    isSubmitted={isSubmitted}
                    showAnswersAfter={showAnswersAfter}
                    onClick={() => handleOptionClick(index)}
                    disabled={isUntilCorrect && isCorrect}
                    label={getOptionLetter(index)}
                    icon={
                        isUntilCorrect
                            ? isCorrect && latestAttempt === index
                                ? <Check size={18} strokeWidth={2.5} />
                                : incorrectAnswers.has(index)
                                    ? <X size={18} strokeWidth={2.5} />
                                    : undefined
                            : showAnswersAfter === 'immediately' &&
                                isSubmitted
                                ? Number(index) === question.correctAnswer
                                    ? <Check size={18} strokeWidth={2.5} />
                                    : selectedAnswer === index &&
                                        Number(index) !== question.correctAnswer
                                        ? <X size={18} strokeWidth={2.5} />
                                        : undefined
                                : undefined
                    }
                    isCorrectAnswer={
                        Number(index) === question.correctAnswer
                    }
                    feedback={
                        isUntilCorrect &&
                            (incorrectAnswers.has(index) ||
                                latestAttempt === index)
                            ? question.optionFeedback?.[index] ?? null
                            : null
                    }
                />
            ))
        }

        if (question.type === 'true-false') {
            return [1, 0].map((value) => (
                <OptionButton
                    key={value}
                    option={value === 1 ? 'Verdadeiro' : 'Falso'}
                    isSelected={selectedAnswer === value}
                    isCorrect={isCorrect && latestAttempt === value}
                    isIncorrect={incorrectAnswers.has(value)}
                    isSubmitted={isSubmitted}
                    showAnswersAfter={showAnswersAfter}
                    onClick={() => handleOptionClick(value)}
                    disabled={isUntilCorrect && isCorrect}
                    label={value === 1 ? 'V' : 'F'}
                    icon={
                        isUntilCorrect
                            ? isCorrect && latestAttempt === value
                                ? <Check size={18} strokeWidth={2.5} />
                                : incorrectAnswers.has(value)
                                    ? <X size={18} strokeWidth={2.5} />
                                    : undefined
                            : showAnswersAfter === 'immediately' &&
                                isSubmitted
                                ? Number(value) === question.correctAnswer
                                    ? <Check size={18} strokeWidth={2.5} />
                                    : selectedAnswer === value &&
                                        Number(value) !== question.correctAnswer
                                        ? <X size={18} strokeWidth={2.5} />
                                        : undefined
                                : undefined
                    }
                    isCorrectAnswer={
                        Number(value) === question.correctAnswer
                    }
                />
            ))
        }

        return null
    }

    const inputColors =
        isUntilCorrect && isCorrect
            ? 'border-answer-correct-foreground/40 bg-answer-correct text-answer-correct-foreground'
            : isUntilCorrect &&
                incorrectAnswers.size > 0 &&
                !isCorrect
                ? 'border-answer-incorrect-foreground/40 bg-answer-incorrect text-answer-incorrect-foreground'
                : inputValue && !isSubmitted && !isCorrect
                    ? 'border-answer-selected-foreground/40 bg-answer-selected text-answer-selected-foreground'
                    : 'border-input bg-background text-foreground'

    return (
        <div className="border-border bg-card text-card-foreground w-full min-w-0 rounded-xl border p-4 sm:p-6">
            {/* Pergunta */}
            <div className="mb-6">
                <h2 className="text-foreground text-lg leading-relaxed font-semibold tracking-tight wrap-break-word sm:text-xl">
                    {question.question}
                </h2>
            </div>

            {/* Múltipla escolha / Verdadeiro ou falso */}
            {(question.type === 'multiple-choice' ||
                question.type === 'true-false') && (
                    <div className="space-y-3">
                        {renderOptions()}
                    </div>
                )}

            {/* Preenchimento */}
            {question.type === 'fill-in-the-blank' && (
                <form
                    onSubmit={handleInputSubmit}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(event) =>
                            setInputValue(event.target.value)
                        }
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
                            (isUntilCorrect &&
                                (isCorrect || !inputValue.trim())) ||
                            (!isUntilCorrect && isSubmitted)
                        }
                        aria-label="Enviar resposta"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Responder
                    </button>
                </form>
            )}

            {/* Botão de resposta no modo Estudo */}
            {isUntilCorrect &&
                question.type !== 'fill-in-the-blank' &&
                !isCorrect &&
                selectedAnswer !== null && (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        aria-label="Enviar resposta"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring mt-5 flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                        Responder
                    </button>
                )}

            {/* Avançar depois de acertar */}
            {isUntilCorrect && isCorrect && (
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
            )}
        </div>
    )
}
