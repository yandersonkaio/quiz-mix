import { useRef, useState, useEffect } from "react";
import domToImage from "dom-to-image";
import { useAuth } from '../../contexts/AuthContext';
import { Question, Quiz, UserAnswer, RankingEntry } from "../../types/quiz";
import { toast } from "sonner";
import { Trophy, Target, BookOpen, Share2 } from "lucide-react";

interface ResultsDisplayProps {
    quiz: Quiz;
    questions: Question[];
    userAnswers: UserAnswer[];
    onRestart: () => void;
    onBack: () => void;
    mode?: 'challenge' | 'study';
    ranking?: RankingEntry[];
}

export const ResultsDisplay = ({
    quiz,
    questions,
    userAnswers,
    onRestart,
    onBack,
    mode = 'challenge',
    ranking = []
}: ResultsDisplayProps) => {
    const resultRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [testDateTime, setTestDateTime] = useState<string>("");

    const { user } = useAuth();

    const isStudyMode = mode === 'study' || quiz.settings?.showAnswersAfter === 'untilCorrect';

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

    // Métricas do modo estudo
    const totalAttempts = userAnswers.reduce((sum, answer) => sum + (answer.attempts || 1), 0);
    const efficiency = questions.length > 0 ? ((questions.length / totalAttempts) * 100).toFixed(1) : "0.0";
    const avgAttemptsPerQuestion = questions.length > 0 ? (totalAttempts / questions.length).toFixed(1) : "0.0";

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

            const shareText = isStudyMode
                ? `Completei o quiz "${quiz.name}" em ${totalAttempts} tentativas (eficiência: ${efficiency}%)! Realizado em: ${testDateTime}`
                : `Acertei ${correctCount} de ${questions.length} perguntas (${percentage}%) no quiz "${quiz.name}"! Realizado em: ${testDateTime}`;

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: `Meu resultado no quiz "${quiz.name}"`,
                    text: shareText,
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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg text-center border border-gray-200 dark:border-none shadow-md dark:shadow-lg transition-colors duration-200">
            <div ref={resultRef} className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-white flex flex-col sm:flex-row items-center justify-center gap-2">
                    {isStudyMode ? (
                        <>
                            <BookOpen className="text-blue-500 flex-shrink-0" size={24} />
                            <span>Resultado do Estudo: {quiz.name}</span>
                        </>
                    ) : (
                        <>
                            <Target className="text-green-500 flex-shrink-0" size={24} />
                            <span>Resultado do Quiz: {quiz.name}</span>
                        </>
                    )}
                </h2>

                {isStudyMode ? (
                    <>
                        <p className="text-base sm:text-lg text-gray-900 dark:text-white mb-4">
                            {user?.displayName}, você completou o quiz!
                        </p>
                        <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tentativas</p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{totalAttempts}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Eficiência</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{efficiency}%</p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Média/Questão</p>
                                <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{avgAttemptsPerQuestion}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-base sm:text-lg text-gray-900 dark:text-white">
                        {user?.displayName} você acertou{" "}
                        <span className="font-semibold text-green-600 dark:text-green-400">{correctCount}</span>{" "}
                        de <span className="font-semibold">{questions.length}</span> perguntas
                        {" "}({percentage}%)!
                    </p>
                )}

                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Teste realizado em: {testDateTime}
                </p>
            </div>

            {/* Ranking */}
            {ranking.length > 0 && (
                <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-center gap-2">
                        <Trophy className="text-yellow-500 flex-shrink-0" size={20} />
                        <span>{isStudyMode ? '🏆 Ranking de Eficiência' : '🏆 Ranking'}</span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px]">
                            <thead>
                                <tr className="border-b dark:border-gray-600">
                                    <th className="text-left p-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Posição</th>
                                    <th className="text-left p-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Participante</th>
                                    {isStudyMode ? (
                                        <>
                                            <th className="text-center p-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Tentativas</th>
                                            <th className="text-center p-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Eficiência</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="text-center p-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Pontuação</th>
                                            <th className="text-center p-2 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">Acertos</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {ranking
                                    .sort((a, b) => {
                                        if (isStudyMode) {
                                            return a.totalAttempts - b.totalAttempts;
                                        }
                                        return b.score - a.score;
                                    })
                                    .map((entry, index) => (
                                        <tr
                                            key={entry.userId}
                                            className={`border-b dark:border-gray-600 ${entry.userId === user?.uid
                                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                                : ''
                                                }`}
                                        >
                                            <td className="p-2">
                                                <span className="text-base sm:text-lg">
                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                </span>
                                            </td>
                                            <td className="p-2 text-gray-900 dark:text-white text-xs sm:text-sm">
                                                {entry.userName || entry.displayName}
                                                {entry.userId === user?.uid && ' (Você)'}
                                            </td>
                                            {isStudyMode ? (
                                                <>
                                                    <td className="text-center p-2 text-gray-900 dark:text-white font-semibold text-xs sm:text-sm">
                                                        {entry.totalAttempts}
                                                    </td>
                                                    <td className="text-center p-2">
                                                        <span className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
                                                            {questions.length > 0
                                                                ? ((questions.length / entry.totalAttempts) * 100).toFixed(1)
                                                                : '0.0'}%
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="text-center p-2">
                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm">
                                                            {entry.score}%
                                                        </span>
                                                    </td>
                                                    <td className="text-center p-2 text-gray-900 dark:text-white text-xs sm:text-sm">
                                                        {entry.correctAnswers}/{questions.length}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Revisão das Respostas */}
            <div className="mt-6 space-y-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Revisão das Respostas
                </h3>
                {questions.map((q) => {
                    const userAnswer = userAnswers.find((ans) => ans.questionId === q.id);
                    return (
                        <div
                            key={q.id}
                            className="text-left bg-gray-100 dark:bg-gray-700 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-none transition-colors duration-200"
                        >
                            <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">{q.question}</p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Sua resposta: {userAnswer ? getAnswerText(q, userAnswer.selectedAnswer) : "Não respondida"}
                                {userAnswer?.isCorrect ? (
                                    <span className="text-green-600 dark:text-green-400"> (Correto)</span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400"> (Errado)</span>
                                )}
                                {isStudyMode && userAnswer && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                                        - {userAnswer.attempts || 1} tentativa(s)
                                    </span>
                                )}
                            </p>
                            {!userAnswer?.isCorrect && (
                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    Resposta correta: {getCorrectAnswerText(q)}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-2">
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg cursor-pointer text-white transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${isSharing
                        ? "bg-purple-400 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
                        }`}
                    aria-label="Compartilhar resultado como imagem"
                >
                    <Share2 size={16} />
                    {isSharing ? "Gerando..." : "Compartilhar Resultado"}
                </button>
                <button
                    onClick={onRestart}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 cursor-pointer bg-blue-600 rounded-lg text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors duration-200 text-sm sm:text-base"
                >
                    {isStudyMode ? 'Estudar Novamente' : 'Responder Novamente'}
                </button>
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 cursor-pointer bg-gray-500 rounded-lg text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200 text-sm sm:text-base"
                >
                    Voltar
                </button>
            </div>
        </div>
    );
};