import { Question, Attempt } from "../../hooks/useQuizData";
import { IoMdClose } from "react-icons/io";

interface AnswersModalProps {
    isOpen: boolean;
    onClose: () => void;
    attempt: Attempt;
    questions: Question[];
}

export default function AnswersModal({ isOpen, onClose, attempt, questions }: AnswersModalProps) {
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Respostas de {attempt.displayName}
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
                    <p>
                        Acertos: <span className="font-semibold text-green-600 dark:text-green-400">{attempt.correctAnswers}</span> de{" "}
                        <span className="font-semibold">{attempt.totalQuestions}</span> (
                        <span className="font-semibold">{attempt.percentage}%</span>)
                    </p>
                    <p>
                        Concluído em: <span className="font-semibold">{formattedDateTime}</span>
                    </p>
                </div>

                <div className="space-y-4">
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
                                    Resposta: {getAnswerText(question, answer.selectedAnswer)}
                                    {answer.isCorrect ? (
                                        <span className="text-green-600 dark:text-green-400"> (Correto)</span>
                                    ) : (
                                        <span className="text-red-600 dark:text-red-400"> (Errado)</span>
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