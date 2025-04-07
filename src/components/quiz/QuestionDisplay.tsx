import { useState, useEffect } from "react";
import { Question } from "../../hooks/useQuizData";

interface QuestionDisplayProps {
    question: Question;
    onAnswer: (answer: number | string) => void;
    showAnswersAfter: "immediately" | "end" | "untilCorrect";
    onNext: () => void;
    currentAttempt?: (number | string)[];
}

export const QuestionDisplay = ({ question, onAnswer, showAnswersAfter, onNext, currentAttempt }: QuestionDisplayProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [lastIncorrect, setLastIncorrect] = useState<number | string | null>(null);

    const isUntilCorrect = showAnswersAfter === "untilCorrect";
    const latestAttempt = currentAttempt && currentAttempt.length > 0 ? currentAttempt[currentAttempt.length - 1] : null;
    const isCorrect =
        latestAttempt !== null &&
        (question.type === "multiple-choice" || question.type === "true-false"
            ? Number(latestAttempt) === question.correctAnswer
            : String(latestAttempt).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase());

    useEffect(() => {
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setLastIncorrect(null);
    }, [question]);

    const handleOptionClick = (answer: number | string) => {
        if (isUntilCorrect && isCorrect) return; // Impede novas seleções após acertar no modo "untilCorrect"
        if (!isUntilCorrect && isSubmitted) return; // Impede múltiplas seleções nos outros modos

        setSelectedAnswer(answer);
        setLastIncorrect(null);
        if (!isUntilCorrect) {
            setIsSubmitted(true);
            onAnswer(answer);
            if (showAnswersAfter === "immediately") {
                setTimeout(() => {
                    setSelectedAnswer(null);
                    setIsSubmitted(false);
                    onNext();
                }, 2000);
            }
        }
    };

    const handleSubmit = () => {
        if (isUntilCorrect && selectedAnswer !== null && !isCorrect) {
            setIsSubmitted(true);
            onAnswer(selectedAnswer);
            const isAnswerCorrect =
                question.type === "multiple-choice" || question.type === "true-false"
                    ? Number(selectedAnswer) === question.correctAnswer
                    : String(selectedAnswer).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
            if (!isAnswerCorrect) {
                setLastIncorrect(selectedAnswer);
            }
            setSelectedAnswer(null);
            setIsSubmitted(false);
        }
    };

    const getButtonClass = (index: number | string) => {
        if (isUntilCorrect) {
            if (isCorrect && latestAttempt === index) {
                return "w-full p-3 rounded-lg text-left bg-green-600";
            }
            if (lastIncorrect === index) {
                return "w-full p-3 rounded-lg text-left bg-red-600";
            }
            if (selectedAnswer === index) {
                return "w-full p-3 bg-blue-500 rounded-lg text-left";
            }
            return "w-full p-3 cursor-pointer bg-gray-700 rounded-lg text-left hover:bg-gray-600";
        }

        if (!isSubmitted) {
            if (selectedAnswer === index) {
                return "w-full p-3 bg-blue-500 rounded-lg text-left";
            }
            return "w-full p-3 cursor-pointer bg-gray-700 rounded-lg text-left hover:bg-gray-600";
        }

        if (showAnswersAfter !== "immediately") {
            return "w-full p-3 bg-gray-700 rounded-lg text-left opacity-50";
        }

        const isCorrectOption =
            question.type === "multiple-choice" || question.type === "true-false"
                ? Number(index) === question.correctAnswer
                : String(index).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();

        if (selectedAnswer === index && !isCorrectOption) {
            return "w-full p-3 bg-red-600 rounded-lg text-left";
        }
        if (isCorrectOption) {
            return "w-full p-3 bg-green-600 rounded-lg text-left";
        }
        return "w-full p-3 bg-gray-700 rounded-lg text-left opacity-50";
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
            {question.type === "multiple-choice" && (
                <div className="space-y-2">
                    {question.options?.map((option: string, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleOptionClick(index)}
                            className={getButtonClass(index)}
                            disabled={isUntilCorrect && isCorrect}
                        >
                            {String.fromCharCode(65 + index)}. {option}
                        </button>
                    ))}
                </div>
            )}
            {question.type === "true-false" && (
                <div className="space-y-2">
                    <button
                        onClick={() => handleOptionClick(1)}
                        className={getButtonClass(1)}
                        disabled={isUntilCorrect && isCorrect}
                    >
                        Verdadeiro
                    </button>
                    <button
                        onClick={() => handleOptionClick(0)}
                        className={getButtonClass(0)}
                        disabled={isUntilCorrect && isCorrect}
                    >
                        Falso
                    </button>
                </div>
            )}
            {question.type === "fill-in-the-blank" && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.target as HTMLFormElement).elements[0] as HTMLInputElement;
                        if (isUntilCorrect) {
                            setIsSubmitted(true);
                            onAnswer(input.value);
                            const isAnswerCorrect =
                                String(input.value).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
                            if (!isAnswerCorrect) {
                                setLastIncorrect(input.value);
                            }
                            setSelectedAnswer(null);
                            setIsSubmitted(false);
                        } else {
                            handleOptionClick(input.value);
                        }
                    }}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        className={`w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none ${isUntilCorrect
                            ? isCorrect
                                ? "bg-green-600"
                                : lastIncorrect !== null && !selectedAnswer
                                    ? "bg-red-600"
                                    : selectedAnswer && !isSubmitted
                                        ? "bg-blue-500"
                                        : ""
                            : selectedAnswer && !isSubmitted
                                ? "bg-blue-500"
                                : ""
                            }`}
                        placeholder="Digite sua resposta"
                        required
                        disabled={isUntilCorrect && isCorrect}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700"
                        disabled={isUntilCorrect && (isCorrect || selectedAnswer === null)}
                    >
                        Responder
                    </button>
                </form>
            )}
            {isUntilCorrect && question.type !== "fill-in-the-blank" && !isCorrect && selectedAnswer !== null && (
                <button
                    onClick={handleSubmit}
                    className="mt-4 w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    Responder
                </button>
            )}
            {isUntilCorrect && isCorrect && (
                <button
                    onClick={onNext}
                    className="mt-4 w-full p-3 cursor-pointer bg-green-600 rounded-lg hover:bg-green-700"
                >
                    Avançar
                </button>
            )}
            {!isUntilCorrect && isSubmitted && showAnswersAfter !== "immediately" && (
                <button
                    onClick={onNext}
                    className="mt-4 w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    Próxima Questão
                </button>
            )}
        </div>
    );
};