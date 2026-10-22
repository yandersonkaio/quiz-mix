import { useState } from 'react'
import type { FormEvent } from 'react'

import type { Answer, QuestionDisplayProps } from './types'

export function useQuestionAnswer({
    question,
    onAnswer,
    onNext,
    showAnswersAfter,
    currentAttempt,
    isLastQuestion = false,
}: QuestionDisplayProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [incorrectAnswers, setIncorrectAnswers] = useState<Set<Answer>>(
        new Set()
    )
    const [inputValue, setInputValue] = useState('')

    const isUntilCorrect = showAnswersAfter === 'untilCorrect'

    const latestAttempt =
        currentAttempt && currentAttempt.length > 0
            ? currentAttempt[currentAttempt.length - 1]
            : null

    const isCorrect =
        latestAttempt !== null &&
        (question.type === 'multiple-choice' || question.type === 'true-false'
            ? Number(latestAttempt) === question.correctAnswer
            : String(latestAttempt).trim().toLowerCase() ===
              question.blankAnswer?.trim().toLowerCase())

    const handleOptionClick = (answer: Answer) => {
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
        if (isUntilCorrect && selectedAnswer !== null && !isCorrect) {
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

    const handleInputSubmit = (event: FormEvent<HTMLFormElement>) => {
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
                        new Set([...prev, inputValue.trim().toLowerCase()])
                )
            }

            setInputValue('')
            setIsSubmitted(false)
        } else {
            handleOptionClick(inputValue)
        }
    }

    return {
        selectedAnswer,
        isSubmitted,
        incorrectAnswers,
        inputValue,
        setInputValue,
        latestAttempt,
        isCorrect,
        handleOptionClick,
        handleSubmit,
        handleInputSubmit,
    }
}
