import { useState, useEffect, useRef } from "react";
import { Question } from "../../types/quiz";
import { toast } from "sonner";

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
    const [expandedFeedbacks, setExpandedFeedbacks] = useState<Record<number, boolean>>({});

    const isSavingRef = useRef(false);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        // Só processa se o modal estiver aberto
        if (!isOpen) return;

        const newFormData = { ...question };

        if (newFormData.type === "multiple-choice") {
            if (!newFormData.optionFeedback) {
                newFormData.optionFeedback = Array(newFormData.options?.length || 4).fill(null);
            }
        }

        // Só atualiza se não estiver salvando e for a primeira carga
        if (!isSavingRef.current && isFirstLoad.current) {
            setFormData(newFormData);

            // Inicia com todos recolhidos
            setExpandedFeedbacks({});

            isFirstLoad.current = false;
        }
    }, [question, isOpen]); // ✅ Adicionado isOpen como dependência

    // ✅ Resetar a ref quando o modal abrir
    useEffect(() => {
        if (isOpen) {
            isFirstLoad.current = true;
            isSavingRef.current = false;
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSave = { ...formData };

        if (!validateQuestion(dataToSave)) return;

        isSavingRef.current = true;
        setIsSaving(true);

        try {
            await onSave(dataToSave);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar pergunta:", error);
            toast.error("Erro ao salvar a pergunta.");
        } finally {
            setIsSaving(false);
            setTimeout(() => {
                isSavingRef.current = false;
            }, 500);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(formData.options || ["", "", "", ""])];
        newOptions[index] = value;

        // Mantém o optionFeedback existente
        const currentFeedback = formData.optionFeedback || Array(newOptions.length).fill("");

        setFormData({
            ...formData,
            options: newOptions,
            optionFeedback: currentFeedback
        });
    };

    const toggleFeedback = (index: number) => {
        setExpandedFeedbacks((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleFeedbackChange = (index: number, value: string) => {
        const feedback = [
            ...(formData.optionFeedback ?? Array(formData.options?.length ?? 4).fill("")),
        ];
        feedback[index] = value;

        setFormData({
            ...formData,
            optionFeedback: feedback,
        });
    };

    const validateQuestion = (q: Question): boolean => {
        if (!q.question.trim()) {
            toast.error("A pergunta não pode estar vazia.");
            return false;
        }
        if (q.type === "multiple-choice") {
            if (!q.options || q.options.length < 2 || q.correctAnswer === undefined) {
                toast.error("Perguntas de múltipla escolha devem ter pelo menos 2 opções e uma resposta correta definida.");
                return false;
            }
            if (q.options.some((opt) => !opt.trim())) {
                toast.error("Todas as opções devem ser preenchidas.");
                return false;
            }
        } else if (q.type === "true-false" && q.correctAnswer === undefined) {
            toast.error("Perguntas verdadeiro/falso devem ter uma resposta correta definida.");
            return false;
        } else if (q.type === "fill-in-the-blank" && !q.blankAnswer?.trim()) {
            toast.error("Perguntas de preenchimento devem ter uma resposta definida.");
            return false;
        }
        return true;
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
                                    optionFeedback: e.target.value === "multiple-choice" ? ["", "", "", ""] : undefined,
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
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-700 dark:text-gray-300">
                                    Opções
                                </label>
                                {formData.optionFeedback && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                                        {formData.optionFeedback.filter(f => f?.trim()).length} de {formData.options?.length} com feedback
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const allExpanded = formData.options?.every((_, i) => expandedFeedbacks[i]);
                                        const newExpanded: Record<number, boolean> = {};
                                        formData.options?.forEach((_, i) => {
                                            newExpanded[i] = !allExpanded;
                                        });
                                        setExpandedFeedbacks(newExpanded);
                                    }}
                                    className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 
                                               text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                                               transition-colors duration-200 cursor-pointer"
                                >
                                    {formData.options?.every((_, i) => expandedFeedbacks[i])
                                        ? 'Recolher todos os feedbacks'
                                        : 'Expandir todos os feedbacks'}
                                </button>
                            </div>

                            {formData.options?.map((option: string, index: number) => (
                                <div
                                    key={index}
                                    className={`mb-3 rounded-lg border transition-all duration-200 ${expandedFeedbacks[index]
                                        ? 'border-blue-400 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                >
                                    <div className="p-3">
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-medium ${expandedFeedbacks[index]
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400'
                                                }`}>
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

                                        <div className="mt-2 flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => toggleFeedback(index)}
                                                className={`text-sm flex items-center gap-2 transition-all duration-200 cursor-pointer
                                                    ${expandedFeedbacks[index]
                                                        ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                                                        : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                                    }`}
                                            >
                                                {expandedFeedbacks[index] ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                        Ocultar feedback
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                        </svg>
                                                        {formData.optionFeedback?.[index]?.trim() ? (
                                                            <span className="flex items-center gap-1">
                                                                Editar feedback
                                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                                                                    title="Feedback definido" />
                                                            </span>
                                                        ) : (
                                                            'Adicionar feedback explicativo'
                                                        )}
                                                    </>
                                                )}
                                            </button>

                                            {formData.optionFeedback?.[index]?.trim() && !expandedFeedbacks[index] && (
                                                <span className="text-xs text-gray-400 dark:text-gray-500 italic truncate max-w-[200px]">
                                                    "{formData.optionFeedback[index].substring(0, 30)}..."
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {expandedFeedbacks[index] && (
                                        <div className="px-3 pb-3 animate-slideDown">
                                            <div className="relative">
                                                <textarea
                                                    rows={4}
                                                    className="w-full p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 resize-none"
                                                    placeholder="Explique por que esta alternativa está correta ou incorreta. Este feedback será mostrado após responder."
                                                    value={formData.optionFeedback?.[index] ?? ""}
                                                    onChange={(e) => handleFeedbackChange(index, e.target.value)}
                                                    maxLength={500}
                                                    disabled={isSaving}
                                                />
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-400">
                                                        💡 Dica: Explique o raciocínio por trás desta opção
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {`${(formData.optionFeedback?.[index] ?? "").length}/500`}
                                                    </span>
                                                </div>
                                            </div>

                                            {(formData.optionFeedback?.[index] ?? "").trim() ? (
                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-lg">💬</span>
                                                        <div>
                                                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                                                Prévia do feedback:
                                                            </p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                {formData.optionFeedback?.[index]}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center">
                                                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                                                        ✍️ Nenhum feedback definido ainda
                                                    </p>
                                                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                                                        O feedback ajuda a entender o raciocínio por trás de cada alternativa
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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