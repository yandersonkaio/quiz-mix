import React from "react";
import { MdCancel } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar Exclusão",
    message = "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.",
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300"
        >
            <div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-200 dark:border-none transition-colors duration-200 animate-fadeIn"
            >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex items-center px-6 py-4 cursor-pointer bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors duration-200"
                    >
                        <MdCancel className="mr-2" />
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-4 rounded-lg text-white flex items-center justify-center gap-2 transition-colors duration-200 ${isLoading
                            ? "bg-red-400 dark:bg-red-400 cursor-not-allowed"
                            : "bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 cursor-pointer"
                            }`}
                    >
                        {isLoading ? (
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
                                Excluindo...
                            </>
                        ) : (
                            <>
                                <FaTrashAlt className="mr-2" />
                                Excluir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};