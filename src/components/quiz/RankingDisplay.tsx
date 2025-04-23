import { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdEye, IoMdTrash } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import AnswersModal from "./AnswersModal";
import { Attempt, Question } from "../../types/quiz";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { toast } from "sonner";

interface RankingDisplayProps {
    ranking: Attempt[];
    allUserAttempts: { [userId: string]: Attempt[] };
    questions: Question[];
    operationLoading: boolean;
    onDeleteAllAttempts: () => Promise<void>;
    onDeleteAttempt: (attemptId: string) => Promise<void>;
}

export const RankingDisplay = ({
    ranking,
    allUserAttempts,
    questions,
    operationLoading,
    onDeleteAllAttempts,
    onDeleteAttempt
}: RankingDisplayProps) => {
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"all" | "single" | null>(null);
    const [attemptIdToDelete, setAttemptIdToDelete] = useState<string | null>(null);

    const toggleExpand = (userId: string) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const openAnswersModal = (attempt: Attempt) => {
        setSelectedAttempt(attempt);
    };

    const closeAnswersModal = () => {
        setSelectedAttempt(null);
    };

    const handleDeleteAllAttempts = () => {
        setDeleteTarget("all");
        setIsDeleteModalOpen(true);
    };

    const handleDeleteAttempt = (attemptId: string) => {
        setDeleteTarget("single");
        setAttemptIdToDelete(attemptId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteTarget === "all") {
                await onDeleteAllAttempts();
            } else if (deleteTarget === "single" && attemptIdToDelete) {
                await onDeleteAttempt(attemptIdToDelete);
            }
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
            setAttemptIdToDelete(null);
        } catch (error) {
            console.error("Erro ao excluir:", error);
            toast.error("Erro ao realizar a exclusão.");
        }
    };

    return (
        <div className="mt-8 bg-transparent dark:bg-transparent p-6 rounded-lg transition-colors duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ranking</h3>
                {ranking.length > 0 && (
                    <button
                        onClick={handleDeleteAllAttempts}
                        className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg transition-colors duration-200"
                        title="Excluir todas as tentativas"
                    >
                        <FaTrashAlt className="w-4 h-4" />
                        <span>Limpar Ranking</span>
                    </button>
                )}
            </div>

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
                                        <button
                                            onClick={() => handleDeleteAttempt(attempt.id)}
                                            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
                                            aria-label={`Excluir tentativa de ${attempt.displayName}`}
                                        >
                                            <IoMdTrash className="w-5 h-5 cursor-pointer" />
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
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => openAnswersModal(extraAttempt)}
                                                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200"
                                                            aria-label={`Ver respostas da tentativa ${idx + 1}`}
                                                        >
                                                            <IoMdEye className="w-5 h-5 cursor-pointer" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAttempt(extraAttempt.id)}
                                                            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
                                                            aria-label={`Excluir tentativa ${idx + 1}`}
                                                        >
                                                            <IoMdTrash className="w-5 h-5 cursor-pointer" />
                                                        </button>
                                                    </div>
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

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteTarget === "all" ? "Excluir Todas as Tentativas" : "Excluir Tentativa"}
                message={
                    deleteTarget === "all"
                        ? "Tem certeza que deseja excluir TODAS as tentativas deste quiz? Esta ação não pode ser desfeita."
                        : "Tem certeza que deseja excluir esta tentativa? Esta ação não pode ser desfeita."
                }
                isLoading={operationLoading}
            />
        </div>
    );
};