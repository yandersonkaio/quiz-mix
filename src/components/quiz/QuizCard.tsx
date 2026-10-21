
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

import type { Quiz } from '@/types/quiz'
import { getDifficultyConfig } from '@/utils/quis'

interface QuizCardProps {
    quiz: Quiz
}

export function QuizCard({ quiz }: QuizCardProps) {
    const difficultyConfig = getDifficultyConfig(quiz.difficulty)

    const formattedDate = quiz.createdAt?.toDate
        ? new Date(quiz.createdAt.toDate()).toLocaleDateString('pt-BR')
        : 'Data desconhecida'

    const difficultyColors =
        quiz.difficulty === 'easy'
            ? 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground'
            : quiz.difficulty === 'medium'
                ? 'border-answer-selected-foreground/20 bg-answer-selected text-answer-selected-foreground'
                : quiz.difficulty === 'hard'
                    ? 'border-answer-incorrect-foreground/20 bg-answer-incorrect text-answer-incorrect-foreground'
                    : 'border-border bg-muted text-muted-foreground'

    return (
        <Link
            to={`/quiz/details/${quiz.id}`}
            className="group border-border bg-card text-card-foreground hover:border-ring/50 flex h-full min-w-0 flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
        >
            {/* Cabeçalho */}
            <div className="flex-1">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="min-w-0 flex-1 text-lg leading-snug font-semibold tracking-tight wrap-break-word sm:text-xl">
                        {quiz.name}
                    </h2>

                    <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${difficultyColors}`}
                    >
                        {difficultyConfig.icon}
                        {difficultyConfig.label}
                    </span>
                </div>

                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {quiz.description || 'Sem descrição'}
                </p>
            </div>

            {/* Informações */}
            <div className="border-border mt-6 border-t pt-4">
                <div className="mb-5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                            Perguntas
                        </p>

                        <p className="text-foreground text-sm font-semibold">
                            {quiz.questionCount || 0}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                            Tempo
                        </p>

                        <p className="text-foreground text-sm font-semibold">
                            {quiz.settings?.timeLimitPerQuestion
                                ? `${quiz.settings.timeLimitPerQuestion}s`
                                : 'Sem limite'}
                        </p>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs">
                    <span>
                        Criado em {formattedDate}
                    </span>

                    <div className="flex min-w-0 max-w-full items-center gap-2">
                        {quiz.creator?.photoUrl ? (
                            <img
                                src={quiz.creator.photoUrl}
                                alt=""
                                className="size-6 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {quiz.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}

                        <span className="max-w-32 truncate font-medium sm:max-w-40">
                            {quiz.creator?.name || 'Usuário'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Indicador visual de navegação */}
            <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="text-muted-foreground absolute hidden"
            />
        </Link>
    )
}
