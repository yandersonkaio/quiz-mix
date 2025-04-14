import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quiz, useQuizData } from "../../hooks/useQuizData";

interface QuizSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizDetails?: Partial<Quiz>;
    quizId?: string;
    onSave?: (updatedDetails: Partial<Quiz>) => Promise<void>;
    isCreating?: boolean;
}

export function QuizSettingsModal({
    isOpen,
    onClose,
    quizDetails = {
        name: "",
        description: "",
        settings: {
            showAnswersAfter: "end",
            timeLimitPerQuestion: undefined,
        },
    },
    onSave,
    isCreating = false,
}: QuizSettingsModalProps) {
    const [formData, setFormData] = useState<Partial<Quiz>>({
        ...quizDetails,
        settings: {
            showAnswersAfter: quizDetails.settings?.showAnswersAfter ?? "end",
            timeLimitPerQuestion: quizDetails.settings?.timeLimitPerQuestion,
        },
    });
    const [isSaving, setIsSaving] = useState(false);
    const { user, createQuiz, operationLoading } = useQuizData();
    const navigate = useNavigate();

    const isStudyMode = formData.settings?.showAnswersAfter === "untilCorrect";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            alert("O nome do quiz é obrigatório.");
            return;
        }

        setIsSaving(true);
        try {
            if (isCreating) {
                if (!user?.uid) {
                    alert("Você precisa estar logado para criar um quiz.");
                    return;
                }

                const newQuiz: Omit<Quiz, "id" | "createdAt"> = {
                    name: formData.name,
                    description: formData.description,
                    userId: user.uid,
                    settings: {
                        showAnswersAfter: formData.settings?.showAnswersAfter ?? "end",
                        timeLimitPerQuestion: formData.settings?.timeLimitPerQuestion,
                    },
                };
                const createdQuizId = await createQuiz(newQuiz);
                if (createdQuizId) {
                    navigate(`/quiz/details/${createdQuizId}`);
                    onClose();
                }
            } else if (onSave) {
                await onSave(formData);
                onClose();
            }
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alert(`Erro ao ${isCreating ? "criar" : "salvar"} o quiz.`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isCreating ? "Criar Novo Quiz" : "Editar Configurações do Quiz"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                        disabled={isSaving || operationLoading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">
                            Nome do Quiz
                        </label>
                        <input
                            type="text"
                            value={formData.name ?? ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                            placeholder="Digite o nome do quiz"
                            required
                            disabled={isSaving || operationLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description ?? ""}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                            placeholder="Digite a descrição do quiz"
                            disabled={isSaving || operationLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1">
                            Exibir Respostas
                        </label>
                        <select
                            value={formData.settings?.showAnswersAfter ?? "end"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        showAnswersAfter: e.target.value as
                                            | "immediately"
                                            | "end"
                                            | "untilCorrect",
                                        timeLimitPerQuestion:
                                            e.target.value === "untilCorrect"
                                                ? undefined
                                                : formData.settings?.timeLimitPerQuestion,
                                    } as Quiz["settings"],
                                })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none"
                            disabled={isSaving || operationLoading}
                        >
                            <option value="immediately">
                                Logo após responder cada pergunta
                            </option>
                            <option value="end">No final</option>
                            <option value="untilCorrect">Tentar até acertar</option>
                        </select>
                    </div>

                    {isStudyMode ? (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/50 rounded-lg p-4 flex items-center gap-3">
                            <svg
                                className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
                                />
                            </svg>
                            <div className="text-gray-800 dark:text-gray-200">
                                <span className="font-semibold text-blue-600 dark:text-blue-300">
                                    Modo Estudo ativo:
                                </span>{" "}
                                Sem limite de tempo por pergunta e ranking desativado.
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-1">
                                Tempo por Pergunta (segundos)
                            </label>
                            <input
                                type="number"
                                value={formData.settings?.timeLimitPerQuestion ?? ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        settings: {
                                            ...formData.settings,
                                            timeLimitPerQuestion: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        } as Quiz["settings"],
                                    })
                                }
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                                placeholder="Deixe em branco para sem limite"
                                min="1"
                                disabled={isSaving || operationLoading}
                            />
                        </div>
                    )}

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 cursor-pointer bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                            disabled={isSaving || operationLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || operationLoading}
                            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200
                                ${isSaving || operationLoading
                                    ? "bg-blue-300 dark:bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 cursor-pointer"
                                } text-white`}
                        >
                            {isSaving || operationLoading ? (
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
                                    {isCreating ? "Criando..." : "Salvando..."}
                                </>
                            ) : (
                                <>{isCreating ? "Criar Quiz" : "Salvar"}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}