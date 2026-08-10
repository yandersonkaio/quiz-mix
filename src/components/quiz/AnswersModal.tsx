import { Question, Attempt } from "../../types/quiz";
import { IoMdClose } from "react-icons/io";
import { BookOpen, Target } from "lucide-react";

interface AnswersModalProps {
    isOpen: boolean;
    onClose: () => void;
    attempt: Attempt;
    questions: Question[];
}

export default function AnswersModal({ isOpen, onClose, attempt, questions }: AnswersModalProps) {
    const isStudyMode = attempt.mode === 'study';

    const getAnswerText = (question: Question, answer: number | string) => {
        if (answer === -1) return "Tempo esgotado";
        if (question.type === "multiple-choice" && question.options) return question.options[Number(answer)];
        if (question.type === "true-false") return Number(answer) === 1 ? "Verdadeiro" : "Falso";
        return String(answer);
    };

    const getCorrectAnswerText = (question: Question) => {
        if (question.type === "multiple-choice" && question.options && question.correctAnswer !== undefined)
            return question.options[question.correctAnswer];
        if (question.type === "true-false") return question.correctAnswer === 1 ? "Verdadeiro" : "Falso";
        return question.blankAnswer || "";
    };

    const formattedDateTime = attempt.completedAt
        ? attempt.completedAt.toDate().toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
        : "Data não disponível";

    const totalAttempts = attempt.answers.reduce((sum, answer) => sum + (answer.attempts || 1), 0);
    const efficiency = questions.length > 0 ? ((questions.length / totalAttempts) * 100).toFixed(1) : "0.0";
    const avgAttemptsPerQuestion = questions.length > 0 ? (totalAttempts / questions.length).toFixed(1) : "0.0";

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-none shadow-lg dark:shadow-lg transition-colors duration-200 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {isStudyMode ? (
                            <>
                                <BookOpen className="text-blue-500" size={24} />
                                Resultado do Estudo
                            </>
                        ) : (
                            <>
                                <Target className="text-green-500" size={24} />
                                Respostas de {attempt.displayName}
                            </>
                        )}
                    </h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                        aria-label="Fechar modal"
                    >
                        <IoMdClose className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-6 text-gray-700 dark:text-gray-300">
                    {isStudyMode ? (
                        <>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                {attempt.displayName}, você completou o quiz!
                            </p>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Tentativas</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalAttempts}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Eficiência</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{efficiency}%</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Média/Questão</p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{avgAttemptsPerQuestion}</p>
                                </div>
                            </div>
                            <p className="text-sm">
                                Concluído em: <span className="font-semibold">{formattedDateTime}</span>
                            </p>
                        </>
                    ) : (
                        <>
                            <p>
                                Acertos: <span className="font-semibold text-green-600 dark:text-green-400">{attempt.correctAnswers}</span> de{" "}
                                <span className="font-semibold">{attempt.totalQuestions}</span> (
                                <span className="font-semibold">{attempt.percentage}%</span>)
                            </p>
                            <p>
                                Concluído em: <span className="font-semibold">{formattedDateTime}</span>
                            </p>
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Revisão das Respostas
                    </h3>
                    {attempt.answers.map((answer, idx) => {
                        const question = questions.find((q) => q.id === answer.questionId);
                        if (!question) return null;
                        return (
                            <div
                                key={idx}
                                className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-none transition-colors duration-200"
                            >
                                <p className="font-medium text-gray-900 dark:text-white">{question.question}</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Sua resposta: {getAnswerText(question, answer.selectedAnswer)}
                                    {answer.isCorrect ? (
                                        <span className="text-green-600 dark:text-green-400"> (Correto)</span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400"> (Errado)</span>
                                    )}
                                    {isStudyMode && (
                                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                                            - {answer.attempts || 1} tentativa(s)
                                        </span>
                                    )}
                                </p>
                                {!answer.isCorrect && (
                                    <p className="text-gray-700 dark:text-gray-300">
                                        Resposta correta: {getCorrectAnswerText(question)}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 cursor-pointer bg-gray-500 dark:bg-gray-600 rounded-lg text-white hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}