import { Attempt, Question } from "../../hooks/useQuizData";
import { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdEye } from "react-icons/io";
import AnswersModal from "./AnswersModal";

interface RankingDisplayProps {
    ranking: Attempt[];
    allUserAttempts: { [userId: string]: Attempt[] };
    questions: Question[]; // Necessário para o AnswersModal
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
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Ranking</h3>
            {ranking.length > 0 ? (
                <div className="space-y-4">
                    {ranking.map((attempt, index) => {
                        const userAttempts = allUserAttempts[attempt.userId] || [attempt];
                        const hasMultipleAttempts = userAttempts.length > 1;
                        const uniqueKey = `${attempt.userId}-${attempt.completedAt.toMillis()}`;

                        return (
                            <div key={uniqueKey}>
                                <div
                                    className={`flex items-center p-4 rounded-lg ${index === 0
                                            ? "bg-yellow-600"
                                            : index === 1
                                                ? "bg-gray-400"
                                                : index === 2
                                                    ? "bg-yellow-800"
                                                    : "bg-gray-700"
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
                                        <p className="font-medium">{attempt.displayName}</p>
                                        <p className="text-sm text-gray-300">
                                            Acertos: {attempt.correctAnswers} / {attempt.totalQuestions} (
                                            {attempt.percentage}%)
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => openAnswersModal(attempt)}
                                            className="text-gray-300 hover:text-white focus:outline-none"
                                        >
                                            <IoMdEye className="w-6 h-6 cursor-pointer" />
                                        </button>
                                        {hasMultipleAttempts && (
                                            <button
                                                onClick={() => toggleExpand(attempt.userId)}
                                                className="text-gray-300 hover:text-white focus:outline-none"
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
                                                    className="p-2 bg-gray-600 rounded-lg text-sm text-gray-300 flex items-center justify-between"
                                                >
                                                    <span>
                                                        Tentativa {idx + 1}: {extraAttempt.correctAnswers} /{" "}
                                                        {extraAttempt.totalQuestions} ({extraAttempt.percentage}%) (
                                                        Concluída em:{" "}
                                                        {extraAttempt.completedAt.toDate().toLocaleString()})
                                                    </span>
                                                    <button
                                                        onClick={() => openAnswersModal(extraAttempt)}
                                                        className="text-gray-300 hover:text-white focus:outline-none"
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
                <p className="text-gray-400">Nenhum jogador no ranking ainda.</p>
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