import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaEdit,
    FaTrash,
    FaInfoCircle,
    FaListUl
} from "react-icons/fa";

import Loading from "../components/Loading";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { CollectionSettingsModal } from "@/components/collection/CollectionSettingsModal";

import { useCollection } from "@/hooks/useCollection";
import { useCollectionData } from "../hooks/useCollectionData";

import { toast } from "sonner";
import { QuizCollection } from "@/types/quiz";


function CollectionDetails() {
    const { collectionId } = useParams<{ collectionId: string }>();
    const navigate = useNavigate();
    console.log(collectionId)
    const {
        collection,
        loading,
        user
    } = useCollection(collectionId);


    const {
        deleteCollection,
        operationLoading
    } = useCollectionData();

    const { updateCollection } = useCollectionData();

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleSaveCollection = async (
        updatedCollection: Partial<QuizCollection>
    ) => {
        if (!collection) return;

        await updateCollection(collection.id, updatedCollection);
    };

    if (loading) {
        return <Loading />;
    }


    if (!collection) {
        return (
            <div className="p-6 text-gray-900 dark:text-white">
                Coleção não encontrada.
            </div>
        );
    }


    const isCreator = collection.userId === user?.uid;


    const handleDeleteCollection = async () => {
        try {
            await deleteCollection(collection.id);

            toast.success("Coleção excluída com sucesso.");

            navigate("/my-collections");

        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir coleção.");
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 text-gray-900 dark:text-white">

            <div className="max-w-6xl mx-auto">


                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">

                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            {collection.name}
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {collection.description || "Sem descrição"}
                        </p>
                    </div>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">


                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">

                        <div className="flex items-center mb-4">
                            <FaInfoCircle className="text-blue-500 mr-3" />
                            <h2 className="text-xl font-semibold">
                                Detalhes
                            </h2>
                        </div>


                        <div className="space-y-3">

                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Criada em:
                                </span>

                                <span>
                                    {collection.createdAt
                                        ? collection.createdAt
                                            .toDate()
                                            .toLocaleDateString("pt-BR")
                                        : "N/A"
                                    }
                                </span>
                            </div>


                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Quizzes:
                                </span>

                                <span>
                                    0
                                </span>
                            </div>

                        </div>

                    </div>



                    {isCreator && (

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">

                            <div className="flex items-center mb-4">
                                <FaEdit className="text-purple-500 mr-3" />
                                <h2 className="text-xl font-semibold">
                                    Gerenciar Coleção
                                </h2>
                            </div>


                            <div className="space-y-3">

                                <button
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    className="w-full flex justify-between items-center px-4 py-2 cursor-pointer rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                                >
                                    Editar coleção
                                    <FaEdit />
                                </button>


                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="w-full flex justify-between items-center px-4 py-2 cursor-pointer rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200 "
                                >
                                    Excluir coleção
                                    <FaTrash />
                                </button>

                            </div>

                        </div>

                    )}

                </div>




                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">


                    <div className="flex items-center mb-6">

                        <FaListUl className="text-indigo-500 mr-3" />

                        <h2 className="text-xl font-semibold">
                            Quizzes (0)
                        </h2>

                    </div>


                    <div className="text-center py-12">

                        <h3 className="text-lg font-medium">
                            Nenhum quiz adicionado
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Adicione quizzes para organizar sua coleção.
                        </p>

                    </div>


                </div>



            </div>


            {isCreator && (
                <>
                    <CollectionSettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        collection={collection}
                        onSave={handleSaveCollection}
                    />


                    <ConfirmDeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteCollection}
                        title="Excluir Coleção"
                        message={`Tem certeza que deseja excluir "${collection.name}"?`}
                        isLoading={operationLoading}
                    />
                </>
            )}

        </div>
    );
}


export default CollectionDetails;