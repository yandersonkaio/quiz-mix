import { Link } from "react-router-dom";
import { Quiz } from "../../types/quiz";

interface QuizListItemProps {
    quiz: Quiz;
}

export function QuizListItem({ quiz }: QuizListItemProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <Link to={`/quiz/details/${quiz.id}`} className="block">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {quiz.name}
                        </h2>

                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                            {quiz.description || "Sem descrição"}
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Criado em {new Date(quiz.createdAt?.toDate()).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                {quiz.creator?.photoUrl ? (
                                    <img
                                        src={quiz.creator.photoUrl}
                                        alt={quiz.creator.name}
                                        className="w-4 h-4 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                        <span className="text-[0.6rem] text-gray-500 dark:text-gray-300">
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

                    <div className="flex gap-4 text-sm">
                        <div className="text-center min-w-[70px]">
                            <div className="text-gray-500 dark:text-gray-400">Perguntas</div>
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                                {quiz.questionCount || 0}
                            </div>
                        </div>
                        <div className="text-center min-w-[70px]">
                            <div className="text-gray-500 dark:text-gray-400">Tempo</div>
                            <div className="font-semibold">
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