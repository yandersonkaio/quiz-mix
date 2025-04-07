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
            const filtered = allQuizzes.filter((quiz) =>
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
            <div className="min-h-screen bg-gray-900 p-6 text-white flex items-center justify-center">
                <p className="text-red-500">Erro ao carregar quizzes: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Explorar Quizzes</h1>

                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Pesquisar quizzes por nome ou descrição..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                </div>

                {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">
                            {searchTerm
                                ? "Nenhum quiz encontrado com esse termo."
                                : (allQuizzes && allQuizzes.length > 0)
                                    ? "Nenhum quiz corresponde à busca."
                                    : "Ainda não há quizzes para explorar."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                to={`/quiz/details/${quiz.id}`}
                                className="block bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-200"
                            >
                                <h2 className="text-xl font-semibold text-white mb-2 truncate">{quiz.name}</h2>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                    {quiz.description || "Sem descrição"}
                                </p>
                                <div className="space-y-1 text-gray-500 text-xs">
                                    {quiz.createdAt?.toDate && (
                                        <p>Criado em: {new Date(quiz.createdAt.toDate()).toLocaleDateString()}</p>
                                    )}
                                    {quiz.settings?.timeLimitPerQuestion && (
                                        <p>Tempo/pergunta: {quiz.settings.timeLimitPerQuestion}s</p>
                                    )}
                                    <p>
                                        Respostas: {quiz.settings?.showAnswersAfter === "immediately"
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