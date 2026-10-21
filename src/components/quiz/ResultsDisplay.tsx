import { useRef, useState } from 'react'
import domToImage from 'dom-to-image'
import {
    ArrowLeft,
    BookOpen,
    Check,
    CircleX,
    RotateCcw,
    Share2,
    Target,
    Trophy,
} from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../contexts/AuthContext'
import type { Question, Quiz, RankingEntry, UserAnswer } from '../../types/quiz'

interface ResultsDisplayProps {
    quiz: Quiz
    questions: Question[]
    userAnswers: UserAnswer[]
    onRestart: () => void
    onBack: () => void
    mode?: 'challenge' | 'study'
    ranking?: RankingEntry[]
}

export const ResultsDisplay = ({
    quiz,
    questions,
    userAnswers,
    onRestart,
    onBack,
    mode = 'challenge',
    ranking = [],
}: ResultsDisplayProps) => {
    const resultRef = useRef<HTMLDivElement>(null)
    const [isSharing, setIsSharing] = useState(false)
    const [testDateTime] = useState(() =>
        new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    )

    const { user } = useAuth()

    const isStudyMode =
        mode === 'study' || quiz.settings?.showAnswersAfter === 'untilCorrect'

    const correctCount = userAnswers.filter((answer) => answer.isCorrect).length
    const percentage =
        questions.length > 0
            ? ((correctCount / questions.length) * 100).toFixed(2)
            : '0.00'

    const totalAttempts = userAnswers.reduce(
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

    const getAnswerText = (question: Question, answer: number | string) => {
        if (answer === -1) return 'Tempo esgotado'

        if (question.type === 'multiple-choice' && question.options) {
            return question.options[Number(answer)] ?? 'Resposta não disponível'
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
            return question.options[question.correctAnswer] ?? 'Resposta não disponível'
        }

        if (question.type === 'true-false') {
            return question.correctAnswer === 1 ? 'Verdadeiro' : 'Falso'
        }

        return question.blankAnswer || ''
    }

    const handleShare = async () => {
        if (!resultRef.current || isSharing) return

        setIsSharing(true)

        try {
            // Usa o fundo do tema ativo, sem cores fixas para light/dark.
            const backgroundColor = getComputedStyle(resultRef.current).backgroundColor
            const image = await domToImage.toPng(resultRef.current, {
                bgcolor: backgroundColor,
                quality: 1,
                style: { backgroundColor },
            })

            const response = await fetch(image)
            const blob = await response.blob()
            const file = new File([blob], 'resultado-quiz.png', {
                type: 'image/png',
            })

            const shareText = isStudyMode
                ? `Completei o quiz "${quiz.name}" em ${totalAttempts} tentativas (eficiência: ${efficiency}%)! Realizado em: ${testDateTime}`
                : `Acertei ${correctCount} de ${questions.length} perguntas (${percentage}%) no quiz "${quiz.name}"! Realizado em: ${testDateTime}`

            if (navigator.share && navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `Meu resultado no quiz "${quiz.name}"`,
                    text: shareText,
                })
            } else {
                const link = document.createElement('a')
                link.href = image
                link.download = 'resultado-quiz.png'
                link.click()
                toast.info('A imagem foi baixada para você compartilhar.')
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') return
            console.error('Erro ao gerar ou compartilhar a imagem:', error)
            toast.error('Houve um erro ao gerar a imagem para compartilhamento.')
        } finally {
            setIsSharing(false)
        }
    }

    const sortedRanking = [...ranking].sort((a, b) =>
        isStudyMode
            ? a.totalAttempts - b.totalAttempts
            : b.score - a.score
    )

    return (
        <div className="border-border bg-card text-card-foreground w-full rounded-2xl border p-4 sm:p-6">
            {/* Resumo também utilizado para gerar a imagem compartilhada */}
            <div
                ref={resultRef}
                className="border-border bg-card rounded-xl border p-4 text-center sm:p-6"
            >
                <div className="mb-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <span className="bg-muted text-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
                        {isStudyMode ? (
                            <BookOpen size={22} strokeWidth={1.8} aria-hidden="true" />
                        ) : (
                            <Target size={22} strokeWidth={1.8} aria-hidden="true" />
                        )}
                    </span>

                    <h2 className="text-foreground min-w-0 text-xl font-bold tracking-tight wrap-break-word sm:text-2xl">
                        {isStudyMode ? 'Resultado do Estudo' : 'Resultado do Quiz'}: {quiz.name}
                    </h2>
                </div>

                {isStudyMode ? (
                    <>
                        <p className="text-foreground mb-5 text-sm font-medium sm:text-base">
                            {user?.displayName || 'Parabéns'}, você completou o quiz!
                        </p>

                        <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="border-border bg-muted/50 min-w-0 rounded-xl border p-3 sm:p-4">
                                <p className="text-muted-foreground text-[11px] sm:text-xs">
                                    Respostas dadas
                                </p>
                                <p className="text-foreground mt-2 text-xl font-bold tabular-nums sm:text-2xl">
                                    {totalAttempts}
                                </p>
                            </div>

                            <div className="border-border bg-muted/50 min-w-0 rounded-xl border p-3 sm:p-4">
                                <p className="text-muted-foreground text-[11px] sm:text-xs">
                                    Eficiência
                                </p>
                                <p className="text-foreground mt-2 text-xl font-bold tabular-nums sm:text-2xl">
                                    {efficiency}%
                                </p>
                            </div>

                            <div className="border-border bg-muted/50 min-w-0 rounded-xl border p-3 sm:p-4">
                                <p className="text-muted-foreground text-[11px] sm:text-xs">
                                    Média/Questão
                                </p>
                                <p className="text-foreground mt-2 text-xl font-bold tabular-nums sm:text-2xl">
                                    {avgAttemptsPerQuestion}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="border-border bg-muted/50 mb-5 rounded-xl border p-4 sm:p-5">
                        <p className="text-muted-foreground text-sm">Seu aproveitamento</p>
                        <p className="text-foreground mt-1 text-3xl font-bold tabular-nums sm:text-4xl">
                            {percentage}%
                        </p>
                        <p className="text-muted-foreground mt-2 text-sm">
                            {user?.displayName ? `${user.displayName}, você acertou` : 'Você acertou'}{' '}
                            <span className="text-foreground font-semibold">{correctCount}</span> de{' '}
                            <span className="text-foreground font-semibold">{questions.length}</span>{' '}
                            perguntas.
                        </p>
                    </div>
                )}

                <p className="text-muted-foreground text-xs sm:text-sm">
                    Teste realizado em: {testDateTime}
                </p>
            </div>

            {/* Ranking (se fornecido) */}
            {sortedRanking.length > 0 && (
                <section className="border-border bg-muted/20 mt-6 rounded-xl border p-4 sm:p-5">
                    <h3 className="text-foreground mb-4 flex items-center justify-center gap-2 text-lg font-semibold">
                        <Trophy size={19} aria-hidden="true" />
                        {isStudyMode ? 'Ranking de Eficiência' : 'Ranking'}
                    </h3>

                    <div className="border-border overflow-x-auto rounded-lg border">
                        <table className="w-full min-w-100 text-sm">
                            <thead className="bg-muted/70 text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium">Posição</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium">Participante</th>
                                    <th className="px-3 py-3 text-center text-xs font-medium">
                                        {isStudyMode ? 'Tentativas' : 'Pontuação'}
                                    </th>
                                    <th className="px-3 py-3 text-center text-xs font-medium">
                                        {isStudyMode ? 'Eficiência' : 'Acertos'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-border divide-y">
                                {sortedRanking.map((entry, index) => (
                                    <tr
                                        key={entry.userId}
                                        className={
                                            entry.userId === user?.uid
                                                ? 'bg-accent/60'
                                                : 'bg-card'
                                        }
                                    >
                                        <td className="text-foreground px-3 py-3 font-medium">
                                            {index === 0
                                                ? '🥇'
                                                : index === 1
                                                    ? '🥈'
                                                    : index === 2
                                                        ? '🥉'
                                                        : `${index + 1}º`}
                                        </td>
                                        <td className="text-foreground px-3 py-3 wrap-break-word">
                                            {entry.userName || entry.displayName}
                                            {entry.userId === user?.uid && (
                                                <span className="text-muted-foreground"> (Você)</span>
                                            )}
                                        </td>
                                        <td className="text-foreground px-3 py-3 text-center font-semibold tabular-nums">
                                            {isStudyMode ? entry.totalAttempts : `${entry.score}%`}
                                        </td>
                                        <td className="text-foreground px-3 py-3 text-center font-medium tabular-nums">
                                            {isStudyMode
                                                ? `${questions.length > 0 && entry.totalAttempts > 0
                                                    ? ((questions.length / entry.totalAttempts) * 100).toFixed(1)
                                                    : '0.0'}%`
                                                : `${entry.correctAnswers}/${questions.length}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Revisão das respostas */}
            <section className="mt-7">
                <h3 className="text-foreground mb-4 text-center text-lg font-semibold tracking-tight sm:text-xl">
                    Revisão das Respostas
                </h3>

                <div className="space-y-3">
                    {questions.map((question, index) => {
                        const userAnswer = userAnswers.find(
                            (answer) => answer.questionId === question.id
                        )

                        return (
                            <div
                                key={question.id}
                                className="border-border bg-muted/40 rounded-xl border p-4 text-left"
                            >
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <span className="text-muted-foreground text-xs font-medium">
                                        Questão {index + 1}
                                    </span>

                                    <span
                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${userAnswer?.isCorrect
                                            ? 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground'
                                            : userAnswer
                                                ? 'border-answer-incorrect-foreground/20 bg-answer-incorrect text-answer-incorrect-foreground'
                                                : 'border-border bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {userAnswer?.isCorrect ? (
                                            <Check size={13} aria-hidden="true" />
                                        ) : userAnswer ? (
                                            <CircleX size={13} aria-hidden="true" />
                                        ) : null}
                                        {userAnswer?.isCorrect
                                            ? 'Correto'
                                            : userAnswer
                                                ? 'Errado'
                                                : 'Não respondida'}
                                    </span>
                                </div>

                                <p className="text-foreground mb-3 text-sm font-medium leading-relaxed whitespace-pre-line wrap-break-word sm:text-base">
                                    {question.question}
                                </p>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1 text-xs">Sua resposta</p>
                                        <p className="text-foreground whitespace-pre-line wrap-break-word">
                                            {userAnswer
                                                ? getAnswerText(question, userAnswer.selectedAnswer)
                                                : 'Não respondida'}
                                        </p>
                                    </div>

                                    {!userAnswer?.isCorrect && (
                                        <div className="border-border border-t pt-3">
                                            <p className="text-muted-foreground mb-1 text-xs">
                                                Resposta correta
                                            </p>
                                            <p className="text-foreground font-medium whitespace-pre-line wrap-break-word">
                                                {getCorrectAnswerText(question)}
                                            </p>
                                        </div>
                                    )}

                                    {isStudyMode && userAnswer && (
                                        <div className="border-border border-t pt-3">
                                            <p className="text-muted-foreground text-xs">
                                                Tentativas nesta questão:{' '}
                                                <span className="text-foreground font-semibold">
                                                    {userAnswer.attempts || 1}
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

            {/* Ações */}
            <div className="mt-6 flex flex-col flex-wrap justify-center gap-2 sm:flex-row">
                <button
                    type="button"
                    onClick={handleShare}
                    disabled={isSharing}
                    aria-label="Compartilhar resultado como imagem"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    <Share2 size={17} aria-hidden="true" />
                    {isSharing ? 'Gerando...' : 'Compartilhar Resultado'}
                </button>

                <button
                    type="button"
                    onClick={onRestart}
                    className="border-border bg-muted text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
                >
                    <RotateCcw size={17} aria-hidden="true" />
                    {isStudyMode ? 'Estudar Novamente' : 'Responder Novamente'}
                </button>

                <button
                    type="button"
                    onClick={onBack}
                    className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border px-5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
                >
                    <ArrowLeft size={17} aria-hidden="true" />
                    Voltar
                </button>
            </div>
        </div>
    )
}
