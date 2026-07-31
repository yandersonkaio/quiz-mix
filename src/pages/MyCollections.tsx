import { useState } from "react";
import { Link } from "react-router-dom";
import { IoMdAdd } from "react-icons/io";
import { FiGrid, FiList } from "react-icons/fi";

import Loading from "../components/Loading";
import { EmptyState } from "../components/quiz/EmptyState";

import { CollectionCard } from "@/components/collection/CollectionCard";
import { CollectionListItem } from "@/components/collection/CollectionListItem";
import { CollectionModal } from "@/components/collection/CollectionModal";
import { useUserCollections } from "@/hooks/useUserCollections";

function MyCollections() {
    const { collections, loading, error, user } = useUserCollections();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white flex items-center justify-center">
                <p className="text-red-600 dark:text-red-500">
                    Erro ao carregar suas coleções: {error.message}
                </p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4">
                        Faça login para visualizar suas coleções.
                    </p>

                    <Link
                        to="/login"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Entrar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Minhas Coleções
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {collections.length}{" "}
                            {collections.length === 1
                                ? "coleção"
                                : "coleções"}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() =>
                                setViewMode(
                                    viewMode === "grid" ? "list" : "grid"
                                )
                            }
                            className="p-2 cursor-pointer rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            {viewMode === "grid" ? (
                                <FiList size={20} />
                            ) : (
                                <FiGrid size={20} />
                            )}
                        </button>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <IoMdAdd className="w-5 h-5" />
                            <span>Nova coleção</span>
                        </button>
                    </div>
                </div>

                {collections.length === 0 ? (
                    <EmptyState
                        title="Você ainda não criou nenhuma coleção"
                        description="Crie coleções para organizar seus quizzes por assunto, disciplina ou qualquer outro critério."
                        action={
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 inline-flex items-center gap-2 px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <IoMdAdd className="w-5 h-5" />
                                Criar primeira coleção
                            </button>
                        }
                    />
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection) => (
                            <CollectionCard
                                key={collection.id}
                                collection={collection}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {collections.map((collection) => (
                            <CollectionListItem
                                key={collection.id}
                                collection={collection}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CollectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isCreating={true}
            />
        </div>
    );
}

export default MyCollections;