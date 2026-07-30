import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useUserQuizzes } from "../../hooks/useUserQuizzes";
import { useCollectionQuizzes } from "../../hooks/useCollectionQuizzes";
import { useCollectionSections } from "@/hooks/useCollectionSections";

interface AddQuizToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
}

interface SelectedQuiz {
    quizId: string;
    sectionId: string | null;
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
        updateQuizSection,
        removeQuizFromCollection,
        operationLoading,
    } = useCollectionQuizzes(collectionId);

    const { sections } = useCollectionSections(collectionId);

    const [selectedQuizzes, setSelectedQuizzes] = useState<SelectedQuiz[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setSelectedQuizzes(
            collectionQuizzes.map((q) => ({
                quizId: q.id,
                sectionId: q.sectionId ?? null
            }))
        );
    }, [isOpen, collectionQuizzes]);

    const toggleQuiz = (quizId: string) => {
        setSelectedQuizzes((prev) =>
            prev.some((q) => q.quizId === quizId)
                ? prev.filter((q) => q.quizId !== quizId)
                : [
                    ...prev,
                    {
                        quizId,
                        sectionId: null
                    }
                ]
        );
    };

    const handleChangeQuizSection = (
        quizId: string,
        sectionId: string | null
    ) => {
        setSelectedQuizzes((prev) =>
            prev.map((q) =>
                q.quizId === quizId
                    ? {
                        ...q,
                        sectionId
                    }
                    : q
            )
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            for (const quiz of selectedQuizzes) {
                const existingQuiz = collectionQuizzes.find(
                    (q) => q.id === quiz.quizId
                );

                if (!existingQuiz) {
                    await addQuizToCollection(
                        quiz.quizId,
                        quiz.sectionId
                    );
                } else if (
                    existingQuiz.sectionId !== quiz.sectionId
                ) {
                    await updateQuizSection(
                        existingQuiz.collectionItemId,
                        quiz.sectionId
                    );
                }
            }

            for (const quiz of collectionQuizzes) {
                const exists = selectedQuizzes.some(
                    (item) => item.quizId === quiz.id
                );

                if (!exists && quiz.collectionItemId) {
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
                        Selecione os quizzes e organize nas seções.
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
                                const selected = selectedQuizzes.find(
                                    (q) => q.quizId === quiz.id
                                );

                                return (
                                    <div
                                        key={quiz.id}
                                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selected}
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

                                            {selected && (
                                                <select
                                                    value={selected.sectionId ?? ""}
                                                    onChange={(e) =>
                                                        handleChangeQuizSection(
                                                            quiz.id,
                                                            e.target.value || null
                                                        )
                                                    }
                                                    className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="">
                                                        Sem seção
                                                    </option>

                                                    {sections.map((section) => (
                                                        <option
                                                            key={section.id}
                                                            value={section.id}
                                                        >
                                                            {section.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
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
                        className={`px-5 py-2 rounded-lg text-white transition-colors ${saving || operationLoading
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