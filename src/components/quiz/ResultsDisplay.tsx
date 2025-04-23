import { useRef, useState, useEffect } from "react";
import domToImage from "dom-to-image";
import { useAuth } from '../../contexts/AuthContext';
import { Question, Quiz, UserAnswer } from "../../types/quiz";
import { toast } from "sonner";

interface ResultsDisplayProps {
    quiz: Quiz;
    questions: Question[];
    userAnswers: UserAnswer[];
    onRestart: () => void;
    onBack: () => void;
}

export const ResultsDisplay = ({ quiz, questions, userAnswers, onRestart, onBack }: ResultsDisplayProps) => {
    const resultRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [testDateTime, setTestDateTime] = useState<string>("");

    const { user } = useAuth();

    useEffect(() => {
        const dateTime = new Date().toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
        setTestDateTime(dateTime);
    }, []);

    const correctCount = userAnswers.filter((ans) => ans.isCorrect).length;
    const percentage = questions.length > 0 ? ((correctCount / questions.length) * 100).toFixed(2) : "0.00";

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

    const handleShare = async () => {
        if (!resultRef.current) return;

        setIsSharing(true);
        try {
            const image = await domToImage.toPng(resultRef.current, {
                bgcolor: document.documentElement.classList.contains('dark') ? "#1F2937" : "#f9fafb",
                quality: 1,
                style: {
                    backgroundColor: document.documentElement.classList.contains('dark') ? "#1F2937" : "#f9fafb",
                },
            });

            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], "resultado-quiz.png", { type: "image/png" });

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: `Meu resultado no quiz "${quiz.name}"`,
                    text: `Acertei ${correctCount} de ${questions.length} perguntas (${percentage}%)! Realizado em: ${testDateTime}`,
                });
            } else {
                const link = document.createElement("a");
                link.href = image;
                link.download = "resultado-quiz.png";
                link.click();
                toast.error("Compartilhamento não suportado neste navegador. A imagem foi baixada para você compartilhar manualmente!");
            }
        } catch (error) {
            console.error("Erro ao gerar ou compartilhar a imagem:", error);
            toast.error("Houve um erro ao gerar a imagem para compartilhamento.");
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center border border-gray-200 dark:border-none shadow-md dark:shadow-lg transition-colors duration-200">
            <div ref={resultRef} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Resultado do Quiz: {quiz.name}
                </h2>
                <p className="text-lg text-gray-900 dark:text-white">
                    {user?.displayName} você acertou{" "}
                    <span className="font-semibold text-green-600 dark:text-green-400">{correctCount}</span>{" "}
                    de <span className="font-semibold">{questions.length}</span> perguntas
                    {" "}({percentage}%)!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Teste realizado em: {testDateTime}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Compartilhe seu resultado!</p>
            </div>
            <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Revisão das Respostas
                </h3>
                {questions.map((q) => {
                    const userAnswer = userAnswers.find((ans) => ans.questionId === q.id);
                    return (
                        <div
                            key={q.id}
                            className="text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-none transition-colors duration-200"
                        >
                            <p className="font-medium text-gray-900 dark:text-white">{q.question}</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sua resposta: {userAnswer ? getAnswerText(q, userAnswer.selectedAnswer) : "Não respondida"}
                                {userAnswer?.isCorrect ? (
                                    <span className="text-green-600 dark:text-green-400"> (Correto)</span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400"> (Errado)</span>
                                )}
                            </p>
                            {!userAnswer?.isCorrect && (
                                <p className="text-gray-700 dark:text-gray-300">
                                    Resposta correta: {getCorrectAnswerText(q)}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className={`px-6 py-3 rounded-lg cursor-pointer text-white transition-colors duration-200 ${isSharing ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
                        }`}
                    aria-label="Compartilhar resultado como imagem"
                >
                    {isSharing ? "Gerando..." : "Compartilhar Resultado"}
                </button>
                <button
                    onClick={onRestart}
                    className="px-6 py-3 cursor-pointer bg-blue-600 rounded-lg text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200"
                >
                    Responder Novamente
                </button>
                <button
                    onClick={onBack}
                    className="px-6 py-3 cursor-pointer bg-gray-500 rounded-lg text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200"
                >
                    Voltar
                </button>
            </div>
        </div>
    );
};