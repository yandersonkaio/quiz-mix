import { Link } from 'react-router-dom';
import { useUserQuizzes } from '../hooks/useUserQuizzes';
import Loading from '../components/Loading';
import { IoMdAdd } from 'react-icons/io';

function MyQuizzes() {
    const { userQuizzes, loading, error, user } = useUserQuizzes();

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-6 text-white flex items-center justify-center">
                <p className="text-red-500">Erro ao carregar seus quizzes: {error.message}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 p-6 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg mb-4">Faça login para visualizar seus quizzes.</p>
                    <Link to="/login" className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                        Entrar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Meus Quizzes</h1>
                    <Link
                        to="/create-quiz"
                        className="p-3 bg-blue-700 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                        title="Criar um quiz"
                    >
                        <IoMdAdd className="w-6 h-6" />
                    </Link>
                </div>

                {userQuizzes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">Você ainda não criou nenhum quiz.</p>
                        <Link
                            to="/create-quiz"
                            className="mt-4 inline-block px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Criar seu primeiro quiz
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userQuizzes.map((quiz) => (
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

export default MyQuizzes;