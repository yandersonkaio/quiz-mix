import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useQuizData } from "../hooks/useQuizData";
import { collection, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../db/firebase";

interface Question {
    id?: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank";
    question: string;
    options?: string[];
    correctAnswer?: number;
    blankAnswer?: string;
}

function EditQuiz() {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { quiz, questions, loading, user } = useQuizData();
    const [newQuestion, setNewQuestion] = useState<Question>({
        type: "multiple-choice",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
    });
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizId || !newQuestion.question.trim()) return;

        let questionData: any = {
            type: newQuestion.type,
            question: newQuestion.question,
        };

        if (newQuestion.type === "multiple-choice") {
            if (!newQuestion.options || newQuestion.correctAnswer === undefined) return;
            if (newQuestion.options.some((opt) => !opt.trim())) return;
            questionData.options = newQuestion.options;
            questionData.correctAnswer = newQuestion.correctAnswer;
        } else if (newQuestion.type === "true-false") {
            if (newQuestion.correctAnswer === undefined) return;
            questionData.correctAnswer = newQuestion.correctAnswer;
        } else if (newQuestion.type === "fill-in-the-blank") {
            if (!newQuestion.blankAnswer?.trim()) return;
            questionData.blankAnswer = newQuestion.blankAnswer;
        }

        try {
            if (editingQuestionId) {
                await setDoc(doc(db, "quizzes", quizId, "questions", editingQuestionId), questionData, { merge: true });
                alert("Questão atualizada com sucesso!");
            } else {
                await addDoc(collection(db, "quizzes", quizId, "questions"), questionData);
                alert("Questão adicionada com sucesso!");
            }
            setNewQuestion({ type: "multiple-choice", question: "", options: ["", "", "", ""], correctAnswer: 0 });
            setEditingQuestionId(null);
        } catch (error) {
            console.error("Erro ao salvar questão:", error);
            alert("Erro ao salvar questão.");
        }
    };

    const handleRemoveQuestion = async (questionId: string) => {
        if (!quizId || !questionId) return;

        try {
            await deleteDoc(doc(db, "quizzes", quizId, "questions", questionId));
            alert("Questão removida com sucesso!");
        } catch (error) {
            console.error("Erro ao remover questão:", error);
            alert("Erro ao remover questão.");
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
        setNewQuestion({ type: "multiple-choice", question: "", options: ["", "", "", ""], correctAnswer: 0 });
        setEditingQuestionId(null);
    };

    if (loading) return <Loading />;
    if (!user) return <div className="text-white">Faça login para editar o quiz.</div>;
    if (!quiz) return <div className="text-white">Quiz não encontrado.</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Editar Quiz</h1>
                    <div className="space-x-4">
                        <button
                            onClick={() => navigate(`/quiz/details/${quizId}`)}
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
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => q.id && handleRemoveQuestion(q.id)}
                                            className="flex items-center h-10 w-10 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-500 justify-center"
                                        >
                                            <FaTrash />
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
                                    />
                                </div>
                            ))}
                            <label className="block text-gray-300 mb-1 mt-4">Resposta Correta</label>
                            <select
                                value={newQuestion.correctAnswer}
                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none"
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
                            />
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            {editingQuestionId ? "Salvar Alterações" : "Adicionar Pergunta"}
                        </button>
                        {editingQuestionId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="w-full py-3 bg-gray-600 rounded-lg hover:bg-gray-700"
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