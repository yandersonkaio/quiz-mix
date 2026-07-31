import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { useAllQuizzes } from "../hooks/useAllQuizzes";
import { useAllCollections } from "../hooks/useAllCollections";
import { QuizCard } from "../components/quiz/QuizCard";
import { CollectionCard } from "../components/collection/CollectionCard";
import { EmptyState } from "../components/quiz/EmptyState";
import { FiSearch } from "react-icons/fi";
import { Quiz } from "../types/quiz";
import { QuizCollection } from "../types/quiz";

function Explore() {
    const {
        allQuizzes,
        loading: quizzesLoading,
        error: quizzesError
    } = useAllQuizzes();

    const {
        collections,
        loading: collectionsLoading,
        error: collectionsError
    } = useAllCollections();

    const [activeTab, setActiveTab] = useState<"quizzes" | "collections">("quizzes");
    const [searchTerm, setSearchTerm] = useState("");

    const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
    const [filteredCollections, setFilteredCollections] = useState<QuizCollection[]>([]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();

        setFilteredQuizzes(
            allQuizzes.filter(
                (quiz) =>
                    quiz.name.toLowerCase().includes(term) ||
                    quiz.description?.toLowerCase().includes(term) ||
                    quiz.creator?.name.toLowerCase().includes(term)
            )
        );

        setFilteredCollections(
            collections.filter(
                (collection) =>
                    collection.name.toLowerCase().includes(term) ||
                    collection.description?.toLowerCase().includes(term)
            )
        );
    }, [searchTerm, allQuizzes, collections]);

    const loading = quizzesLoading || collectionsLoading;
    const error = quizzesError || collectionsError;

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white flex items-center justify-center">
                <p className="text-red-600 dark:text-red-500">
                    Erro ao carregar conteúdo: {error.message}
                </p>
            </div>
        );
    }

    const showQuizzes = activeTab === "quizzes";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        Explorar
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Encontre quizzes e coleções criadas pela comunidade.
                    </p>
                </div>

                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab("quizzes")}
                        className={`px-5 py-2 rounded-lg cursor-pointer ${showQuizzes
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-gray-800"
                            }`}
                    >
                        Quizzes
                    </button>

                    <button
                        onClick={() => setActiveTab("collections")}
                        className={`px-5 py-2 rounded-lg cursor-pointer ${!showQuizzes
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-gray-800"
                            }`}
                    >
                        Coleções
                    </button>
                </div>

                <div className="mb-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <FiSearch className="text-gray-400" />
                    </div>

                    <input
                        type="text"
                        placeholder={
                            showQuizzes
                                ? "Pesquisar quizzes..."
                                : "Pesquisar coleções..."
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700"
                    />
                </div>

                {showQuizzes ? (
                    filteredQuizzes.length === 0 ? (
                        <EmptyState
                            title="Nenhum quiz encontrado"
                            description="Não existem quizzes disponíveis."
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map((quiz) => (
                                <QuizCard
                                    key={quiz.id}
                                    quiz={quiz}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    filteredCollections.length === 0 ? (
                        <EmptyState
                            title="Nenhuma coleção encontrada"
                            description="Não existem coleções disponíveis."
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCollections.map((collection) => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                />
                            ))}
                        </div>
                    )
                )}

            </div>
        </div>
    );
}

export default Explore;