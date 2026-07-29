import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { QuizCollection } from "@/types/quiz";
import { useCollectionData } from "@/hooks/useCollectionData";

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionDetails?: Partial<QuizCollection>;
    onSave?: (updatedDetails: Partial<QuizCollection>) => Promise<void>;
    isCreating?: boolean;
}

export function CollectionModal({
    isOpen,
    onClose,
    collectionDetails = {
        name: "",
        description: "",
    },
    onSave,
    isCreating = false,
}: CollectionModalProps) {
    const [formData, setFormData] = useState<Partial<QuizCollection>>(
        collectionDetails
    );

    const [isSaving, setIsSaving] = useState(false);

    const { user, createCollection, operationLoading } = useCollectionData();

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit");
        if (!formData.name?.trim()) {
            toast.error("O nome da coleção é obrigatório.");
            return;
        }

        setIsSaving(true);

        try {
            console.log(isCreating)
            if (isCreating) {
                if (!user?.uid) {
                    toast.error(
                        "Você precisa estar logado para criar uma coleção."
                    );
                    return;
                }

                const newCollection: Omit<
                    QuizCollection,
                    "id" | "createdAt"
                > = {
                    name: formData.name,
                    description: formData.description,
                    userId: user.uid,
                };

                const createdCollectionId =
                    await createCollection(newCollection);


                console.log("Depois do createCollection", createdCollectionId);


                if (createdCollectionId) {
                    navigate(`/collections/${createdCollectionId}`);
                    onClose();
                }
            } else if (onSave) {
                await onSave(formData);
                onClose();
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
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg shadow-xl"
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
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        disabled={isSaving || operationLoading}
                    >
                        ✕
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div>
                        <label className="block mb-1 text-gray-700 dark:text-gray-300">
                            Nome da coleção
                        </label>

                        <input
                            type="text"
                            value={formData.name ?? ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                            placeholder="Ex.: Bíblia"
                            disabled={isSaving || operationLoading}
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-gray-700 dark:text-gray-300">
                            Descrição
                        </label>

                        <textarea
                            value={formData.description ?? ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none"
                            placeholder="Descreva esta coleção (opcional)"
                            rows={4}
                            disabled={isSaving || operationLoading}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving || operationLoading}
                            className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving || operationLoading}
                            className={`flex-1 py-3 rounded-lg text-white transition-colors ${isSaving || operationLoading
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            {isSaving || operationLoading
                                ? isCreating
                                    ? "Criando..."
                                    : "Salvando..."
                                : isCreating
                                    ? "Criar Coleção"
                                    : "Salvar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}