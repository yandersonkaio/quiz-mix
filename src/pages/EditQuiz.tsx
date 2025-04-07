import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useQuizData, Question } from "../hooks/useQuizData";

function EditQuiz() {
    const navigate = useNavigate();
    const { quiz, questions, loading, operationLoading, user, addQuestion, updateQuestion, deleteQuestion } = useQuizData();
    const [newQuestion, setNewQuestion] = useState<Question>({
        id: "",
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
    });
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    const validateQuestion = (question: Question): boolean => {
        if (!question.question.trim()) {
            alert("A pergunta não pode estar vazia.");
            return false;
        }
        if (question.type === "multiple-choice") {
            if (!question.options || question.options.length < 2 || question.correctAnswer === undefined) {
                alert("Perguntas de múltipla escolha devem ter pelo menos 2 opções e uma resposta correta definida.");
                return false;
            }
            if (question.options.some((opt) => !opt.trim())) {
                alert("Todas as opções devem ser preenchidas.");
                return false;
            }
        } else if (question.type === "true-false" && question.correctAnswer === undefined) {
            alert("Perguntas verdadeiro/falso devem ter uma resposta correta definida.");
            return false;
        } else if (question.type === "fill-in-the-blank" && !question.blankAnswer?.trim()) {
            alert("Perguntas de preenchimento devem ter uma resposta definida.");
            return false;
        }
        return true;
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateQuestion(newQuestion)) return;

        const questionData: Omit<Question, "id"> = {
            type: newQuestion.type,
            question: newQuestion.question,
        };

        if (newQuestion.type === "multiple-choice") {
            questionData.options = newQuestion.options;
            questionData.correctAnswer = newQuestion.correctAnswer;
        } else if (newQuestion.type === "true-false") {
            questionData.correctAnswer = newQuestion.correctAnswer;
        } else if (newQuestion.type === "fill-in-the-blank") {
            questionData.blankAnswer = newQuestion.blankAnswer;
        }

        try {
            if (editingQuestionId) {
                await updateQuestion(editingQuestionId, questionData);
            } else {
                await addQuestion(questionData);
            }
            setNewQuestion({ id: "", type: "multiple-choice", question: "", options: ["", "", "", ""], correctAnswer: 0 });
            setEditingQuestionId(null);
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

    const handleEditQuestion = (question: Question) => {
        setNewQuestion({ ...question });
        setEditingQuestionId(question.id || null);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(newQuestion.options || ["", "", "", ""])];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const handleCancelEdit = () => {
        setNewQuestion({ id: "", type: "multiple-choice", question: "", options: ["", "", "", ""], correctAnswer: 0 });
        setEditingQuestionId(null);
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
                    <h2 className="text-2xl font-semibold mb-4">Perguntas ({questions.length})</h2>
                    {questions.length === 0 ? (
                        <p className="text-gray-400">Nenhuma pergunta adicionada ainda.</p>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q) => (
                                <div key={q.id} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                                    <span>{q.question}</span>
                                    <div className="space-x-2 flex flex-row">
                                        <button
                                            onClick={() => handleEditQuestion(q)}
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

                <form onSubmit={handleSaveQuestion} className="space-y-6 bg-gray-800 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold">
                        {editingQuestionId ? "Editar Pergunta" : "Adicionar Nova Pergunta"}
                    </h2>
                    <div>
                        <label className="block text-gray-300 mb-1">Tipo de Pergunta</label>
                        <select
                            value={newQuestion.type}
                            onChange={(e) =>
                                setNewQuestion({
                                    ...newQuestion,
                                    type: e.target.value as Question["type"],
                                    options: e.target.value === "multiple-choice" ? ["", "", "", ""] : undefined,
                                    correctAnswer: e.target.value === "fill-in-the-blank" ? undefined : 0,
                                    blankAnswer: e.target.value === "fill-in-the-blank" ? "" : undefined,
                                })
                            }
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none"
                            disabled={operationLoading}
                        >
                            <option value="multiple-choice">Múltipla Escolha</option>
                            <option value="true-false">Verdadeiro ou Falso</option>
                            <option value="fill-in-the-blank">Preenchimento de Lacunas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Pergunta</label>
                        <input
                            type="text"
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Digite a pergunta"
                            required
                            disabled={operationLoading}
                        />
                    </div>

                    {newQuestion.type === "multiple-choice" && (
                        <div>
                            <label className="block text-gray-300 mb-1">Opções</label>
                            {newQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <span className="text-gray-400">{String.fromCharCode(65 + index)}</span>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                                        placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                                        required
                                        disabled={operationLoading}
                                    />
                                </div>
                            ))}
                            <label className="block text-gray-300 mb-1 mt-4">Resposta Correta</label>
                            <select
                                value={newQuestion.correctAnswer}
                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none"
                                disabled={operationLoading}
                            >
                                {newQuestion.options?.map((_, index) => (
                                    <option key={index} value={index}>
                                        {String.fromCharCode(65 + index)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {newQuestion.type === "true-false" && (
                        <div>
                            <label className="block text-gray-300 mb-1">Resposta Correta</label>
                            <select
                                value={newQuestion.correctAnswer}
                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none"
                                disabled={operationLoading}
                            >
                                <option value={1}>Verdadeiro</option>
                                <option value={0}>Falso</option>
                            </select>
                        </div>
                    )}

                    {newQuestion.type === "fill-in-the-blank" && (
                        <div>
                            <label className="block text-gray-300 mb-1">Resposta da Lacuna</label>
                            <input
                                type="text"
                                value={newQuestion.blankAnswer || ""}
                                onChange={(e) => setNewQuestion({ ...newQuestion, blankAnswer: e.target.value })}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Digite a resposta correta"
                                required
                                disabled={operationLoading}
                            />
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400"
                            disabled={operationLoading}
                        >
                            {operationLoading ? "Salvando..." : editingQuestionId ? "Salvar Alterações" : "Adicionar Pergunta"}
                        </button>
                        {editingQuestionId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full py-3 bg-gray-600 rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
                                disabled={operationLoading}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditQuiz;