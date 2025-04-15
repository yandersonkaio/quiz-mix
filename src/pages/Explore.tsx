import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import { useAllQuizzes } from "../hooks/useAllQuizzes";
import { QuizCard } from "../components/quiz/QuizCard";
import { EmptyState } from "../components/quiz/EmptyState";
import { FiSearch } from "react-icons/fi";
import { Quiz } from "../types/quiz";
import { QuizListItem } from "../components/quiz/QuizListItem";

function Explore() {
    const { allQuizzes, loading, error } = useAllQuizzes();
    const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    useEffect(() => {
        if (allQuizzes) {
            const filtered = allQuizzes.filter(
                (quiz) =>
                    quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quiz.creator?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredQuizzes(filtered);
        } else {
            setFilteredQuizzes([]);
        }
    }, [searchTerm, allQuizzes]);

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white flex items-center justify-center">
                <p className="text-red-600 dark:text-red-500">Erro ao carregar quizzes: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Explorar Quizzes
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'quiz encontrado' : 'quizzes encontrados'}
                        </p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            className="p-2 rounded-lg cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title={`Alternar para visualização ${viewMode === "grid" ? "lista" : "grade"}`}
                        >
                            {viewMode === "grid" ? (
                                <span className="flex items-center gap-1 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="mb-8 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Pesquisar quizzes por nome, descrição ou criador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                </div>

                {filteredQuizzes.length === 0 ? (
                    <EmptyState
                        title={searchTerm ? "Nenhum quiz encontrado" : "Nenhum quiz disponível"}
                        description={searchTerm
                            ? "Tente ajustar sua busca ou verifique a ortografia"
                            : "Ainda não há quizzes públicos para explorar"}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuizzes.map((quiz) => (
                            <QuizListItem key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Explore;