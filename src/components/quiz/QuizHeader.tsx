import { Quiz } from "../../hooks/useQuizData";

interface QuizHeaderProps {
    quiz: Quiz;
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLeft: number | null;
}

export const QuizHeader = ({ quiz, currentQuestionIndex, totalQuestions, timeLeft }: QuizHeaderProps) => {
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const timeProgress =
        quiz.settings.timeLimitPerQuestion && timeLeft !== null
            ? (timeLeft / quiz.settings.timeLimitPerQuestion) * 100
            : null;

    return (
        <div className="mb-6 bg-white dark:bg-transparent p-6 rounded-lg border border-gray-200 dark:border-none shadow-md dark:shadow-none transition-colors duration-200">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{quiz.description || "Sem descrição"}</p>
            <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Progresso: {currentQuestionIndex + 1} de {totalQuestions}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-colors duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            {quiz.settings.timeLimitPerQuestion && timeLeft !== null && (
                <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Tempo restante: {timeLeft !== null ? `${timeLeft}s` : "Carregando..."}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-colors duration-200 ${timeLeft <= 5 ? "bg-red-600 dark:bg-red-500" : "bg-green-600 dark:bg-green-500"
                                }`}
                            style={{ width: `${timeProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};