import { useState, useEffect } from "react";
import { auth, db } from "../db/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { IoMdAdd } from "react-icons/io";

interface Quiz {
    id: string;
    name: string;
    userId: string;
    createdAt: any;
    description?: string;
    settings?: {
        timeLimitPerQuestion?: number;
        allowMultipleAttempts?: boolean;
        showAnswersAfter: "immediately" | "end";
    };
}

function MyQuizzes() {
    const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
                navigate("/login");
            }
        });

        if (user) {
            const quizzesQuery = query(collection(db, "quizzes"), where("userId", "==", user.uid));
            const unsubscribeQuizzes = onSnapshot(quizzesQuery, (snapshot) => {
                const quizzesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Quiz[];
                setUserQuizzes(quizzesData);
                setLoading(false);
            }, (error) => {
                console.error("Erro ao carregar quizzes:", error);
                setLoading(false);
            });

            return () => unsubscribeQuizzes();
        }

        return () => unsubscribeAuth();
    }, [navigate, user]);

    if (loading) return <Loading />;
    if (!user) return <div className="text-white">Faça login para visualizar os quizzes.</div>;

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
                                <div className="space-y-2 text-gray-500 text-xs">
                                    <p>Criado em: {new Date(quiz.createdAt.toDate()).toLocaleDateString()}</p>
                                    {quiz.settings?.timeLimitPerQuestion && (
                                        <p>Tempo por pergunta: {quiz.settings.timeLimitPerQuestion}s</p>
                                    )}
                                    <p>
                                        Respostas: {quiz.settings?.showAnswersAfter === "immediately" ? "Imediatas" : "No final"}
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