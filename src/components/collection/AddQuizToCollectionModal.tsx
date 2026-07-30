import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useUserQuizzes } from "../../hooks/useUserQuizzes";
import { useCollectionQuizzes } from "../../hooks/useCollectionQuizzes";

interface AddQuizToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
}

export default function AddQuizToCollectionModal({
    isOpen,
    onClose,
    collectionId,
}: AddQuizToCollectionModalProps) {
    const { userQuizzes, loading } = useUserQuizzes();

    const {
        quizzes: collectionQuizzes,
        addQuizToCollection,
        removeQuizFromCollection,
        operationLoading,
    } = useCollectionQuizzes(collectionId);

    const [selectedQuizzes, setSelectedQuizzes] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedQuizzes(
            collectionQuizzes.map((q) => q.id)
        );
    }, [isOpen, collectionQuizzes]);

    const toggleQuiz = (quizId: string) => {
        setSelectedQuizzes((prev) =>
            prev.includes(quizId)
                ? prev.filter((id) => id !== quizId)
                : [...prev, quizId]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const currentIds = collectionQuizzes.map((q) => q.id);

            for (const id of selectedQuizzes) {
                if (!currentIds.includes(id)) {
                    await addQuizToCollection(id);
                }
            }

            for (const quiz of collectionQuizzes) {
                if (
                    !selectedQuizzes.includes(quiz.id) &&
                    quiz.collectionItemId
                ) {
                    await removeQuizFromCollection(
                        quiz.collectionItemId
                    );
                }
            }

            toast.success("Coleção atualizada.");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar coleção.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Adicionar quizzes
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Selecione os quizzes que pertencem a esta coleção.
                    </p>
                </div>

                <div className="max-h-[55vh] overflow-y-auto p-6">
                    {loading ? (
                        <p className="text-center">Carregando...</p>
                    ) : userQuizzes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Você ainda não possui quizzes.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userQuizzes.map((quiz) => {
                                const checked = selectedQuizzes.includes(quiz.id);

                                return (
                                    <label
                                        key={quiz.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleQuiz(quiz.id)}
                                            className="mt-1 h-5 w-5"
                                        />

                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {quiz.name}
                                            </h3>

                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {quiz.description || "Sem descrição"}
                                            </p>

                                            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                {quiz.questionCount ?? 0} perguntas
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={saving || operationLoading}
                        className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || operationLoading}
                        className={`px-5 py-2 rounded-lg text-white transition-colors
                            ${saving || operationLoading
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {saving || operationLoading
                            ? "Salvando..."
                            : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
}