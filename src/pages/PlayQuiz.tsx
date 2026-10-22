import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useQuizData } from '../hooks/useQuizData'
import { useTimer } from '../hooks/useTimer'

import { QuizHeader } from '../components/quiz/QuizHeader'
import { QuestionDisplay } from '../components/quiz/QuestionDisplay'
import { ResultsDisplay } from '../components/quiz/ResultsDisplay'

import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

import type { Question, UserAnswer } from '../types/quiz'

const checkAnswer = (
    question: Question,
    answer: number | string
): boolean => {
    if (
        question.type === 'multiple-choice' ||
        question.type === 'true-false'
    ) {
        return Number(answer) === question.correctAnswer
    }

    if (question.type === 'fill-in-the-blank') {
        return (
            String(answer).trim().toLowerCase() ===
            question.blankAnswer?.trim().toLowerCase()
        )
    }

    return false
}

export default function PlayQuiz() {
    const {
        quiz,
        questions,
        loading,
        fetchRanking,
        saveAttempt,
    } = useQuizData()

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
    const [showResult, setShowResult] = useState(false)
    const [currentAttempt, setCurrentAttempt] = useState<(number | string)[]>([])
    const [questionAttemptCount, setQuestionAttemptCount] = useState(0)

    const answersRef = useRef<UserAnswer[]>([])
    const completedQuestionsRef = useRef<Set<string>>(new Set())
    const isFinalizingRef = useRef(false)
    const hasFetchedRankingRef = useRef(false)

    const navigate = useNavigate()
    const currentQuestion = questions[currentQuestionIndex]
    const isUntilCorrectMode = quiz?.settings.showAnswersAfter === 'untilCorrect'
    const timeLimit = quiz?.settings.timeLimitPerQuestion ?? 0

    const isTimerActive =
        !loading &&
        !!quiz &&
        !!currentQuestion &&
        timeLimit > 0 &&
        !isUntilCorrectMode &&
        !showResult

    const appendAnswer = useCallback((answer: UserAnswer) => {
        const nextAnswers = [...answersRef.current, answer]
        answersRef.current = nextAnswers
        setUserAnswers(nextAnswers)
        return nextAnswers
    }, [])

    const goToNextQuestion = useCallback(() => {
        if (isFinalizingRef.current) return

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setCurrentAttempt([])
            return
        }

        isFinalizingRef.current = true

        const answers = answersRef.current
        const mode = isUntilCorrectMode ? 'study' : 'challenge'
        const correctCount = isUntilCorrectMode
            ? questions.length
            : answers.filter((answer) => answer.isCorrect).length
        const totalAttempts = isUntilCorrectMode
            ? answers.reduce(
                  (sum, answer) => sum + (answer.attempts || 0),
                  0
              ) + questionAttemptCount
            : undefined

        void saveAttempt(
            correctCount,
            questions.length,
            answers,
            totalAttempts,
            mode
        )
            .catch((error) => {
                console.error('Erro ao salvar resultado do quiz:', error)
                toast.error('Não foi possível salvar seu resultado.')
            })
            .finally(() => {
                setShowResult(true)
            })
    }, [
        currentQuestionIndex,
        questions.length,
        isUntilCorrectMode,
        questionAttemptCount,
        saveAttempt,
    ])

    const { timeLeft, pauseTimer, resetTimer } = useTimer({
        initialTime: timeLimit,
        isActive: isTimerActive,
        onTimeUp: () => {
            if (
                !isTimerActive ||
                !currentQuestion ||
                isFinalizingRef.current ||
                completedQuestionsRef.current.has(currentQuestion.id)
            ) {
                return
            }

            completedQuestionsRef.current.add(currentQuestion.id)

            appendAnswer({
                questionId: currentQuestion.id,
                selectedAnswer: -1,
                isCorrect: false,
                attempts: 1,
            })

            toast.info('Tempo esgotado!')
            goToNextQuestion()
        },
    })

    useEffect(() => {
        if (isTimerActive) {
            resetTimer()
        }
    }, [currentQuestionIndex, isTimerActive, resetTimer])

    useEffect(() => {
        if (showResult && !hasFetchedRankingRef.current) {
            hasFetchedRankingRef.current = true
            const mode = isUntilCorrectMode ? 'study' : 'challenge'

            void fetchRanking(mode).catch((error) => {
                console.error('Erro ao carregar ranking:', error)
            })
        }
    }, [showResult, fetchRanking, isUntilCorrectMode])

    const handleAnswer = useCallback(
        (answer: number | string) => {
            if (!quiz || !currentQuestion || showResult || isFinalizingRef.current) {
                return
            }

            if (completedQuestionsRef.current.has(currentQuestion.id)) return

            const isCorrect = checkAnswer(currentQuestion, answer)

            if (isUntilCorrectMode) {
                setCurrentAttempt((prev) => [...prev, answer])

                const newAttemptCount = questionAttemptCount + 1
                setQuestionAttemptCount(newAttemptCount)

                if (isCorrect) {
                    completedQuestionsRef.current.add(currentQuestion.id)

                    appendAnswer({
                        questionId: currentQuestion.id,
                        selectedAnswer: answer,
                        isCorrect: true,
                        attempts: newAttemptCount,
                    })

                    setQuestionAttemptCount(0)
                }

                return
            }

            completedQuestionsRef.current.add(currentQuestion.id)

            if (timeLimit > 0) {
                pauseTimer()
            }

            appendAnswer({
                questionId: currentQuestion.id,
                selectedAnswer: answer,
                isCorrect,
                attempts: 1,
            })

            if (quiz.settings.showAnswersAfter === 'end') {
                goToNextQuestion()
            }
        },
        [
            quiz,
            currentQuestion,
            showResult,
            isUntilCorrectMode,
            questionAttemptCount,
            timeLimit,
            pauseTimer,
            appendAnswer,
            goToNextQuestion,
        ]
    )

    const handleRestart = useCallback(() => {
        answersRef.current = []
        completedQuestionsRef.current = new Set()
        isFinalizingRef.current = false
        hasFetchedRankingRef.current = false

        setCurrentQuestionIndex(0)
        setUserAnswers([])
        setCurrentAttempt([])
        setQuestionAttemptCount(0)
        setShowResult(false)
        resetTimer()
    }, [resetTimer])

    if (loading) {
        return <Loading />
    }

    if (!quiz) {
        return <ErrorMessage message="Quiz não encontrado." />
    }

    if (questions.length === 0) {
        return <ErrorMessage message="Nenhuma pergunta disponível no quiz." />
    }

    if (!showResult && !currentQuestion) {
        return <ErrorMessage message="Não foi possível carregar a pergunta atual." />
    }

    return (
        <div className="bg-background text-foreground flex min-h-dvh w-full items-center justify-center px-4 py-6 transition-colors duration-200 sm:px-6 sm:py-10">
            <div className="mx-auto w-full min-w-0 max-w-2xl">
                {!showResult && currentQuestion ? (
                    <>
                        <QuizHeader
                            quiz={quiz}
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={questions.length}
                            timeLeft={isUntilCorrectMode ? null : timeLeft}
                        />

                        <QuestionDisplay
                            question={currentQuestion}
                            onAnswer={handleAnswer}
                            showAnswersAfter={quiz.settings.showAnswersAfter}
                            onNext={goToNextQuestion}
                            currentAttempt={
                                isUntilCorrectMode ? currentAttempt : undefined
                            }
                            isLastQuestion={
                                currentQuestionIndex === questions.length - 1
                            }
                        />
                    </>
                ) : (
                    <ResultsDisplay
                        quiz={quiz}
                        questions={questions}
                        userAnswers={userAnswers}
                        onRestart={handleRestart}
                        onBack={() => navigate(`/quiz/details/${quiz.id}`)}
                        mode={isUntilCorrectMode ? 'study' : 'challenge'}
                    />
                )}
            </div>
        </div>
    )
}
