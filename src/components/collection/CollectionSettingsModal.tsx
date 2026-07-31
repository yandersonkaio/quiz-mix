import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCollectionData } from "../../hooks/useCollectionData";
import { QuizCollection } from "@/types/quiz";

interface CollectionSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    collection?: Partial<QuizCollection>;
    onSave?: (updatedCollection: Partial<QuizCollection>) => Promise<void>;
    isCreating?: boolean;
}

export function CollectionSettingsModal({
    isOpen,
    onClose,
    collection = {
        name: "",
        description: "",
    },
    onSave,
    isCreating = false,
}: CollectionSettingsModalProps) {
    const navigate = useNavigate();

    const {
        user,
        createCollection,
        operationLoading,
    } = useCollectionData();

    const getInitialData = (collection?: Partial<QuizCollection>) => ({
        name: collection?.name ?? "",
        description: collection?.description ?? "",
    });

    const [formData, setFormData] = useState(getInitialData(collection));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(getInitialData(collection));
    }, [collection]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            toast.error("O nome da coleção é obrigatório.");
            return;
        }

        setIsSaving(true);

        try {
            if (isCreating) {
                if (!user?.uid) {
                    toast.error("Você precisa estar logado para criar uma coleção.");
                    return;
                }

                const createdCollectionId = await createCollection({
                    name: formData.name,
                    description: formData.description,
                    userId: user.uid,
                });

                if (!createdCollectionId) {
                    throw new Error("Falha ao criar coleção.");
                }

                toast.success("Coleção criada com sucesso.");

                onClose();
                navigate(`/collections/${createdCollectionId}`);
            } else if (onSave) {
                await onSave(formData);
            }
        } catch (error) {
            console.error(error);

            toast.error(
                `Erro ao ${isCreating ? "criar" : "salvar"} a coleção.`
            );
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
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {isCreating
                            ? "Criar Nova Coleção"
                            : "Editar Coleção"}
                    </h2>

                    <button
                        onClick={onClose}
                        disabled={isSaving || operationLoading}
                        className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                            Nome da Coleção
                        </label>

                        <input
                            type="text"
                            required
                            maxLength={50}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            disabled={isSaving || operationLoading}
                            placeholder="Ex.: Anatomia Humana"
                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">
                            Descrição
                        </label>

                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            disabled={isSaving || operationLoading}
                            placeholder="Descreva o objetivo desta coleção..."
                            className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white resize-none focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving || operationLoading}
                            className="flex-1 py-3 rounded-lg cursor-pointer bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving || operationLoading}
                            className={`flex-1 py-3 rounded-lg text-white flex items-center justify-center gap-2 transition-colors
                                ${isSaving || operationLoading
                                    ? "bg-blue-300 dark:bg-blue-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                }`}
                        >
                            {isSaving || operationLoading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5"
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
                                        />

                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        />
                                    </svg>

                                    {isCreating
                                        ? "Criando..."
                                        : "Salvando..."}
                                </>
                            ) : (
                                isCreating
                                    ? "Criar Coleção"
                                    : "Salvar"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}