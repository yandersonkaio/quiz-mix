import { Clock3, ListChecks } from 'lucide-react'
import { motion, type Variants } from 'motion/react'

import type { Quiz } from '../../types/quiz'

interface QuizHeaderProps {
    quiz: Quiz
    currentQuestionIndex: number
    totalQuestions: number
    timeLeft: number | null
}

const containerVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -16,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
}

export const QuizHeader = ({
    quiz,
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
}: QuizHeaderProps) => {
    const currentQuestion = currentQuestionIndex + 1

    const progress =
        totalQuestions > 0
            ? Math.min(
                100,
                Math.max(0, (currentQuestion / totalQuestions) * 100)
            )
            : 0

    const timeLimit = quiz.settings.timeLimitPerQuestion

    const hasTimeLimit =
        timeLimit !== undefined &&
        timeLimit > 0 &&
        timeLeft !== null

    const timeProgress =
        hasTimeLimit && timeLimit
            ? Math.min(100, Math.max(0, (timeLeft / timeLimit) * 100))
            : null

    const isTimeRunningOut =
        hasTimeLimit && timeLeft !== null && timeLeft <= 5

    return (
        <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="border-border bg-card text-card-foreground mb-6 rounded-xl border p-5 sm:p-6"
        >
            <div className="min-w-0">
                <h1 className="text-foreground text-xl font-semibold tracking-tight wrap-break-word sm:text-2xl">
                    {quiz.name}
                </h1>

                <p className="text-muted-foreground mt-2 text-sm leading-relaxed wrap-break-word">
                    {quiz.description || 'Sem descrição'}
                </p>
            </div>

            <div className="border-border mt-6 space-y-5 border-t pt-5">
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-muted-foreground flex items-center gap-2">
                            <ListChecks
                                size={17}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />

                            <span className="text-sm font-medium">
                                Progresso
                            </span>
                        </div>

                        <span className="bg-muted text-foreground inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums">
                            {currentQuestion}/{totalQuestions}
                        </span>
                    </div>

                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <motion.div
                            role="progressbar"
                            aria-label="Progresso do quiz"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progress)}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{
                                duration: 0.6,
                                ease: 'easeOut',
                            }}
                            className="bg-primary h-full rounded-full"
                        />
                    </div>
                </div>

                {hasTimeLimit && timeProgress !== null && (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-3">
                            <div
                                className={`flex items-center gap-2 ${isTimeRunningOut
                                    ? 'text-destructive'
                                    : 'text-muted-foreground'
                                    }`}
                            >
                                <Clock3
                                    size={17}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                                <span className="text-sm font-medium">
                                    Tempo restante
                                </span>
                            </div>

                            <span
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums ${isTimeRunningOut
                                    ? 'bg-destructive/10 text-destructive animate-pulse'
                                    : 'bg-muted text-foreground'
                                    }`}
                            >
                                {timeLeft}s
                            </span>
                        </div>

                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                            <motion.div
                                role="progressbar"
                                aria-label="Tempo restante"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={Math.round(timeProgress)}
                                initial={{ width: '100%' }}
                                animate={{
                                    width: `${timeProgress}%`,
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: 'linear',
                                }}
                                className={`h-full rounded-full transition-colors duration-300 ${isTimeRunningOut
                                    ? 'bg-destructive'
                                    : 'bg-primary'
                                    }`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.section>
    )
}
