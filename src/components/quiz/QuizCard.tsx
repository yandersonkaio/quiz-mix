import { Link } from "react-router-dom";
import { Quiz } from "../../types/quiz";

interface QuizCardProps {
    quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
    const formattedDate = quiz.createdAt?.toDate
        ? new Date(quiz.createdAt.toDate()).toLocaleDateString('pt-BR')
        : 'Data desconhecida';

    return (
        <Link
            to={`/quiz/details/${quiz.id}`}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full"
        >
            <div className="flex-grow">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {quiz.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {quiz.description || "Sem descrição"}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Perguntas</span>
                        <span className="block font-semibold text-blue-600 dark:text-blue-400">
                            {quiz.questionCount || 0}
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">Tempo</span>
                        <span className="block font-semibold">
                            {quiz.settings?.timeLimitPerQuestion
                                ? `${quiz.settings.timeLimitPerQuestion}s`
                                : 'Sem limite'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Criado em {formattedDate}</span>
                    <div className="flex items-center gap-1">
                        {quiz.creator?.photoUrl ? (
                            <img
                                src={quiz.creator.photoUrl}
                                alt={quiz.creator.name}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-xs text-gray-500 dark:text-gray-300">
                                    {quiz.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        <span className="font-medium">
                            {quiz.creator?.name || 'Usuário'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}