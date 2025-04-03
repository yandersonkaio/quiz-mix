import { useState, useEffect } from "react";
import { auth, db } from "../db/firebase";
import { doc, getDoc, collection, onSnapshot, deleteDoc, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash, FaPlay } from "react-icons/fa";
import { RankingDisplay } from "../components/quiz/RankingDisplay";

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

interface Question {
    id: string;
    question: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank";
}

interface Attempt {
    userId: string;
    quizId: string;
    completedAt: any;
    correctAnswers: number;
    displayName: string;
    photoURL?: string;
}

function QuizDetails() {
    const { quizId } = useParams<{ quizId: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [canPlay, setCanPlay] = useState<boolean | null>(null);
    const [ranking, setRanking] = useState<Attempt[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                navigate("/login");
            }
        });

        if (!quizId) return;

        const fetchQuizAndCheckAttempts = async () => {
            try {
                const quizDoc = await getDoc(doc(db, "quizzes", quizId));
                if (!quizDoc.exists()) {
                    console.log("Quiz não encontrado:", quizId);
                    alert("Quiz não encontrado.");
                    navigate("/my-quizzes");
                    return;
                }
                const quizData = quizDoc.data();
                setQuiz({
                    id: quizDoc.id,
                    name: quizData.name,
                    userId: quizData.userId,
                    createdAt: quizData.createdAt,
                    description: quizData.description,
                    settings: {
                        timeLimitPerQuestion: quizData.settings?.timeLimitPerQuestion || undefined,
                        allowMultipleAttempts: quizData.settings?.allowMultipleAttempts || false,
                        showAnswersAfter: quizData.settings?.showAnswersAfter || "end",
                    },
                });

                if (user && user.uid !== quizData.userId) {
                    const attemptsQuery = query(
                        collection(db, "attempts"),
                        where("userId", "==", user.uid),
                        where("quizId", "==", quizId)
                    );
                    const attemptsSnapshot = await getDocs(attemptsQuery);
                    const hasPlayed = !attemptsSnapshot.empty;
                    setCanPlay(!hasPlayed || quizData.settings?.allowMultipleAttempts || false);
                } else {
                    setCanPlay(true);
                }

                const unsubscribeQuestions = onSnapshot(
                    collection(db, "quizzes", quizId, "questions"),
                    (snapshot) => {
                        const questionsData = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as Question[];
                        console.log("Perguntas carregadas em QuizDetails:", questionsData);
                        setQuestions(questionsData);
                        setLoading(false);
                    }
                );

                const rankingQuery = query(
                    collection(db, "attempts"),
                    where("quizId", "==", quizId),
                    orderBy("correctAnswers", "desc"),
                    orderBy("completedAt", "asc")
                );
                const rankingSnapshot = await getDocs(rankingQuery);
                const rankingData = rankingSnapshot.docs.map((doc) => doc.data() as Attempt);
                console.log("Ranking carregado em QuizDetails:", rankingData);
                setRanking(rankingData);

                return () => unsubscribeQuestions();
            } catch (error) {
                console.error("Erro ao carregar quiz ou ranking:", error);
                setLoading(false);
            }
        };

        if (user) fetchQuizAndCheckAttempts();
        return () => unsubscribeAuth();
    }, [quizId, navigate, user]);

    const handleDeleteQuiz = async () => {
        if (!quiz || !quizId) return;
        if (!confirm(`Tem certeza que deseja excluir o quiz "${quiz.name}"?`)) return;

        try {
            await deleteDoc(doc(db, "quizzes", quizId));
            alert("Quiz excluído com sucesso!");
            navigate("/my-quizzes");
        } catch (error) {
            console.error("Erro ao excluir quiz:", error);
            alert("Erro ao excluir quiz.");
        }
    };

    const handleEditQuiz = () => {
        if (!quizId) return;
        navigate(`/quiz/edit/${quizId}`);
    };

    const handlePlayQuiz = () => {
        if (!quizId) return;
        navigate(`/play-quiz/${quizId}`);
    };

    if (loading) return <Loading />;
    if (!user) return <div className="text-white">Faça login para visualizar os detalhes do quiz.</div>;
    if (!quiz) return <div className="text-white">Quiz não encontrado.</div>;

    const isCreator = user.uid === quiz.userId;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">{quiz.name}</h1>
                    <button
                        onClick={() => navigate("/my-quizzes")}
                        className="px-4 py-2 cursor-pointer bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                        Voltar
                    </button>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-300">Descrição</h2>
                            <p className="text-gray-400">{quiz.description || "Sem descrição"}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-300">Detalhes</h2>
                            <ul className="text-gray-400 space-y-1">
                                <li>Criado em: {new Date(quiz.createdAt.toDate()).toLocaleDateString()}</li>
                                <li>Número de perguntas: {questions.length}</li>
                                {quiz.settings?.timeLimitPerQuestion ? (
                                    <li>Tempo por pergunta: {quiz.settings.timeLimitPerQuestion}s</li>
                                ) : (
                                    <li>Tempo por pergunta: Sem limite</li>
                                )}
                                <li>
                                    Respostas exibidas:{" "}
                                    {quiz.settings?.showAnswersAfter === "immediately" ? "Logo após cada pergunta" : "No final"}
                                </li>
                                <li>
                                    Tentativas múltiplas: {quiz.settings?.allowMultipleAttempts ? "Permitidas" : "Não permitidas"}
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 flex space-x-4">
                        {canPlay && (
                            <button
                                onClick={handlePlayQuiz}
                                className="flex items-center px-4 py-2 cursor-pointer bg-green-600 rounded-lg hover:bg-green-500"
                            >
                                <FaPlay className="mr-2" /> Jogar
                            </button>
                        )}
                        {isCreator && (
                            <>
                                <button
                                    onClick={handleEditQuiz}
                                    className="flex items-center px-4 py-2 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-500"
                                >
                                    <FaEdit className="mr-2" /> Editar
                                </button>
                                <button
                                    onClick={handleDeleteQuiz}
                                    className="flex items-center px-4 py-2 cursor-pointer bg-red-600 rounded-lg hover:bg-red-500"
                                >
                                    <FaTrash className="mr-2" /> Excluir
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isCreator && questions.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-4">Perguntas ({questions.length})</h2>
                        <div className="space-y-4">
                            {questions.map((question) => (
                                <div key={question.id} className="bg-gray-700 p-4 rounded-lg">
                                    <p className="text-gray-300">{question.question}</p>
                                    <p className="text-gray-500 text-sm">
                                        Tipo:{" "}
                                        {question.type === "multiple-choice"
                                            ? "Múltipla Escolha"
                                            : question.type === "true-false"
                                                ? "Verdadeiro/Falso"
                                                : "Preenchimento"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <RankingDisplay ranking={ranking} totalQuestions={questions.length} />
            </div>
        </div>
    );
}

export default QuizDetails;