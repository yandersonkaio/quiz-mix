import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { useQuizData, Question } from "../hooks/useQuizData";
import QuestionModal from "../components/quiz/QuestionModal";

function EditQuiz() {
    const navigate = useNavigate();
    const { quiz, questions, loading, operationLoading, user, addQuestion, updateQuestion, deleteQuestion } = useQuizData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id: "",
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleSaveQuestion = async (question: Question) => {
        const questionData: Omit<Question, "id"> = {
            type: question.type,
            question: question.question,
        };

        if (question.type === "multiple-choice") {
            questionData.options = question.options;
            questionData.correctAnswer = question.correctAnswer;
        } else if (question.type === "true-false") {
            questionData.correctAnswer = question.correctAnswer;
        } else if (question.type === "fill-in-the-blank") {
            questionData.blankAnswer = question.blankAnswer;
        }

        try {
            if (isEditing && question.id) {
                await updateQuestion(question.id, questionData);
            } else {
                await addQuestion(questionData);
            }
        } catch (error) {
            console.error("Erro ao processar questão:", error);
        }
    };

    const handleRemoveQuestion = async (questionId: string) => {
        if (operationLoading) return;
        try {
            await deleteQuestion(questionId);
        } catch (error) {
            console.error("Erro ao remover questão:", error);
        }
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

    const openModalForEdit = (question: Question) => {
        setCurrentQuestion({ ...question });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    if (loading) return <Loading />;
    if (!user) return <div className="text-white">Faça login para editar o quiz.</div>;
    if (!quiz) return <div className="text-white">Quiz não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Editar Quiz: {quiz.name}</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate(`/quiz/details/${quiz.id}`)}
                            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
                        >
                            Voltar
                        </button>
                    </div>
                </div>
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Perguntas ({questions.length})</h2>
                        <button
                            onClick={openModalForAdd}
                            className="flex items-center px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            <FaPlus className="mr-2" /> Adicionar Pergunta
                        </button>
                    </div>
                    {questions.length === 0 ? (
                        <p className="text-gray-400">Nenhuma pergunta adicionada ainda.</p>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q) => (
                                <div key={q.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                                    <span>{q.question}</span>
                                    <div className="space-x-2 flex flex-row">
                                        <button
                                            onClick={() => openModalForEdit(q)}
                                            className="flex items-center h-10 w-10 cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-500 justify-center"
                                            disabled={operationLoading}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => q.id && handleRemoveQuestion(q.id)}
                                            className="flex items-center h-10 w-10 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-500 justify-center"
                                            disabled={operationLoading}
                                        >
                                            {operationLoading ? "..." : <FaTrash />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <QuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                question={currentQuestion}
                onSave={handleSaveQuestion}
                isEditing={isEditing}
            />
        </div>
    );
}

export default EditQuiz;