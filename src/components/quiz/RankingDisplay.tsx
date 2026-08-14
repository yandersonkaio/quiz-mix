import { useState } from "react";
import { IoMdArrowDropdown, IoMdArrowDropup, IoMdEye, IoMdTrash } from "react-icons/io";
import { FaTrashAlt } from "react-icons/fa";
import { FiTarget, FiBookOpen } from "react-icons/fi";
import AnswersModal from "./AnswersModal";
import { Attempt, Question, RankingEntry } from "../../types/quiz";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";
import { toast } from "sonner";

interface RankingDisplayProps {
    ranking: Attempt[];
    studyRanking?: RankingEntry[];
    allUserAttempts: { [userId: string]: Attempt[] };
    questions: Question[];
    operationLoading: boolean;
    onDeleteAllAttempts: () => Promise<void>;
    onDeleteAttempt: (attemptId: string) => Promise<void>;
    isCreator?: boolean;
    currentUserId?: string;
}

export const RankingDisplay = ({
    ranking,
    studyRanking = [],
    allUserAttempts,
    questions,
    operationLoading,
    onDeleteAllAttempts,
    onDeleteAttempt,
    isCreator = false,
    currentUserId,
}: RankingDisplayProps) => {
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [expandedStudyUser, setExpandedStudyUser] = useState<string | null>(null);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"all" | "single" | null>(null);
    const [attemptIdToDelete, setAttemptIdToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"challenge" | "study">("challenge");

    const toggleExpand = (userId: string) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const toggleExpandStudy = (userId: string) => {
        setExpandedStudyUser(expandedStudyUser === userId ? null : userId);
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

    const renderChallengeRanking = () => (
        <div className="space-y-4">
            {ranking.length > 0 ? (
                ranking.map((attempt, index) => {
                    const userAttempts = allUserAttempts[attempt.userId] || [attempt];
                    const hasMultipleAttempts = userAttempts.length > 1;
                    const uniqueKey = `${attempt.userId}-${attempt.completedAt.toMillis()}`;

                    return (
                        <div key={uniqueKey}>
                            <div
                                className={`flex items-center p-3 sm:p-4 rounded-lg transition-colors duration-200 overflow-hidden ${index === 0
                                    ? "bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white"
                                    : index === 1
                                        ? "bg-gray-200 dark:bg-gray-400 text-gray-900 dark:text-white"
                                        : index === 2
                                            ? "bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    }`}
                            >
                                <span className="mr-2 sm:mr-4 text-base sm:text-lg font-bold flex-shrink-0">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                                </span>
                                {attempt.photoURL && (
                                    <img
                                        src={attempt.photoURL}
                                        alt={attempt.displayName}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-4 flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0 mr-2">
                                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                        {attempt.displayName}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        Acertos: {attempt.correctAnswers}/{attempt.totalQuestions} ({attempt.percentage}%)
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    {(isCreator || currentUserId === attempt.userId) && (
                                        <button
                                            onClick={() => openAnswersModal(attempt)}
                                            className="text-gray-600 cursor-pointer dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200 p-1"
                                            aria-label={`Ver respostas de ${attempt.displayName}`}
                                            title="Visualizar respostas"
                                        >
                                            <IoMdEye className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                        </button>
                                    )}

                                    {isCreator && (
                                        <button
                                            onClick={() => handleDeleteAttempt(attempt.id)}
                                            className="text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors duration-200 p-1"
                                            aria-label={`Excluir tentativa de ${attempt.displayName}`}
                                            title="Excluir tentativa"
                                        >
                                            <IoMdTrash className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                        </button>
                                    )}
                                    {hasMultipleAttempts && (
                                        <button
                                            onClick={() => toggleExpand(attempt.userId)}
                                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200 p-1"
                                            aria-label={
                                                expandedUser === attempt.userId
                                                    ? "Ocultar tentativas"
                                                    : "Mostrar tentativas"
                                            }
                                        >
                                            {expandedUser === attempt.userId ? (
                                                <IoMdArrowDropup className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer" />
                                            ) : (
                                                <IoMdArrowDropdown className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {hasMultipleAttempts && expandedUser === attempt.userId && (
                                <div className="mt-2 pl-4 sm:pl-12 space-y-2">
                                    {[...userAttempts]
                                        .sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis())
                                        .map((extraAttempt, idx) => (
                                            <div
                                                key={`${extraAttempt.userId}-${extraAttempt.completedAt.toMillis()}`}
                                                className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-600 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-none transition-colors duration-200"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Tentativa {idx + 1}
                                                        </p>
                                                        <p>
                                                            {extraAttempt.correctAnswers}/{extraAttempt.totalQuestions} ({extraAttempt.percentage}%)
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                            Concluída em: {extraAttempt.completedAt.toDate().toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {(isCreator || currentUserId === extraAttempt.userId) && (
                                                        <div className="flex gap-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => openAnswersModal(extraAttempt)}
                                                                className="p-1.5 rounded-md cursor-pointer bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 border border-gray-200 dark:border-gray-500"
                                                                aria-label={`Ver respostas da tentativa ${idx + 1}`}
                                                                title="Visualizar respostas"
                                                            >
                                                                <IoMdEye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            </button>
                                                            {isCreator && (
                                                                <button
                                                                    onClick={() => handleDeleteAttempt(extraAttempt.id)}
                                                                    className="p-1.5 rounded-md cursor-pointer bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 border border-gray-200 dark:border-gray-500"
                                                                    aria-label={`Excluir tentativa ${idx + 1}`}
                                                                    title="Excluir tentativa"
                                                                >
                                                                    <IoMdTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-600 dark:text-gray-400">Nenhum jogador no ranking de desafio ainda.</p>
            )}
        </div>
    );

    const renderStudyRanking = () => (
        <div className="space-y-4">
            {studyRanking.length > 0 ? (
                studyRanking.map((entry, index) => {
                    const userAttempts = allUserAttempts[entry.userId] || [];
                    const hasMultipleAttempts = userAttempts.length > 1;

                    return (
                        <div key={`${entry.userId}-${entry.completedAt?.toMillis?.() || Date.now()}`}>
                            <div
                                className={`flex items-center p-3 sm:p-4 rounded-lg transition-colors duration-200 overflow-hidden ${index === 0
                                    ? "bg-yellow-200 dark:bg-yellow-600 text-gray-900 dark:text-white"
                                    : index === 1
                                        ? "bg-gray-200 dark:bg-gray-400 text-gray-900 dark:text-white"
                                        : index === 2
                                            ? "bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                    }`}
                            >
                                <span className="mr-2 sm:mr-4 text-base sm:text-lg font-bold flex-shrink-0">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}º`}
                                </span>
                                {entry.photoURL && (
                                    <img
                                        src={entry.photoURL}
                                        alt={entry.userName}
                                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-4 flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0 mr-2">
                                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                        {entry.userName}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                        Total de respostas: {entry.totalAttempts} | Eficiência: {entry.score}%
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                    {(isCreator || currentUserId === entry.userId) && userAttempts.length > 0 && (
                                        <button
                                            onClick={() => openAnswersModal(userAttempts[0])}
                                            className="text-gray-600 cursor-pointer dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200 p-1"
                                            aria-label={`Ver respostas de ${entry.userName}`}
                                            title="Visualizar respostas"
                                        >
                                            <IoMdEye className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                        </button>
                                    )}

                                    {isCreator && userAttempts.length > 0 && (
                                        <button
                                            onClick={() => handleDeleteAttempt(userAttempts[0].id)}
                                            className="text-gray-600 cursor-pointer dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 focus:outline-none transition-colors duration-200 p-1"
                                            aria-label={`Excluir tentativa de ${entry.userName}`}
                                            title="Excluir tentativa"
                                        >
                                            <IoMdTrash className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                        </button>
                                    )}

                                    {hasMultipleAttempts && (
                                        <button
                                            onClick={() => toggleExpandStudy(entry.userId)}
                                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none transition-colors duration-200 p-1"
                                            aria-label={
                                                expandedStudyUser === entry.userId
                                                    ? "Ocultar tentativas"
                                                    : "Mostrar tentativas"
                                            }
                                        >
                                            {expandedStudyUser === entry.userId ? (
                                                <IoMdArrowDropup className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer" />
                                            ) : (
                                                <IoMdArrowDropdown className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {hasMultipleAttempts && expandedStudyUser === entry.userId && (
                                <div className="mt-2 pl-4 sm:pl-12 space-y-2">
                                    {[...userAttempts]
                                        .filter(a => a.mode === 'study')
                                        .sort((a, b) => a.completedAt.toMillis() - b.completedAt.toMillis())
                                        .map((extraAttempt, idx) => (
                                            <div
                                                key={`${extraAttempt.userId}-${extraAttempt.completedAt.toMillis()}`}
                                                className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-600 rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-none transition-colors duration-200"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            Tentativa {idx + 1}
                                                        </p>
                                                        <p>
                                                            Respostas nesta rodada: {extraAttempt.totalAttempts || extraAttempt.totalQuestions}
                                                        </p>
                                                        <p>
                                                            Eficiência: {extraAttempt.totalQuestions && extraAttempt.totalAttempts
                                                                ? ((extraAttempt.totalQuestions / extraAttempt.totalAttempts) * 100).toFixed(1)
                                                                : "0.0"}%
                                                        </p>
                                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                            Concluída em: {extraAttempt.completedAt.toDate().toLocaleString()}
                                                        </p>
                                                    </div>
                                                    {(isCreator || currentUserId === extraAttempt.userId) && (
                                                        <div className="flex gap-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => openAnswersModal(extraAttempt)}
                                                                className="p-1.5 cursor-pointer rounded-md bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 border border-gray-200 dark:border-gray-500"
                                                                aria-label={`Ver respostas da rodada ${idx + 1}`}
                                                                title="Visualizar respostas"
                                                            >
                                                                <IoMdEye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            </button>
                                                            {isCreator && (
                                                                <button
                                                                    onClick={() => handleDeleteAttempt(extraAttempt.id)}
                                                                    className="p-1.5 rounded-md bg-white cursor-pointer dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600 focus:outline-none transition-colors duration-200 border border-gray-200 dark:border-gray-500"
                                                                    aria-label={`Excluir rodada ${idx + 1}`}
                                                                    title="Excluir tentativa"
                                                                >
                                                                    <IoMdTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-600 dark:text-gray-400">Nenhum jogador no ranking de estudo ainda.</p>
            )}
        </div>
    );

    const hasAnyRanking = ranking.length > 0 || studyRanking.length > 0;

    return (
        <div className="mt-8 bg-transparent dark:bg-transparent p-4 sm:p-6 rounded-lg transition-colors duration-200">
            <div className="flex flex-row justify-between items-center mb-4 gap-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ranking</h3>
                {hasAnyRanking && isCreator && (
                    <button
                        onClick={handleDeleteAllAttempts}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 cursor-pointer bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                        title="Excluir todas as tentativas"
                    >
                        <FaTrashAlt className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">Limpar Ranking</span>
                        <span className="sm:hidden">Limpar</span>
                    </button>
                )}
            </div>
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab("challenge")}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors duration-200 ${activeTab === "challenge"
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    <FiTarget className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Desafio</span>
                    {ranking.length > 0 && (
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-1.5 sm:px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                            {ranking.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("study")}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md transition-colors duration-200 ${activeTab === "study"
                        ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                >
                    <FiBookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base whitespace-nowrap">Estudo</span>
                    {studyRanking.length > 0 && (
                        <span className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-1.5 sm:px-2 py-0.5 rounded-full text-xs flex-shrink-0">
                            {studyRanking.length}
                        </span>
                    )}
                </button>
            </div>

            {activeTab === "challenge" ? renderChallengeRanking() : renderStudyRanking()}

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