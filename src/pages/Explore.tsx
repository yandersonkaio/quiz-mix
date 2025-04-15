import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { useAllQuizzes, Quiz } from "../hooks/useAllQuizzes";

function Explore() {
    const { allQuizzes, loading, error } = useAllQuizzes();
    const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        if (allQuizzes) {
            const filtered = allQuizzes.filter(
                (quiz) =>
                    quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 ml-12 md:ml-0 text-gray-900 dark:text-white">
                    Explorar Quizzes
                </h1>

                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Pesquisar quizzes por nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors duration-200"
                    />
                </div>

                {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {searchTerm
                                ? "Nenhum quiz encontrado com esse termo."
                                : allQuizzes && allQuizzes.length > 0
                                    ? "Nenhum quiz corresponde à busca."
                                    : "Ainda não há quizzes para explorar."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                to={`/quiz/details/${quiz.id}`}
                                className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-none transition-all duration-200"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate">
                                    {quiz.name}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                    {quiz.description || "Sem descrição"}
                                </p>
                                <div className="space-y-1 text-gray-500 dark:text-gray-500 text-xs">
                                    {quiz.createdAt?.toDate && (
                                        <p>
                                            Criado em:{" "}
                                            {new Date(quiz.createdAt.toDate()).toLocaleDateString()}
                                        </p>
                                    )}
                                    {quiz.settings?.timeLimitPerQuestion && (
                                        <p>Tempo/pergunta: {quiz.settings.timeLimitPerQuestion}s</p>
                                    )}
                                    <p>
                                        Respostas:{" "}
                                        {quiz.settings?.showAnswersAfter === "immediately"
                                            ? "Imediato"
                                            : quiz.settings?.showAnswersAfter === "untilCorrect"
                                                ? "Após acertar"
                                                : "No final"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Explore;