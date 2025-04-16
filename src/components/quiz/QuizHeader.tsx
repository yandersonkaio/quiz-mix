import { Quiz } from "../../types/quiz";
import { motion } from "framer-motion";

interface QuizHeaderProps {
    quiz: Quiz;
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLeft: number | null;
}

export const QuizHeader = ({
    quiz,
    currentQuestionIndex,
    totalQuestions,
    timeLeft,
}: QuizHeaderProps) => {
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const hasTimeLimit = quiz.settings.timeLimitPerQuestion !== undefined && timeLeft !== null;
    const timeProgress = hasTimeLimit && quiz.settings.timeLimitPerQuestion
        ? (timeLeft / quiz.settings.timeLimitPerQuestion) * 100
        : null;

    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    const progressBarVariants = {
        hidden: { width: 0 },
        visible: { width: `${progress}%`, transition: { duration: 0.8 } },
    };

    const timeBarVariants = {
        hidden: { width: "100%" },
        visible: {
            width: `${timeProgress}%`,
            transition: { duration: 1 },
        },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-xl transition-all duration-300 hover:shadow-xl hover:dark:shadow-2xl"
        >
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {quiz.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 italic">
                    {quiz.description || "Sem descrição"}
                </p>
            </div>

            <div className="mt-6 space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Progresso
                        </span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {currentQuestionIndex + 1}/{totalQuestions}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                            variants={progressBarVariants}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full"
                        />
                    </div>
                </div>

                {hasTimeLimit && timeProgress !== null && (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                Tempo restante
                            </span>
                            <span
                                className={`text-sm font-semibold ${timeLeft && timeLeft <= 5
                                    ? "text-red-500 dark:text-red-400 animate-pulse"
                                    : "text-green-600 dark:text-green-400"
                                    }`}
                            >
                                {timeLeft !== null ? `${timeLeft}s` : "—"}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <motion.div
                                variants={timeBarVariants}
                                className={`h-2.5 rounded-full ${timeLeft && timeLeft <= 5
                                    ? "bg-gradient-to-r from-red-500 to-red-600"
                                    : "bg-gradient-to-r from-green-500 to-green-600"
                                    }`}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};