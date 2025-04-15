import { useState, useEffect } from "react";
import { Question } from "../../types/quiz";

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    question: Question;
    onSave: (question: Question) => Promise<void>;
    isEditing: boolean;
}

export default function QuestionModal({ isOpen, onClose, question, onSave, isEditing }: QuestionModalProps) {
    const [formData, setFormData] = useState<Question>({ ...question });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData({ ...question });
    }, [question]);

    const validateQuestion = (q: Question): boolean => {
        if (!q.question.trim()) {
            alert("A pergunta não pode estar vazia.");
            return false;
        }
        if (q.type === "multiple-choice") {
            if (!q.options || q.options.length < 2 || q.correctAnswer === undefined) {
                alert("Perguntas de múltipla escolha devem ter pelo menos 2 opções e uma resposta correta definida.");
                return false;
            }
            if (q.options.some((opt) => !opt.trim())) {
                alert("Todas as opções devem ser preenchidas.");
                return false;
            }
        } else if (q.type === "true-false" && q.correctAnswer === undefined) {
            alert("Perguntas verdadeiro/falso devem ter uma resposta correta definida.");
            return false;
        } else if (q.type === "fill-in-the-blank" && !q.blankAnswer?.trim()) {
            alert("Perguntas de preenchimento devem ter uma resposta definida.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateQuestion(formData)) return;

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar pergunta:", error);
            alert("Erro ao salvar a pergunta.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || ["", "", "", ""])];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-none shadow-lg dark:shadow-lg transition-colors duration-200 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isEditing ? "Editar Pergunta" : "Adicionar Nova Pergunta"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                        aria-label="Fechar modal"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Tipo de Pergunta</label>
                        <select
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value as Question["type"],
                                    options: e.target.value === "multiple-choice" ? ["", "", "", ""] : undefined,
                                    correctAnswer: e.target.value === "fill-in-the-blank" ? undefined : 0,
                                    blankAnswer: e.target.value === "fill-in-the-blank" ? "" : undefined,
                                })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none transition-colors duration-200"
                            disabled={isSaving}
                        >
                            <option value="multiple-choice">Múltipla Escolha</option>
                            <option value="true-false">Verdadeiro ou Falso</option>
                            <option value="fill-in-the-blank">Preenchimento de Lacunas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">Pergunta</label>
                        <input
                            type="text"
                            value={formData.question}
                            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                            placeholder="Digite a pergunta"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {formData.type === "multiple-choice" && (
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Opções</label>
                            {formData.options?.map((option: string, index: number) => (
                                <div key={index} className="flex items-center space-x-2 mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                        placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                                        required
                                        disabled={isSaving}
                                    />
                                </div>
                            ))}
                            <label className="block text-gray-700 dark:text-gray-300 mb-1 mt-4">Resposta Correta</label>
                            <select
                                value={formData.correctAnswer}
                                onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none transition-colors duration-200"
                                disabled={isSaving}
                            >
                                {formData.options?.map((_: string, index: number) => (
                                    <option key={index} value={index}>
                                        {String.fromCharCode(65 + index)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.type === "true-false" && (
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Resposta Correta</label>
                            <select
                                value={formData.correctAnswer}
                                onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none transition-colors duration-200"
                                disabled={isSaving}
                            >
                                <option value={1}>Verdadeiro</option>
                                <option value={0}>Falso</option>
                            </select>
                        </div>
                    )}

                    {formData.type === "fill-in-the-blank" && (
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">Resposta da Lacuna</label>
                            <input
                                type="text"
                                value={formData.blankAnswer || ""}
                                onChange={(e) => setFormData({ ...formData, blankAnswer: e.target.value })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors duration-200"
                                placeholder="Digite a resposta correta"
                                required
                                disabled={isSaving}
                            />
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 cursor-pointer bg-gray-500 dark:bg-gray-600 rounded-lg text-white hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex-1 py-3 rounded-lg text-white flex items-center justify-center gap-2 transition-colors duration-200 ${isSaving
                                ? "bg-green-400 cursor-not-allowed dark:bg-green-400"
                                : "bg-green-600 hover:bg-green-700 cursor-pointer dark:bg-green-600 dark:hover:bg-green-700"
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                    </svg>
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}