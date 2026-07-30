import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { toast } from "sonner";

import { useCollectionSections } from "@/hooks/useCollectionSections";

interface ManageSectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
}

export default function ManageSectionsModal({
    isOpen,
    onClose,
    collectionId,
}: ManageSectionsModalProps) {
    const {
        sections,
        addSection,
        updateSection,
        removeSection,
        operationLoading,
    } = useCollectionSections(collectionId);

    const [sectionName, setSectionName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!sectionName.trim()) {
            toast.error("Informe o nome da seção.");
            return;
        }

        try {
            if (editingId) {
                await updateSection(editingId, sectionName.trim());
                toast.success("Seção atualizada.");
            } else {
                await addSection(sectionName.trim());
                toast.success("Seção criada.");
            }

            setSectionName("");
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar seção.");
        }
    };

    const handleEdit = (
        section: {
            id: string;
            name: string;
        }
    ) => {
        setEditingId(section.id);
        setSectionName(section.name);
    };

    const handleDelete = async (sectionId: string) => {
        try {
            await removeSection(sectionId);
            toast.success("Seção excluída.");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir seção.");
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Gerenciar seções
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Crie níveis para organizar sua coleção.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={sectionName}
                            onChange={(e) => setSectionName(e.target.value)}
                            placeholder="Nome da seção"
                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />

                        <button
                            onClick={handleSave}
                            disabled={operationLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
                        >
                            <IoMdAdd />

                            {editingId ? "Salvar" : "Adicionar"}
                        </button>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {sections.length === 0 ? (
                            <p className="text-center text-gray-500 py-6">
                                Nenhuma seção criada.
                            </p>
                        ) : (
                            sections.map((section) => (
                                <div
                                    key={section.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>📁</span>

                                        <span className="text-gray-900 dark:text-white">
                                            {section.name}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(section)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded cursor-pointer"
                                        >
                                            <FaEdit />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(section.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded cursor-pointer"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-pointer"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}