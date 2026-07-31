import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaEdit,
    FaTrash,
    FaInfoCircle,
    FaListUl,
    FaQuestionCircle,
    FaClock,
    FaUser
} from "react-icons/fa";
import { GrConfigure } from "react-icons/gr";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";

import Loading from "../components/Loading";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { CollectionSettingsModal } from "@/components/collection/CollectionSettingsModal";
import AddQuizToCollectionModal from "@/components/collection/AddQuizToCollectionModal";
import ManageSectionsModal from "@/components/collection/ManageSectionsModal";

import { useCollection } from "@/hooks/useCollection";
import { useCollectionData } from "../hooks/useCollectionData";
import { useCollectionQuizzes } from "@/hooks/useCollectionQuizzes";
import { useCollectionSections } from "@/hooks/useCollectionSections";
import { useCollectionFavorite } from "@/hooks/useCollectionFavorite";

import { toast } from "sonner";
import { QuizCollection } from "@/types/quiz";

function CollectionDetails() {
    const { collectionId } = useParams<{ collectionId: string }>();
    const navigate = useNavigate();

    const {
        collection,
        loading,
        user
    } = useCollection(collectionId);

    const {
        sections,
        loading: sectionsLoading
    } = useCollectionSections(collectionId);

    const {
        quizzes,
        loading: quizzesLoading
    } = useCollectionQuizzes(collectionId);

    const {
        deleteCollection,
        operationLoading
    } = useCollectionData();

    const { updateCollection } = useCollectionData();

    const {
        isFavorite,
        loading: favoriteLoading,
        toggleFavorite,
        operationLoading: favoriteOperationLoading
    } = useCollectionFavorite(collectionId);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false);
    const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);

    const handleSaveCollection = async (
        updatedCollection: Partial<QuizCollection>
    ) => {
        if (!collection) return;

        try {
            await updateCollection(
                collection.id,
                updatedCollection
            );

            toast.success("Coleção atualizada com sucesso.");

            setIsSettingsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar coleção.");

        }
    };

    const handleDeleteCollection = async () => {
        if (!collection) return;

        try {
            await deleteCollection(collection.id);

            toast.success("Coleção excluída com sucesso.");

            navigate("/my-collections");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir coleção.");
        }
    };

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite();
            toast.success(
                isFavorite
                    ? "Coleção removida dos favoritos."
                    : "Coleção adicionada aos favoritos!"
            );
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar favorito.");
        }
    };

    const getQuizzesBySection = (sectionId: string | null) => {
        return quizzes.filter(quiz => quiz.sectionId === sectionId);
    };

    const quizzesSemSecao = getQuizzesBySection(null);

    const formatTimeLimit = (seconds?: number) => {
        if (!seconds) return null;
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}min ${remainingSeconds}s` : `${minutes}min`;
    };

    const translateShowAnswers = (setting: string) => {
        const translations: Record<string, string> = {
            'immediately': 'Imediatamente',
            'end': 'Ao final',
            'untilCorrect': 'Até acertar'
        };
        return translations[setting] || setting;
    };

    if (loading) {
        return <Loading />;
    }

    if (!collection) {
        return (
            <div className="p-6 text-gray-900 dark:text-white">
                Coleção não encontrada.
            </div>
        );
    }

    const isCreator = collection.userId === user?.uid;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-4">
                            <h1 className="text-3xl md:text-4xl font-bold break-words">
                                {collection.name}
                            </h1>

                            <button
                                onClick={handleToggleFavorite}
                                disabled={favoriteLoading || favoriteOperationLoading}
                                className={`
                                    p-3 rounded-full 
                                    transition-all duration-200 
                                    hover:scale-110 active:scale-95
                                    ${isFavorite
                                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                        : 'text-gray-400 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
                                    ${(favoriteLoading || favoriteOperationLoading) && 'opacity-50 cursor-not-allowed'}
                                `}
                                aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                            >
                                {favoriteLoading || favoriteOperationLoading ? (
                                    <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
                                ) : (
                                    isFavorite ? (
                                        <MdFavorite className="text-3xl cursor-pointer" />
                                    ) : (
                                        <MdFavoriteBorder className="text-3xl cursor-pointer" />
                                    )
                                )}
                            </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {collection.description || "Sem descrição"}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaInfoCircle className="text-blue-500 mr-3" />
                            <h2 className="text-xl font-semibold">
                                Informações
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Criada em:
                                </span>
                                <span>
                                    {collection.createdAt
                                        ? collection.createdAt
                                            .toDate()
                                            .toLocaleDateString("pt-BR")
                                        : "N/A"
                                    }
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Total de Quizzes:
                                </span>
                                <span className="font-semibold">
                                    {quizzes.length}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Seções:
                                </span>
                                <span className="font-semibold">
                                    {sections.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isCreator && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 md:col-span-2">
                            <div className="flex items-center mb-4">
                                <FaEdit className="text-purple-500 mr-3" />
                                <h2 className="text-xl font-semibold">
                                    Configurações da Coleção
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    className="flex items-center justify-between cursor-pointer px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    <span>Editar informações</span>
                                    <FaEdit />
                                </button>

                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="flex items-center cursor-pointer justify-between px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    <span>Excluir coleção</span>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <FaListUl className="text-indigo-500 mr-3" />
                            <h2 className="text-xl font-semibold">
                                Quizzes
                            </h2>
                        </div>

                        {isCreator && (
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsAddQuizModalOpen(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm flex-1 sm:flex-none"
                                >
                                    <GrConfigure className="text-xl" />
                                    Gerenciar Quizzes
                                </button>

                                <button
                                    onClick={() => setIsSectionsModalOpen(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shadow-sm flex-1 sm:flex-none"
                                >
                                    <FaListUl />
                                    Gerenciar Seções
                                </button>
                            </div>
                        )}

                        <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full whitespace-nowrap">
                            {sections.length} seções • {quizzes.length} quizzes
                        </span>
                    </div>

                    {sectionsLoading || quizzesLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                            <p className="text-gray-500 mt-4">
                                Carregando estrutura...
                            </p>
                        </div>
                    ) : sections.length === 0 && quizzes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Coleção vazia
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Comece adicionando seções e quizzes para organizar sua coleção.
                            </p>
                            {isCreator && (
                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setIsSectionsModalOpen(true)}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition-colors"
                                    >
                                        Criar Seção
                                    </button>
                                    <button
                                        onClick={() => setIsAddQuizModalOpen(true)}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors"
                                    >
                                        Adicionar Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sections.map((section) => {
                                const sectionQuizzes = getQuizzesBySection(section.id);
                                return (
                                    <div
                                        key={section.id}
                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">📁</span>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                    {section.name}
                                                </h3>
                                            </div>
                                            <span className="text-sm text-gray-500 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                                                {sectionQuizzes.length} {sectionQuizzes.length === 1 ? 'quiz' : 'quizzes'}
                                            </span>
                                        </div>

                                        {sectionQuizzes.length > 0 ? (
                                            <div className="ml-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                                                {sectionQuizzes.map((quiz) => (
                                                    <div
                                                        key={quiz.id}
                                                        onClick={() =>
                                                            navigate(`/quiz/details/${quiz.id}`)
                                                        }
                                                        className="
                                                            p-4
                                                            rounded-lg
                                                            bg-white dark:bg-gray-800
                                                            border border-gray-100 dark:border-gray-700
                                                            cursor-pointer
                                                            hover:shadow-md
                                                            hover:border-indigo-300 dark:hover:border-indigo-500
                                                            transition-all
                                                            group
                                                        "
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl group-hover:scale-110 transition-transform">
                                                                    📝
                                                                </span>
                                                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                                                    {quiz.name}
                                                                </h4>
                                                            </div>
                                                            <span className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                                                                Ver detalhes →
                                                            </span>
                                                        </div>

                                                        {quiz.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                                {quiz.description}
                                                            </p>
                                                        )}

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                            {quiz.questionCount !== undefined && (
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                                    <FaQuestionCircle className="text-blue-500 dark:text-blue-400" />
                                                                    <span>
                                                                        {quiz.questionCount} {quiz.questionCount === 1 ? 'questão' : 'questões'}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {quiz.settings?.timeLimitPerQuestion && (
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                                    <FaClock className="text-orange-500 dark:text-orange-400" />
                                                                    <span>
                                                                        {formatTimeLimit(quiz.settings.timeLimitPerQuestion)}/questão
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {quiz.settings?.showAnswersAfter && (
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                                    <FaInfoCircle className="text-green-500 dark:text-green-400" />
                                                                    <span>
                                                                        {translateShowAnswers(quiz.settings.showAnswersAfter)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {quiz.creator && (
                                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                                    <FaUser className="text-purple-500 dark:text-purple-400" />
                                                                    <span className="truncate">
                                                                        {quiz.creator.name || 'Criador'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-600 pl-4 py-2">
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                                                    Nenhum quiz nesta seção
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {quizzesSemSecao.length > 0 && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">📂</span>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                                Sem seção
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Quizzes não organizados em seções
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-500 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                                            {quizzesSemSecao.length} {quizzesSemSecao.length === 1 ? 'quiz' : 'quizzes'}
                                        </span>
                                    </div>

                                    <div className="ml-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
                                        {quizzesSemSecao.map((quiz) => (
                                            <div
                                                key={quiz.id}
                                                onClick={() =>
                                                    navigate(`/quiz/details/${quiz.id}`)
                                                }
                                                className="
                                                    p-4
                                                    rounded-lg
                                                    bg-white dark:bg-gray-800
                                                    border border-gray-100 dark:border-gray-700
                                                    cursor-pointer
                                                    hover:shadow-md
                                                    hover:border-indigo-300 dark:hover:border-indigo-500
                                                    transition-all
                                                    group
                                                "
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl group-hover:scale-110 transition-transform">
                                                            📝
                                                        </span>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                                            {quiz.name}
                                                        </h4>
                                                    </div>
                                                    <span className="text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                                                        Ver detalhes →
                                                    </span>
                                                </div>

                                                {quiz.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                        {quiz.description}
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    {quiz.questionCount !== undefined && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <FaQuestionCircle className="text-blue-500 dark:text-blue-400" />
                                                            <span>
                                                                {quiz.questionCount} {quiz.questionCount === 1 ? 'questão' : 'questões'}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {quiz.settings?.timeLimitPerQuestion && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <FaClock className="text-orange-500 dark:text-orange-400" />
                                                            <span>
                                                                {formatTimeLimit(quiz.settings.timeLimitPerQuestion)}/questão
                                                            </span>
                                                        </div>
                                                    )}

                                                    {quiz.settings?.showAnswersAfter && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <FaInfoCircle className="text-green-500 dark:text-green-400" />
                                                            <span>
                                                                {translateShowAnswers(quiz.settings.showAnswersAfter)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {quiz.creator && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                            <FaUser className="text-purple-500 dark:text-purple-400" />
                                                            <span className="truncate">
                                                                {quiz.creator.name || 'Criador'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isCreator && (
                <>
                    <CollectionSettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        collection={collection}
                        onSave={handleSaveCollection}
                    />

                    <ConfirmDeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteCollection}
                        title="Excluir Coleção"
                        message={`Tem certeza que deseja excluir "${collection.name}"?`}
                        isLoading={operationLoading}
                    />

                    <AddQuizToCollectionModal
                        isOpen={isAddQuizModalOpen}
                        onClose={() => setIsAddQuizModalOpen(false)}
                        collectionId={collection.id}
                    />

                    <ManageSectionsModal
                        isOpen={isSectionsModalOpen}
                        onClose={() => setIsSectionsModalOpen(false)}
                        collectionId={collection.id}
                    />
                </>
            )}
        </div>
    );
}

export default CollectionDetails;