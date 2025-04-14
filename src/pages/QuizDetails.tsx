import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash, FaPlay, FaFileUpload } from "react-icons/fa";
import { RankingDisplay } from "../components/quiz/RankingDisplay";
import { Quiz, Question, useQuizData, QuestionData } from "../hooks/useQuizData";
import { QuizSettingsModal } from "../components/quiz/QuizSettingsModal";
import QuestionModal from "../components/quiz/QuestionModal";
import ImportQuestionsModal from "../components/quiz/ImportQuestionsModal";
import { IoMdAdd } from "react-icons/io";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

function QuizDetails() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"quiz" | "question" | null>(null);
    const [questionIdToDelete, setQuestionIdToDelete] = useState<string | null>(null);

    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id: "",
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
    });

    const [isEditing, setIsEditing] = useState(false);

    const {
        quiz,
        questions,
        ranking,
        allUserAttempts,
        loading,
        fetchRanking,
        user,
        updateQuizDetails,
        deleteQuiz,
        addQuestion,
        addMultipleQuestions,
        operationLoading,
        updateQuestion,
        deleteQuestion,
    } = useQuizData();

    const isUntilCorrectMode = quiz?.settings.showAnswersAfter === "untilCorrect";

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
        if (!quiz || operationLoading) return;
        setDeleteTarget("quiz");
        setIsDeleteModalOpen(true);
    };

    const handleRemoveQuestion = async (questionId: string) => {
        if (operationLoading) return;
        setDeleteTarget("question");
        setQuestionIdToDelete(questionId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            if (deleteTarget === "quiz") {
                await deleteQuiz();
                navigate("/my-quizzes");
            } else if (deleteTarget === "question" && questionIdToDelete) {
                await deleteQuestion(questionIdToDelete);
            }
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
            setQuestionIdToDelete(null);
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao realizar a exclusão.");
        }
    };

    const handleSaveQuestion = async (question: Question) => {
        const questionData: Omit<Question, "id"> = {
            type: question.type,
            question: question.question,
            ...(question.type === "multiple-choice" && { options: question.options, correctAnswer: question.correctAnswer }),
            ...(question.type === "true-false" && { correctAnswer: question.correctAnswer }),
            ...(question.type === "fill-in-the-blank" && { blankAnswer: question.blankAnswer }),
        };

        if (!questionData.question.trim()) {
            alert("A pergunta não pode estar vazia.");
            return;
        }

        try {
            if (isEditing && question.id) {
                await updateQuestion(question.id, questionData);
            } else {
                await addQuestion(questionData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Erro ao processar questão:", error);
        }
    };

    const handleSaveImportedQuestions = async (importedQuestions: QuestionData[]) => {
        if (!quizId) {
            console.error("Quiz ID não encontrado para importar perguntas.");
            throw new Error("ID do Quiz não encontrado.");
        }
        if (!addMultipleQuestions) {
            console.error("Função addMultipleQuestions não disponível no hook useQuizData.");
            throw new Error("Funcionalidade de importar não disponível.");
        }

        try {
            await addMultipleQuestions(importedQuestions);
        } catch (error) {
            console.error("Falha ao chamar addMultipleQuestions a partir de QuizDetails:", error);
            throw error;
        }
    };

    const openModalForEdit = (question: Question) => {
        setCurrentQuestion({ ...question });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const openModalForAdd = () => {
        setCurrentQuestion({
            id: "",
            type: "multiple-choice",
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handlePlayQuiz = () => {
        if (!quizId) return;
        if (questions.length === 0) {
            alert("Adicione perguntas ao quiz antes de jogar!");
            return;
        }
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
            setIsSettingsModalOpen(false);
        } catch (error) {
            console.error("Erro ao salvar detalhes do quiz:", error);
            alert("Erro ao salvar detalhes do quiz.");
        }
    };

    if (loading) return <Loading />;
    if (!quiz) return <div className="text-white p-6">Quiz não encontrado.</div>;

    const isCreator = quiz.userId === user?.uid;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold ml-12 md:ml-0">{quiz.name}</h1>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-300">Descrição</h2>
                                <p className="text-gray-400">{quiz.description || "Sem descrição"}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-300">Detalhes</h2>
                            <ul className="text-gray-400 space-y-1">
                                <li>Criado em: {quiz.createdAt ? new Date(quiz.createdAt.toDate()).toLocaleDateString() : "N/A"}</li>
                                <li>Número de perguntas: {questions.length}</li>
                                {quiz.settings?.timeLimitPerQuestion ? (
                                    <li>Tempo por pergunta: {quiz.settings.timeLimitPerQuestion}s</li>
                                ) : (
                                    <li>Tempo por pergunta: Sem limite</li>
                                )}
                                <li>
                                    Respostas exibidas:{" "}
                                    {quiz.settings?.showAnswersAfter === "immediately"
                                        ? "Imediato"
                                        : quiz.settings?.showAnswersAfter === "untilCorrect"
                                            ? "Após acertar"
                                            : "No final"}
                                </li>
                                <li>Tentativas múltiplas: {quiz.settings?.allowMultipleAttempts ? "Permitidas" : "Não permitidas"}</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <button
                            onClick={handlePlayQuiz}
                            disabled={questions.length === 0 || operationLoading}
                            className="flex items-center px-4 py-2 cursor-pointer bg-green-600 rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={questions.length === 0 ? "Adicione perguntas para jogar" : "Jogar o Quiz"}
                        >
                            <FaPlay className="mr-2" /> Jogar
                        </button>
                        {isCreator && (
                            <>
                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    disabled={operationLoading}
                                    className="flex items-center px-4 py-2 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50"
                                    title="Editar configurações do Quiz"
                                >
                                    <FaEdit className="mr-2" /> Editar
                                </button>
                                <button
                                    onClick={handleDeleteQuiz}
                                    disabled={operationLoading}
                                    className="flex items-center px-4 py-2 cursor-pointer bg-red-600 rounded-lg hover:bg-red-500 disabled:opacity-50"
                                    title="Excluir Quiz"
                                >
                                    <FaTrash className="mr-2" /> Excluir
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isCreator && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Perguntas ({questions.length})</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    disabled={operationLoading}
                                    title="Importar Perguntas de JSON"
                                    className="flex items-center p-3 cursor-pointer bg-purple-600 rounded-lg hover:bg-purple-500 disabled:opacity-50"
                                >
                                    <FaFileUpload className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={openModalForAdd}
                                    disabled={operationLoading}
                                    title="Adicionar Pergunta Manualmente"
                                    className="flex items-center p-3 cursor-pointer bg-green-600 rounded-lg hover:bg-green-500 disabled:opacity-50"
                                >
                                    <IoMdAdd className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {questions.length === 0 ? (
                            <p className="text-gray-400 bg-gray-800 p-4 rounded-lg">Nenhuma pergunta adicionada ainda.</p>
                        ) : (
                            <div className="flex-grow overflow-y-auto mb-4 border border-gray-700 rounded-lg p-4 bg-gray-900/50 space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="bg-gray-800 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg"
                                    >
                                        <div className="mb-3 sm:mb-0 mr-4 flex-grow">
                                            <p className="text-gray-300">
                                                <span className="font-bold mr-2 text-gray-500">{index + 1}.</span>
                                                {question.question}
                                            </p>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Tipo:{" "}
                                                {question.type === "multiple-choice"
                                                    ? "Múltipla Escolha"
                                                    : question.type === "true-false"
                                                        ? "Verdadeiro/Falso"
                                                        : "Preenchimento"}
                                            </p>
                                        </div>
                                        <div className="space-x-2 flex flex-shrink-0">
                                            <button
                                                onClick={() => openModalForEdit(question)}
                                                className="flex items-center h-10 w-10 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 justify-center disabled:opacity-50"
                                                disabled={operationLoading}
                                                title="Editar Pergunta"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => question.id && handleRemoveQuestion(question.id)}
                                                className="flex items-center h-10 w-10 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-500 justify-center disabled:opacity-50"
                                                disabled={operationLoading}
                                                title="Excluir Pergunta"
                                            >
                                                {operationLoading ? "..." : <FaTrash />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!isUntilCorrectMode && (
                    <RankingDisplay
                        ranking={ranking}
                        allUserAttempts={allUserAttempts}
                        questions={questions}
                    />
                )}

                {isCreator && (
                    <>
                        <QuizSettingsModal
                            isOpen={isSettingsModalOpen}
                            onClose={() => setIsSettingsModalOpen(false)}
                            quizDetails={quizDetails}
                            onSave={handleSaveQuizDetails}
                        />
                        <QuestionModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            question={currentQuestion}
                            onSave={handleSaveQuestion}
                            isEditing={isEditing}
                        />
                        <ImportQuestionsModal
                            isOpen={isImportModalOpen}
                            onClose={() => setIsImportModalOpen(false)}
                            onSaveImportedQuestions={handleSaveImportedQuestions}
                            quizId={quizId || ""}
                        />

                        <ConfirmDeleteModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => setIsDeleteModalOpen(false)}
                            onConfirm={confirmDelete}
                            title={deleteTarget === "quiz" ? "Excluir Quiz" : "Excluir Pergunta"}
                            message={
                                deleteTarget === "quiz"
                                    ? `Tem certeza que deseja excluir o quiz "${quiz.name}"? Esta ação não pode ser desfeita.`
                                    : "Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita."
                            }
                            isLoading={operationLoading}
                        />
                    </>
                )}

            </div>
        </div>
    );
}

export default QuizDetails;