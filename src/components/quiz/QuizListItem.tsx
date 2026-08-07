import { Link } from "react-router-dom";
import { Quiz } from "@/types/quiz";
import { getDifficultyConfig } from "@/utils/quis";

interface QuizListItemProps {
    quiz: Quiz;
}

export function QuizListItem({ quiz }: QuizListItemProps) {
    const difficultyConfig = getDifficultyConfig(quiz.difficulty);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <Link to={`/quiz/details/${quiz.id}`} className="block">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 min-w-0">
                            {quiz.name}
                        </h2>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyConfig.colors} whitespace-nowrap flex-shrink-0`}>
                            {difficultyConfig.icon}
                            {difficultyConfig.label}
                        </span>
                    </div>

                    {quiz.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {quiz.description}
                        </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                                {quiz.creator?.photoUrl ? (
                                    <img
                                        src={quiz.creator.photoUrl}
                                        alt={quiz.creator.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-300">
                                            {quiz.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-gray-500 dark:text-gray-400">Criado por</div>
                                <div className="text-sm font-medium truncate">
                                    {quiz.creator?.name || 'Usuário'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Criado em</div>
                            <div className="text-sm font-medium">
                                {new Date(quiz.createdAt?.toDate()).toLocaleDateString('pt-BR')}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Perguntas</div>
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {quiz.questionCount || 0}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tempo</div>
                            <div className="text-sm font-semibold">
                                {quiz.settings?.timeLimitPerQuestion
                                    ? `${quiz.settings.timeLimitPerQuestion}s`
                                    : 'Sem limite'}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}