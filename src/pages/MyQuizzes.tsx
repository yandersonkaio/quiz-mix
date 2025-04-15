import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserQuizzes } from "../hooks/useUserQuizzes";
import Loading from "../components/Loading";
import { IoMdAdd } from "react-icons/io";
import { FiGrid, FiList } from "react-icons/fi";
import { QuizSettingsModal } from "../components/quiz/QuizSettingsModal";
import { QuizCard } from "../components/quiz/QuizCard";
import { EmptyState } from "../components/quiz/EmptyState";
import { QuizListItem } from "../components/quiz/QuizListItem";

function MyQuizzes() {
    const { userQuizzes, loading, error, user } = useUserQuizzes();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white flex items-center justify-center">
                <p className="text-red-600 dark:text-red-500">Erro ao carregar seus quizzes: {error.message}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4">Faça login para visualizar seus quizzes.</p>
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Meus Quizzes
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {userQuizzes.length} {userQuizzes.length === 1 ? 'quiz' : 'quizzes'} criados
                        </p>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                            className="p-2 cursor-pointer rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title={`Alternar para visualização ${viewMode === "grid" ? "lista" : "grade"}`}
                        >
                            {viewMode === "grid" ? <FiList size={20} /> : <FiGrid size={20} />}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                        >
                            <IoMdAdd className="w-5 h-5" />
                            <span>Criar quiz</span>
                        </button>
                    </div>
                </div>

                {userQuizzes.length === 0 ? (
                    <EmptyState
                        title="Você ainda não criou nenhum quiz"
                        description="Comece criando seu primeiro quiz para compartilhar com seus alunos ou amigos"
                        action={
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 inline-flex items-center gap-2 px-6 py-2 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                            >
                                <IoMdAdd className="w-5 h-5" />
                                Criar primeiro quiz
                            </button>
                        }
                    />
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userQuizzes.map((quiz) => (
                            <QuizCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userQuizzes.map((quiz) => (
                            <QuizListItem key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                )}
            </div>

            <QuizSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isCreating={true}
            />
        </div>
    );
}

export default MyQuizzes;