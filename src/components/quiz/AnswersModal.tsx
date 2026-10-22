import { useSyncExternalStore } from 'react'
import { BookOpen, Target, Check, CircleX } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'

import type { Question, Attempt } from '../../types/quiz'

interface AnswersModalProps {
    isOpen: boolean
    onClose: () => void
    attempt: Attempt
    questions: Question[]
}

const mobileMediaQuery = '(max-width: 767px)'

function subscribeToMobileChanges(onChange: () => void) {
    const mediaQuery = window.matchMedia(mobileMediaQuery)
    mediaQuery.addEventListener('change', onChange)

    return () => mediaQuery.removeEventListener('change', onChange)
}

function isMobileViewport() {
    return typeof window !== 'undefined' && window.matchMedia(mobileMediaQuery).matches
}

function AnswersReview({
    attempt,
    questions,
}: Pick<AnswersModalProps, 'attempt' | 'questions'>) {
    const isStudyMode = attempt.mode === 'study'

    const getAnswerText = (
        question: Question,
        answer: number | string
    ) => {
        if (answer === -1) return 'Tempo esgotado'

        if (question.type === 'multiple-choice' && question.options) {
            return question.options[Number(answer)]
        }

        if (question.type === 'true-false') {
            return Number(answer) === 1 ? 'Verdadeiro' : 'Falso'
        }

        return String(answer)
    }

    const getCorrectAnswerText = (question: Question) => {
        if (
            question.type === 'multiple-choice' &&
            question.options &&
            question.correctAnswer !== undefined
        ) {
            return question.options[question.correctAnswer]
        }

        if (question.type === 'true-false') {
            return question.correctAnswer === 1 ? 'Verdadeiro' : 'Falso'
        }

        return question.blankAnswer || ''
    }

    const formattedDateTime = attempt.completedAt
        ? attempt.completedAt.toDate().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
        : 'Data não disponível'

    const totalAttempts = attempt.answers.reduce(
        (sum, answer) => sum + (answer.attempts || 1),
        0
    )

    const efficiency =
        questions.length > 0 && totalAttempts > 0
            ? ((questions.length / totalAttempts) * 100).toFixed(1)
            : '0.0'

    const avgAttemptsPerQuestion =
        questions.length > 0
            ? (totalAttempts / questions.length).toFixed(1)
            : '0.0'

    return (
        <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <section className="mb-7">
                {isStudyMode ? (
                    <>
                        <div className="mb-5">
                            <h3 className="text-foreground text-base font-semibold">
                                {attempt.displayName}, você completou o quiz!
                            </h3>

                            <p className="text-muted-foreground mt-1 text-sm">
                                Confira seu desempenho nesta rodada de estudo.
                            </p>
                        </div>

                        <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="border-border bg-muted/50 min-w-0 rounded-xl border p-3 text-center sm:p-4">
                                <p className="text-muted-foreground text-xs">
                                    Tentativas
                                </p>

                                <p className="text-foreground mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                                    {totalAttempts}
                                </p>
                            </div>

                            <div className="border-border bg-muted/50 min-w-0 rounded-xl border p-3 text-center sm:p-4">
                                <p className="text-muted-foreground text-xs">
                                    Eficiência
                                </p>

                                <p className="text-foreground mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                                    {efficiency}%
                                </p>
                            </div>

                            <div className="border-border bg-muted/50 min-w-0 rounded-xl border p-3 text-center sm:p-4">
                                <p className="text-muted-foreground text-xs">
                                    Média/Questão
                                </p>

                                <p className="text-foreground mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                                    {avgAttemptsPerQuestion}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="border-border bg-muted/50 mb-5 rounded-xl border p-4 sm:p-5">
                            <p className="text-muted-foreground mb-2 text-sm">
                                Resultado do desafio
                            </p>

                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <span className="text-foreground text-3xl font-bold tracking-tight">
                                    {attempt.percentage}%
                                </span>

                                <span className="text-muted-foreground text-sm">
                                    de aproveitamento
                                </span>
                            </div>

                            <div className="border-border mt-4 border-t pt-3">
                                <p className="text-muted-foreground text-sm">
                                    Acertos:{' '}
                                    <span className="text-foreground font-semibold">
                                        {attempt.correctAnswers}
                                    </span>
                                    {' de '}
                                    <span className="text-foreground font-semibold">
                                        {attempt.totalQuestions}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </>
                )}

                <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
                    <span>Concluído em:</span>
                    <span className="text-foreground font-medium">
                        {formattedDateTime}
                    </span>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-foreground text-base font-semibold tracking-tight sm:text-lg">
                        Revisão das Respostas
                    </h3>

                    <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap">
                        {attempt.answers.length}{' '}
                        {attempt.answers.length === 1
                            ? 'questão'
                            : 'questões'}
                    </span>
                </div>

                <div className="space-y-3">
                    {attempt.answers.map((answer, index) => {
                        const question = questions.find(
                            (item) => item.id === answer.questionId
                        )

                        if (!question) return null

                        return (
                            <div
                                key={`${answer.questionId}-${index}`}
                                className="border-border bg-muted/40 rounded-xl border p-4"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground text-xs font-medium">
                                        Questão {index + 1}
                                    </span>

                                    <span
                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${answer.isCorrect
                                            ? 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground'
                                            : 'border-answer-incorrect-foreground/20 bg-answer-incorrect text-answer-incorrect-foreground'
                                            }`}
                                    >
                                        {answer.isCorrect ? (
                                            <>
                                                <Check size={13} />
                                                Correto
                                            </>
                                        ) : (
                                            <>
                                                <CircleX size={13} />
                                                Errado
                                            </>
                                        )}
                                    </span>
                                </div>

                                <p className="text-foreground mb-4 text-sm leading-relaxed font-medium wrap-break-word sm:text-base">
                                    {question.question}
                                </p>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-xs">
                                            Sua resposta
                                        </p>

                                        <p
                                            className={`font-medium wrap-break-word ${answer.isCorrect
                                                ? 'text-answer-correct-foreground'
                                                : 'text-answer-incorrect-foreground'
                                                }`}
                                        >
                                            {getAnswerText(
                                                question,
                                                answer.selectedAnswer
                                            )}
                                        </p>
                                    </div>

                                    {!answer.isCorrect && (
                                        <div className="border-border border-t pt-3">
                                            <p className="text-muted-foreground mb-1 text-xs">
                                                Resposta correta
                                            </p>

                                            <p className="text-foreground font-medium wrap-break-word">
                                                {getCorrectAnswerText(question)}
                                            </p>
                                        </div>
                                    )}

                                    {isStudyMode && (
                                        <div className="border-border border-t pt-3">
                                            <p className="text-muted-foreground text-xs">
                                                Tentativas nesta questão:{' '}
                                                <span className="text-foreground font-semibold">
                                                    {answer.attempts || 1}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}

function AnswersFooter({ onClose }: Pick<AnswersModalProps, 'onClose'>) {
    return (
        <div className="border-border bg-card flex shrink-0 justify-end border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <button
                type="button"
                onClick={onClose}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:w-auto sm:min-w-28"
            >
                Fechar
            </button>
        </div>
    )
}

export default function AnswersModal({
    isOpen,
    onClose,
    attempt,
    questions,
}: AnswersModalProps) {
    const isMobile = useSyncExternalStore(
        subscribeToMobileChanges,
        isMobileViewport,
        () => false
    )

    const isStudyMode = attempt.mode === 'study'
    const ModeIcon = isStudyMode ? BookOpen : Target
    const title = isStudyMode
        ? 'Resultado do Estudo'
        : `Respostas de ${attempt.displayName}`

    const handleOpenChange = (open: boolean) => {
        if (!open) onClose()
    }

    if (isMobile) {
        return (
            <Drawer open={isOpen} onOpenChange={handleOpenChange}>
                <DrawerContent className="border-border bg-card text-card-foreground flex max-h-[95dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0">
                    <DrawerHeader className="border-border shrink-0 border-b px-5 pt-5 pb-4 text-left">
                        <div className="flex min-w-0 items-center gap-3 text-left">
                            <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                                <ModeIcon size={20} strokeWidth={1.8} aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                                <DrawerTitle className="text-foreground text-left text-lg leading-snug font-semibold tracking-tight wrap-break-word">
                                    {title}
                                </DrawerTitle>
                                <DrawerDescription className="text-muted-foreground mt-1 text-left text-xs">
                                    Revisão da tentativa
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    <AnswersReview attempt={attempt} questions={questions} />
                    <AnswersFooter onClose={onClose} />
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-3rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl sm:max-w-2xl">
                <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pr-14 text-left sm:px-6 sm:pr-14">
                    <div className="flex min-w-0 items-center gap-3 text-left">
                        <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                            <ModeIcon size={20} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-foreground text-left text-lg leading-snug font-semibold tracking-tight wrap-break-word sm:text-xl">
                                {title}
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground mt-1 text-left text-xs">
                                Revisão da tentativa
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <AnswersReview attempt={attempt} questions={questions} />
                <AnswersFooter onClose={onClose} />
            </DialogContent>
        </Dialog>
    )
}
