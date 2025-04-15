import { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdEye } from "react-icons/io";
import AnswersModal from "./AnswersModal";
import { Attempt, Question } from "../../types/quiz";

interface RankingDisplayProps {
    ranking: Attempt[];
    allUserAttempts: { [userId: string]: Attempt[] };
    questions: Question[];
}

export const RankingDisplay = ({ ranking, allUserAttempts, questions }: RankingDisplayProps) => {
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

    const toggleExpand = (userId: string) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const openAnswersModal = (attempt: Attempt) => {
        setSelectedAttempt(attempt);
    };

    const closeAnswersModal = () => {
        setSelectedAttempt(null);
    };

    return (
        <div className="mt-8 bg-transparent dark:bg-transparent p-6 rounded-lg transition-colors duration-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ranking</h3>
            {ranking.length > 0 ? (
                <div className="space-y-4">
                    {ranking.map((attempt, index) => {
                        const userAttempts = allUserAttempts[attempt.userId] || [attempt];
                        const hasMultipleAttempts = userAttempts.length > 1;
                        const uniqueKey = `${attempt.userId}-${attempt.completedAt.toMillis()}`;

                        return (
                            <div key={uniqueKey}>
                                <div
                                    className={`flex items-center p-4 rounded-lg transition-colors duration-200 ${index === 0
                                        ? "bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white"
                                        : index === 1
                                            ? "bg-gray-200 dark:bg-gray-400 text-gray-900 dark:text-white"
                                            : index === 2
                                                ? "bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                        }`}
                                >
                                    <span className="mr-4 text-lg font-bold">{index + 1}º</span>
                                    {attempt.photoURL && (
                                        <img
                                            src={attempt.photoURL}
                                            alt={attempt.displayName}
                                            className="w-10 h-10 rounded-full mr-4"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {attempt.displayName}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Acertos: {attempt.correctAnswers} / {attempt.totalQuestions} (
                                            {attempt.percentage}%)
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => openAnswersModal(attempt)}
                                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200"
                                            aria-label={`Ver respostas de ${attempt.displayName}`}
                                        >
                                            <IoMdEye className="w-6 h-6 cursor-pointer" />
                                        </button>
                                        {hasMultipleAttempts && (
                                            <button
                                                onClick={() => toggleExpand(attempt.userId)}
                                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200"
                                                aria-label={
                                                    expandedUser === attempt.userId
                                                        ? "Ocultar tentativas"
                                                        : "Mostrar tentativas"
                                                }
                                            >
                                                {expandedUser === attempt.userId ? (
                                                    <IoMdArrowDropup className="w-10 h-10 cursor-pointer" />
                                                ) : (
                                                    <IoMdArrowDropdown className="w-10 h-10 cursor-pointer" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {hasMultipleAttempts && expandedUser === attempt.userId && (
                                    <div className="mt-2 pl-12 space-y-2">
                                        {[...userAttempts]
                                            .sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis())
                                            .map((extraAttempt, idx) => (
                                                <div
                                                    key={`${extraAttempt.userId}-${extraAttempt.completedAt.toMillis()}`}
                                                    className="p-2 bg-gray-50 dark:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between border border-gray-200 dark:border-none transition-colors duration-200"
                                                >
                                                    <span>
                                                        Tentativa {idx + 1}: {extraAttempt.correctAnswers} /{" "}
                                                        {extraAttempt.totalQuestions} ({extraAttempt.percentage}%) (
                                                        Concluída em:{" "}
                                                        {extraAttempt.completedAt.toDate().toLocaleString()})
                                                    </span>
                                                    <button
                                                        onClick={() => openAnswersModal(extraAttempt)}
                                                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200"
                                                        aria-label={`Ver respostas da tentativa ${idx + 1}`}
                                                    >
                                                        <IoMdEye className="w-6 h-6 cursor-pointer" />
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">Nenhum jogador no ranking ainda.</p>
            )}

            {selectedAttempt && (
                <AnswersModal
                    isOpen={!!selectedAttempt}
                    onClose={closeAnswersModal}
                    attempt={selectedAttempt}
                    questions={questions}
                />
            )}
        </div>
    );
};