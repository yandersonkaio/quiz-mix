import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuizData } from "@/hooks/useQuizData";
import { Quiz, QuizDifficulty } from "@/types/quiz";
import { getDifficultyConfig } from "@/utils/quis";
import { toast } from "sonner";

type QuizMode = "challenge" | "study";

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
        difficulty: undefined,
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

    const getInitialMode = (): QuizMode => {
        if (quizDetails.settings?.showAnswersAfter === "untilCorrect") {
            return "study";
        }
        return "challenge";
    };

    const [quizMode, setQuizMode] = useState<QuizMode>(getInitialMode());
    const [isSaving, setIsSaving] = useState(false);
    const [hasTimeLimit, setHasTimeLimit] = useState(
        !!quizDetails.settings?.timeLimitPerQuestion
    );
    const { user, createQuiz, operationLoading } = useQuizData();
    const navigate = useNavigate();

    const difficultyConfig = getDifficultyConfig(formData.difficulty);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            toast.error("O nome do quiz é obrigatório.");
            return;
        }

        setIsSaving(true);
        try {
            const settings = {
                showAnswersAfter: quizMode === "study"
                    ? "untilCorrect" as const
                    : (formData.settings?.showAnswersAfter ?? "end"),
                timeLimitPerQuestion: quizMode === "study" || !hasTimeLimit
                    ? undefined
                    : (formData.settings?.timeLimitPerQuestion ?? 30),
            };

            if (isCreating) {
                if (!user?.uid) {
                    toast.error("Você precisa estar logado para criar um quiz.");
                    return;
                }

                const newQuiz: Omit<Quiz, "id" | "createdAt"> = {
                    name: formData.name,
                    description: formData.description,
                    difficulty: formData.difficulty,
                    userId: user.uid,
                    settings,
                };
                const createdQuizId = await createQuiz(newQuiz);
                if (createdQuizId) {
                    navigate(`/quiz/details/${createdQuizId}`);
                    onClose();
                }
            } else if (onSave) {
                await onSave({
                    ...formData,
                    settings,
                });
                onClose();
            }
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            toast.error(`Erro ao ${isCreating ? "criar" : "salvar"} o quiz.`);
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
                        {isCreating ? "Configurações do Quiz" : "Editar Configurações do Quiz"}
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
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
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
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                            Descrição
                        </label>
                        <textarea
                            value={formData.description ?? ""}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                            placeholder="Digite a descrição do quiz"
                            rows={3}
                            disabled={isSaving || operationLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
                            Dificuldade
                        </label>
                        <select
                            value={formData.difficulty ?? ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    difficulty: e.target.value
                                        ? (e.target.value as QuizDifficulty)
                                        : undefined,
                                })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none appearance-none"
                            disabled={isSaving || operationLoading}
                        >
                            <option value="">Sem classificação</option>
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                        </select>

                        {formData.difficulty && (
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyConfig.colors}`}>
                                    {difficultyConfig.icon}
                                    {difficultyConfig.label}
                                </span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                            🎯 Como os participantes responderão?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setQuizMode("challenge")}
                                className={`p-4 cursor-pointer rounded-lg border-2 text-left transition-all duration-200 ${quizMode === "challenge"
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                disabled={isSaving || operationLoading}
                            >
                                <div className="text-2xl mb-2">🎯</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Desafio
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Teste seus conhecimentos e veja seu desempenho ao final.
                                </p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setQuizMode("study")}
                                className={`p-4 cursor-pointer rounded-lg border-2 text-left transition-all duration-200 ${quizMode === "study"
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                disabled={isSaving || operationLoading}
                            >
                                <div className="text-2xl mb-2">📖</div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    Estudo
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Aprenda enquanto responde. Você poderá tentar novamente até acertar.
                                </p>
                            </button>
                        </div>
                    </div>

                    {quizMode === "challenge" && (
                        <>
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                                    Resultado - Quando mostrar as respostas?
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                settings: {
                                                    ...formData.settings,
                                                    showAnswersAfter: "immediately",
                                                } as Quiz["settings"],
                                            })
                                        }
                                        className={`p-4 cursor-pointer rounded-lg border-2 text-left transition-all duration-200 ${formData.settings?.showAnswersAfter === "immediately"
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                            }`}
                                        disabled={isSaving || operationLoading}
                                    >
                                        <div className="text-2xl mb-2">⚡</div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            Após cada resposta
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Veja imediatamente se acertou ou errou.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                settings: {
                                                    ...formData.settings,
                                                    showAnswersAfter: "end",
                                                } as Quiz["settings"],
                                            })
                                        }
                                        className={`p-4 cursor-pointer rounded-lg border-2 text-left transition-all duration-200 ${formData.settings?.showAnswersAfter === "end"
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                                            : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                            }`}
                                        disabled={isSaving || operationLoading}
                                    >
                                        <div className="text-2xl mb-2">📊</div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                            No final
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Responda todas as questões e veja seu resultado no final.
                                        </p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 mb-3 font-medium">
                                    ⏱️ Tempo por pergunta
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={hasTimeLimit ? (formData.settings?.timeLimitPerQuestion ?? 30) : ""}
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
                                            className="w-24 p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                                            placeholder="30"
                                            min="1"
                                            disabled={!hasTimeLimit || isSaving || operationLoading}
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            segundos
                                        </span>
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!hasTimeLimit}
                                            onChange={(e) => setHasTimeLimit(!e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            disabled={isSaving || operationLoading}
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            Sem limite de tempo
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}

                    {quizMode === "study" && (
                        <div className="space-y-4">
                            <div className="border-l-4 border-gray-300 dark:border-gray-500 pl-4 py-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">📖</span>
                                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Modo de Estudo</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    O participante tentará acertar a alternativa da questão até encontrar a alternativa correta.
                                </p>
                            </div>

                            <div className="border-l-4 border-yellow-400 dark:border-yellow-500 pl-4 py-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">🏆</span>
                                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Participa do ranking</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    A classificação será baseada no número de tentativas necessárias para concluir o quiz. Quanto menos tentativas, melhor.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 cursor-pointer bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
                            disabled={isSaving || operationLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || operationLoading}
                            className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 font-medium
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