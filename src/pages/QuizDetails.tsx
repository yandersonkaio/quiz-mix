import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash, FaPlay, FaFileUpload, FaTrophy, FaInfoCircle, FaListUl } from "react-icons/fa";
import { RankingDisplay } from "../components/quiz/RankingDisplay";
import { useQuizData, QuestionData } from "../hooks/useQuizData";
import { QuizSettingsModal } from "../components/quiz/QuizSettingsModal";
import QuestionModal from "../components/quiz/QuestionModal";
import ImportQuestionsModal from "../components/quiz/ImportQuestionsModal";
import { IoMdAdd } from "react-icons/io";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { Quiz, Question } from "../types/quiz";

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
        statistics
    } = useQuizData();

    const isUntilCorrectMode = quiz?.settings.showAnswersAfter === "untilCorrect";

    const [quizDetails, setQuizDetails] = useState<Partial<Quiz>>({
        name: "",
        description: "",
        settings: {
            showAnswersAfter: "end",
            timeLimitPerQuestion: undefined,
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
            ...(question.type === "multiple-choice" && {
                options: question.options,
                correctAnswer: question.correctAnswer,
            }),
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
    if (!quiz) return <div className="text-gray-900 dark:text-white p-6">Quiz não encontrado.</div>;

    const isCreator = quiz.userId === user?.uid;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 text-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl ml-12 md:ml-0 font-bold text-gray-900 dark:text-white">
                            {quiz.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {quiz.description || "Sem descrição"}
                        </p>
                    </div>

                    <button
                        onClick={handlePlayQuiz}
                        disabled={questions.length === 0 || operationLoading}
                        className={`flex items-center cursor-pointer px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105
                            ${questions.length === 0 ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' :
                                'bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/50'}
                            text-white font-semibold text-lg`}
                        title={questions.length === 0 ? "Adicione perguntas para jogar" : "Jogar o Quiz"}
                    >
                        <FaPlay className="mr-3" /> Responder Quiz
                        {questions.length > 0 && (
                            <span className="ml-3 px-2 py-1 bg-white/20 rounded-full text-sm">
                                {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'}
                            </span>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaInfoCircle className="text-blue-500 dark:text-blue-400 mr-3 text-xl" />
                            <h2 className="text-xl font-semibold">Detalhes</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Criado em:</span>
                                <span className="font-medium">
                                    {quiz.createdAt
                                        ? new Date(quiz.createdAt.toDate()).toLocaleDateString()
                                        : "N/A"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Modo:</span>
                                <span className="font-medium">
                                    {quiz.settings?.showAnswersAfter === "immediately"
                                        ? "Respostas Imediatas"
                                        : quiz.settings?.showAnswersAfter === "untilCorrect"
                                            ? "Até Acertar"
                                            : "Mostrar no Final"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Tempo por pergunta:</span>
                                <span className="font-medium">
                                    {quiz.settings?.timeLimitPerQuestion
                                        ? `${quiz.settings.timeLimitPerQuestion}s`
                                        : "Sem limite"}
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FaTrophy className="text-yellow-500 dark:text-yellow-400 mr-3 text-xl" />
                            <h2 className="text-xl font-semibold">Estatísticas</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Total de tentativas:</span>
                                <span className="font-medium">{statistics?.totalUniqueUsers}</span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Melhor pontuação:</span>
                                <span className="font-medium">
                                    {ranking.length > 0 ? `${statistics?.bestPercentage}%` : "N/A"}
                                </span>
                            </li>
                            <li className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Média geral:</span>
                                <span className="font-medium">
                                    {ranking.length > 0
                                        ? `${statistics?.averagePercentage}%`
                                        : "N/A"}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {isCreator && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center mb-4">
                                <FaEdit className="text-purple-500 dark:text-purple-400 mr-3 text-xl" />
                                <h2 className="text-xl font-semibold">Gerenciar Quiz</h2>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    disabled={operationLoading}
                                    className="w-full flex items-center justify-between cursor-pointer px-4 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg transition-colors duration-200"
                                >
                                    <span>Editar Configurações</span>
                                    <FaEdit className="ml-2" />
                                </button>
                                <button
                                    onClick={openModalForAdd}
                                    disabled={operationLoading}
                                    className="w-full flex items-center justify-between cursor-pointer px-4 py-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-600 dark:text-green-300 rounded-lg transition-colors duration-200"
                                >
                                    <span>Adicionar Pergunta</span>
                                    <IoMdAdd className="ml-2" />
                                </button>
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    disabled={operationLoading}
                                    className="w-full flex items-center justify-between cursor-pointer px-4 py-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-lg transition-colors duration-200"
                                >
                                    <span>Importar Perguntas</span>
                                    <FaFileUpload className="ml-2" />
                                </button>
                                <button
                                    onClick={handleDeleteQuiz}
                                    disabled={operationLoading}
                                    className="w-full flex items-center justify-between cursor-pointer px-4 py-2 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg transition-colors duration-200"
                                >
                                    <span>Excluir Quiz</span>
                                    <FaTrash className="ml-2" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {isCreator && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center">
                                <FaListUl className="text-indigo-500 dark:text-indigo-400 mr-3 text-xl" />
                                <h2 className="text-xl font-semibold">Perguntas ({questions.length})</h2>
                            </div>
                            {questions.length > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsImportModalOpen(true)}
                                        disabled={operationLoading}
                                        title="Importar Perguntas de JSON"
                                        className="flex items-center p-3 cursor-pointer bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        <FaFileUpload className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={openModalForAdd}
                                        disabled={operationLoading}
                                        title="Adicionar Pergunta Manualmente"
                                        className="flex items-center p-3 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        <IoMdAdd className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <IoMdAdd className="text-4xl text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Nenhuma pergunta ainda</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">Adicione perguntas para começar seu quiz</p>
                                <button
                                    onClick={openModalForAdd}
                                    className="px-6 py-2 cursor-pointer bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                                >
                                    Adicionar Primeira Pergunta
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="group bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-grow">
                                                <div className="flex items-start">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-medium mr-3 mt-0.5 flex-shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                                            {question.question}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full text-gray-700 dark:text-gray-300">
                                                                {question.type === "multiple-choice"
                                                                    ? "Múltipla Escolha"
                                                                    : question.type === "true-false"
                                                                        ? "Verdadeiro/Falso"
                                                                        : "Preenchimento"}
                                                            </span>
                                                            {question.type === "multiple-choice" && (
                                                                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full text-gray-700 dark:text-gray-300">
                                                                    4 opções
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={() => openModalForEdit(question)}
                                                    className="p-2 cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                                                    title="Editar Pergunta"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => question.id && handleRemoveQuestion(question.id)}
                                                    className="p-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                                                    title="Excluir Pergunta"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {!isUntilCorrectMode && isCreator && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <RankingDisplay
                            ranking={ranking}
                            allUserAttempts={allUserAttempts}
                            questions={questions}
                        />
                    </div>
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