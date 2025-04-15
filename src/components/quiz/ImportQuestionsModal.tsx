import React, { useState } from 'react';
import { validateQuestionData } from '../../utils/validation';
import { Question } from '../../types/quiz';

type QuestionData = Omit<Question, 'id'>;

interface ImportQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveImportedQuestions: (questions: QuestionData[]) => Promise<void>;
    quizId: string;
}

interface PreviewQuestion {
    data: Partial<Question>;
    errors: string[];
    isValid: boolean;
}

export default function ImportQuestionsModal({
    isOpen,
    onClose,
    onSaveImportedQuestions,
}: ImportQuestionsModalProps) {
    const [_, setSelectedFile] = useState<File | null>(null);
    const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const resetState = () => {
        setSelectedFile(null);
        setPreviewQuestions([]);
        setFileError(null);
        setIsProcessing(false);
        setIsSaving(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            resetState();
            return;
        }

        if (file.type !== 'application/json') {
            setFileError('Formato de arquivo inválido. Por favor, selecione um arquivo .json.');
            setSelectedFile(null);
            setPreviewQuestions([]);
            return;
        }

        setSelectedFile(file);
        setFileError(null);
        setPreviewQuestions([]);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Não foi possível ler o conteúdo do arquivo.");
                }
                const json = JSON.parse(text);

                if (!Array.isArray(json)) {
                    throw new Error("O arquivo JSON deve conter um array de perguntas.");
                }

                const previews: PreviewQuestion[] = json.map((qData: any, index: number): PreviewQuestion => {
                    if (typeof qData !== 'object' || qData === null) {
                        return { data: {}, errors: [`Item ${index + 1} não é um objeto de pergunta válido.`], isValid: false };
                    }
                    const errors = validateQuestionData(qData as Partial<Question>);
                    return {
                        data: qData,
                        errors: errors,
                        isValid: errors.length === 0,
                    };
                });

                setPreviewQuestions(previews);

            } catch (error: any) {
                console.error("Erro ao processar JSON:", error);
                setFileError(`Erro ao processar o arquivo: ${error.message}`);
                setPreviewQuestions([]);
            } finally {
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            console.error("Erro ao ler arquivo:", reader.error);
            setFileError("Ocorreu um erro ao ler o arquivo.");
            setIsProcessing(false);
        };

        reader.readAsText(file);
    };

    const handleSave = async () => {
        const validQuestionsToSave: QuestionData[] = previewQuestions
            .filter(pq => pq.isValid)
            .map(pq => pq.data as QuestionData);

        if (validQuestionsToSave.length === 0) {
            alert("Nenhuma pergunta válida encontrada no arquivo para importar.");
            return;
        }

        setIsSaving(true);
        setFileError(null);

        try {
            await onSaveImportedQuestions(validQuestionsToSave);
            alert(`Sucesso! ${validQuestionsToSave.length} perguntas importadas.`);
            handleClose();
        } catch (error: any) {
            console.error("Erro ao salvar perguntas importadas:", error);
            setFileError(`Erro ao salvar perguntas: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const validCount = previewQuestions.filter(pq => pq.isValid).length;
    const invalidCount = previewQuestions.length - validCount;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={handleClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-none shadow-lg dark:shadow-lg transition-colors duration-200 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 text-gray-900 dark:text-white">
                    <h2 className="text-xl font-semibold">Importar Perguntas de Arquivo JSON</h2>
                    <button
                        onClick={handleClose}
                        className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                        aria-label="Fechar modal"
                    >
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="file_input">
                        Selecione o arquivo JSON
                    </label>
                    <input
                        className="block w-full text-sm text-gray-900 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 placeholder-gray-500 p-2.5 transition-colors duration-200"
                        id="file_input"
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        disabled={isProcessing || isSaving}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        O arquivo deve ser .json contendo um array de objetos de perguntas.
                        <a
                            href="#"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline ml-1 transition-colors duration-200"
                            onClick={(e) => {
                                e.preventDefault();
                                alert(
                                    'Exemplo de formato JSON:\n[\n  {\n    "type": "multiple-choice",\n    "question": "Sua pergunta?",\n    "options": ["Opção A", "Opção B"],\n    "correctAnswer": 0\n  },\n  ...\n]'
                                );
                            }}
                        >
                            Ver formato exemplo
                        </a>
                    </p>
                    {isProcessing && <p className="text-yellow-600 dark:text-yellow-400 mt-2">Processando arquivo...</p>}
                    {fileError && <p className="text-red-600 dark:text-red-500 text-sm mt-2">{fileError}</p>}
                </div>

                {previewQuestions.length > 0 && (
                    <div className="flex-grow overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-900/50 transition-colors duration-200">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Pré-visualização ({validCount} válidas, {invalidCount} inválidas)
                        </h3>
                        <div className="space-y-3">
                            {previewQuestions.map((pq, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded transition-colors duration-200 ${pq.isValid
                                        ? 'bg-green-100 border border-green-200'
                                        : 'bg-red-100 border border-red-200'
                                        } dark:${pq.isValid ? 'bg-green-900/50 border-green-700/50' : 'bg-red-900/50 border-red-700/50'
                                        }`}
                                >
                                    <p className="text-gray-900 dark:text-gray-300 font-medium">
                                        <span
                                            className={`font-bold mr-2 ${pq.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                }`}
                                        >
                                            {index + 1}.
                                        </span>
                                        {pq.data.question || <span className="text-gray-500 italic">Pergunta em branco</span>}
                                        <span className="text-xs text-gray-500 ml-2">
                                            ({pq.data.type || 'Tipo inválido'})
                                        </span>
                                    </p>
                                    {!pq.isValid && pq.errors.length > 0 && (
                                        <ul className="list-disc list-inside mt-1 ml-4 text-red-600 dark:text-red-400 text-xs">
                                            {pq.errors.map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex space-x-4 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 py-2 px-4 cursor-pointer bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors duration-200"
                        disabled={isProcessing || isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isProcessing || isSaving || validCount === 0}
                        className={`flex-1 py-2 px-4 rounded-lg text-white flex items-center justify-center gap-2 transition-colors duration-200 ${isSaving || validCount === 0 || isProcessing
                            ? 'bg-blue-400 dark:bg-blue-400 cursor-not-allowed opacity-70'
                            : 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 cursor-pointer'
                            }`}
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
                            `Salvar ${validCount > 0 ? validCount : ''} Perguntas Válidas`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}