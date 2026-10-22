import { Check, X } from 'lucide-react'

import type { Question } from '../../../types/quiz'
import type { Answer, ShowAnswersAfter } from './types'
import { OptionButton } from './OptionButton'

interface ChoiceOptionsProps {
    question: Question
    selectedAnswer: Answer | null
    incorrectAnswers: Set<Answer>
    latestAttempt: Answer | null
    isCorrect: boolean
    isSubmitted: boolean
    showAnswersAfter: ShowAnswersAfter
    onSelect: (answer: Answer) => void
}

export function ChoiceOptions({
    question,
    selectedAnswer,
    incorrectAnswers,
    latestAttempt,
    isCorrect,
    isSubmitted,
    showAnswersAfter,
    onSelect,
}: ChoiceOptionsProps) {
    if (
        question.type !== 'multiple-choice' &&
        question.type !== 'true-false'
    ) {
        return null
    }

    const isUntilCorrect = showAnswersAfter === 'untilCorrect'

    const choices =
        question.type === 'multiple-choice'
            ? (question.options ?? []).map((option, index) => ({
                  value: index,
                  option,
                  label: String.fromCharCode(65 + index),
                  feedback: question.optionFeedback?.[index] ?? null,
              }))
            : [
                  { value: 1, option: 'Verdadeiro', label: 'V', feedback: null },
                  { value: 0, option: 'Falso', label: 'F', feedback: null },
              ]

    return (
        <div className="space-y-3">
            {choices.map(({ value, option, label, feedback }) => {
                const isIncorrect = incorrectAnswers.has(value)
                const isSelected = selectedAnswer === value
                const isCorrectAnswer = value === question.correctAnswer

                const showCheck = isUntilCorrect
                    ? isCorrect && latestAttempt === value
                    : showAnswersAfter === 'immediately' &&
                      isSubmitted &&
                      isCorrectAnswer

                const showX = isUntilCorrect
                    ? isIncorrect
                    : showAnswersAfter === 'immediately' &&
                      isSubmitted &&
                      isSelected &&
                      !isCorrectAnswer

                return (
                    <OptionButton
                        key={value}
                        option={option}
                        isSelected={isSelected}
                        isCorrect={isCorrect && latestAttempt === value}
                        isIncorrect={isIncorrect}
                        isSubmitted={isSubmitted}
                        showAnswersAfter={showAnswersAfter}
                        onClick={() => onSelect(value)}
                        disabled={isUntilCorrect && isCorrect}
                        label={label}
                        icon={
                            showCheck ? (
                                <Check size={18} strokeWidth={2.5} />
                            ) : showX ? (
                                <X size={18} strokeWidth={2.5} />
                            ) : undefined
                        }
                        isCorrectAnswer={isCorrectAnswer}
                        feedback={
                            question.type === 'multiple-choice' &&
                            isUntilCorrect &&
                            (isIncorrect || latestAttempt === value)
                                ? feedback
                                : null
                        }
                    />
                )
            })}
        </div>
    )
}
