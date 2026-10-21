
import { Link } from 'react-router'

import type { Quiz } from '@/types/quiz'
import { getDifficultyConfig } from '@/utils/quis'

interface QuizListItemProps {
    quiz: Quiz
}

export function QuizListItem({ quiz }: QuizListItemProps) {
    const difficultyConfig = getDifficultyConfig(quiz.difficulty)

    const formattedDate = quiz.createdAt?.toDate
        ? quiz.createdAt.toDate().toLocaleDateString('pt-BR')
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
            className="group border-border bg-card text-card-foreground hover:border-ring/50 flex min-w-0 flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
        >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h2 className="text-base leading-snug font-semibold tracking-tight wrap-break-word sm:text-lg">
                        {quiz.name}
                    </h2>

                    {quiz.description && (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed sm:line-clamp-1">
                            {quiz.description}
                        </p>
                    )}
                </div>

                {/* Dificuldade */}
                <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${difficultyColors}`}
                >
                    {difficultyConfig.icon}
                    {difficultyConfig.label}
                </span>
            </div>

            {/* Informações */}
            <div className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-4 sm:gap-5">
                {/* Criador */}
                <div className="min-w-0 space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                        Criado por
                    </p>

                    <div className="flex min-w-0 items-center gap-2">
                        {quiz.creator?.photoUrl ? (
                            <img
                                src={quiz.creator.photoUrl}
                                alt=""
                                className="size-7 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {quiz.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}

                        <span className="min-w-0 truncate text-sm font-medium">
                            {quiz.creator?.name || 'Usuário'}
                        </span>
                    </div>
                </div>

                {/* Data */}
                <div className="min-w-0 space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                        Criado em
                    </p>

                    <p className="text-foreground text-sm font-medium">
                        {formattedDate}
                    </p>
                </div>

                {/* Perguntas */}
                <div className="min-w-0 space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                        Perguntas
                    </p>

                    <p className="text-foreground text-sm font-semibold">
                        {quiz.questionCount || 0}
                    </p>
                </div>

                {/* Tempo */}
                <div className="min-w-0 space-y-1.5">
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
        </Link>
    )
}
