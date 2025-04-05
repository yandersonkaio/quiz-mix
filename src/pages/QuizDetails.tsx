import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash, FaPlay } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { RankingDisplay } from "../components/quiz/RankingDisplay";
import { Quiz, useQuizData } from "../hooks/useQuizData";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../db/firebase";
import { QuizSettingsModal } from "../components/quiz/QuizSettingsModal";

function QuizDetails() {
    const { quizId } = useParams<{ quizId: string }>();
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const navigate = useNavigate();
    const {
        quiz,
        questions,
        canPlay,
        ranking,
        allUserAttempts,
        loading,
        fetchRanking,
        user,
        updateQuizDetails,
    } = useQuizData();

    const [quizDetails, setQuizDetails] = useState<Partial<Quiz>>({
        name: "",
        description: "",
        settings: {
            showAnswersAfter: "end",
            timeLimitPerQuestion: undefined,
            allowMultipleAttempts: false,
        },
    });

    useEffect(() => {
        if (!quizId) {
            navigate("/login");
            return;
        }

        fetchRanking();
    }, [quizId, navigate, fetchRanking]);

    useEffect(() => {
        if (quiz) {
            setQuizDetails({
                name: quiz.name,
                description: quiz.description || "",
                settings: {
                    showAnswersAfter: quiz.settings.showAnswersAfter,
                    timeLimitPerQuestion: quiz.settings.timeLimitPerQuestion,
                    allowMultipleAttempts: quiz.settings.allowMultipleAttempts || true,
                },
            });
        }
    }, [quiz]);

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

    const handleSaveQuizDetails = async (updatedDetails: Partial<Quiz>) => {
        try {
            await updateQuizDetails(updatedDetails);
            setQuizDetails((prev) => {
                const newSettings: Quiz["settings"] = {
                    showAnswersAfter: updatedDetails.settings?.showAnswersAfter ?? prev.settings?.showAnswersAfter ?? "end",
                    timeLimitPerQuestion: updatedDetails.settings?.timeLimitPerQuestion ?? prev.settings?.timeLimitPerQuestion,
                    allowMultipleAttempts: updatedDetails.settings?.allowMultipleAttempts ?? prev.settings?.allowMultipleAttempts ?? false,
                };
                return {
                    ...prev,
                    ...updatedDetails,
                    settings: newSettings,
                };
            });
            alert("Detalhes do quiz atualizados com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar detalhes do quiz:", error);
            alert("Erro ao salvar detalhes do quiz.");
        }
    };

    if (loading) return <Loading />;
    if (!quiz) return <div className="text-white">Quiz não encontrado.</div>;

    const isCreator = quiz.userId === user?.uid;

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
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-300">Descrição</h2>
                                <p className="text-gray-400">{quiz.description || "Sem descrição"}</p>
                            </div>
                            {isCreator && (
                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    className="text-gray-400 cursor-pointer hover:text-white"
                                >
                                    <MdEdit className="w-6 h-6" />
                                </button>
                            )}
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
                                    {quiz.settings?.showAnswersAfter === "immediately"
                                        ? "Logo após cada pergunta"
                                        : "No final"}
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

                <RankingDisplay
                    ranking={ranking}
                    allUserAttempts={allUserAttempts}
                    totalQuestions={questions.length}
                />
            </div>
            <QuizSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                quizDetails={quizDetails}
                onSave={handleSaveQuizDetails}
            />
        </div>
    );
}

export default QuizDetails;