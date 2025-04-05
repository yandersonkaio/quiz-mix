import { useState } from "react";
import { Quiz } from "../../hooks/useQuizData";

interface QuizSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizDetails: Partial<Quiz>;
    onSave: (updatedDetails: Partial<Quiz>) => Promise<void>;
}

export function QuizSettingsModal({
    isOpen,
    onClose,
    quizDetails,
    onSave,
}: QuizSettingsModalProps) {
    const [formData, setFormData] = useState<Partial<Quiz>>({
        ...quizDetails,
        settings: {
            showAnswersAfter: quizDetails.settings?.showAnswersAfter ?? "end",
            timeLimitPerQuestion: quizDetails.settings?.timeLimitPerQuestion,
            allowMultipleAttempts: quizDetails.settings?.allowMultipleAttempts ?? false,
        },
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alert("Erro ao salvar configurações do quiz.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>

            <div
                className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Impede que clique dentro feche o modal
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Editar Configurações do Quiz</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 cursor-pointer hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-300 mb-1">Nome do Quiz</label>
                        <input
                            type="text"
                            value={formData.name ?? ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Digite o nome do quiz"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Descrição</label>
                        <textarea
                            value={formData.description ?? ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Digite a descrição do quiz"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Exibir Respostas</label>
                        <select
                            value={formData.settings?.showAnswersAfter ?? "end"}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        showAnswersAfter: e.target.value as "immediately" | "end",
                                    } as Quiz["settings"],
                                })
                            }
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none"
                        >
                            <option value="immediately">Logo após cada pergunta</option>
                            <option value="end">No final</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Tempo por Pergunta (segundos)</label>
                        <input
                            type="number"
                            value={formData.settings?.timeLimitPerQuestion ?? ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        timeLimitPerQuestion: e.target.value ? Number(e.target.value) : undefined,
                                    } as Quiz["settings"],
                                })
                            }
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Deixe em branco para sem limite"
                            min="1"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-300 mb-1">Permitir Múltiplas Tentativas</label>
                        <input
                            type="checkbox"
                            checked={formData.settings?.allowMultipleAttempts ?? false}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    settings: {
                                        ...formData.settings,
                                        allowMultipleAttempts: e.target.checked,
                                    } as Quiz["settings"],
                                })
                            }
                            className="h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 cursor-pointer bg-gray-600 rounded-lg hover:bg-gray-500"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`flex-1 py-3 rounded-lg 
        ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'}
        flex items-center justify-center gap-2
    `}
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
