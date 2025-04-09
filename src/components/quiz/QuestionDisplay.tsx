import { useState, useEffect } from "react";
import { Question } from "../../hooks/useQuizData";
import { FaCheck, FaTimes } from "react-icons/fa";

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
        if (isUntilCorrect && isCorrect) return;
        if (!isUntilCorrect && isSubmitted) return;

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
                return "w-full p-3 rounded-lg text-left text-green-400 bg-green-900/50 border border-green-700/50";
            }
            if (lastIncorrect === index) {
                return "w-full p-3 rounded-lg text-left text-red-400 bg-red-900/50 border border-red-700/50";
            }
            if (selectedAnswer === index && !isSubmitted) {
                return "w-full p-3 text-white bg-blue-900/50 border border-blue-700/50 rounded-lg text-left";
            }
            return "w-full p-3 cursor-pointer bg-gray-700 rounded-lg text-left hover:bg-gray-600";
        }

        if (!isSubmitted) {
            if (selectedAnswer === index) {
                return "w-full p-3 text-white bg-blue-900/50 border border-blue-700/50 rounded-lg text-left";
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
            return "w-full p-3 text-red-400 bg-red-900/50 border border-red-700/50 rounded-lg text-left";
        }
        if (isCorrectOption) {
            return "w-full p-3 text-green-400 bg-green-900/50 border border-green-700/50 rounded-lg text-left";
        }
        return "w-full p-3 bg-gray-700 rounded-lg text-left opacity-50";
    };

    const getOptionLetter = (index: number): string => {
        return String.fromCharCode(65 + index); // 65 é o código ASCII para 'A'
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{question.question}</h2>
            {question.type === "multiple-choice" && (
                <div className="space-y-2">
                    {question.options?.map((option: string, index: number) => {
                        const isOptionCorrect = Number(index) === question.correctAnswer;
                        const isOptionSelected = selectedAnswer === index;
                        const isOptionLastIncorrect = lastIncorrect === index;

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                className={`flex items-center ${getButtonClass(index)}`}
                                disabled={isUntilCorrect && isCorrect}
                            >
                                <span
                                    className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full ${isUntilCorrect
                                        ? isCorrect && isOptionCorrect
                                            ? "bg-green-500 text-white "
                                            : isOptionLastIncorrect
                                                ? "bg-red-500 text-white "
                                                : isOptionSelected && !isSubmitted
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-600 text-white"
                                        : isSubmitted
                                            ? isOptionCorrect
                                                ? "bg-green-500 text-white"
                                                : isOptionSelected && !isOptionCorrect
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-600 text-white"
                                            : isOptionSelected
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-600 text-white"
                                        }`}
                                >
                                    {isUntilCorrect
                                        ? isCorrect && isOptionCorrect
                                            ? <FaCheck />
                                            : isOptionLastIncorrect
                                                ? <FaTimes />
                                                : getOptionLetter(index)
                                        : isSubmitted
                                            ? isOptionCorrect
                                                ? <FaCheck />
                                                : isOptionSelected && !isOptionCorrect
                                                    ? <FaTimes />
                                                    : getOptionLetter(index)
                                            : getOptionLetter(index)}
                                </span>
                                <span className="flex-1">{option}</span>
                            </button>
                        );
                    })}
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
                                ? "bg-green-900/50 border border-green-700/50"
                                : lastIncorrect !== null && !selectedAnswer
                                    ? "bg-red-900/50 border border-red-700/50"
                                    : selectedAnswer && !isSubmitted
                                        ? "bg-blue-900/50 border border-blue-700/50"
                                        : ""
                            : selectedAnswer && !isSubmitted
                                ? "bg-blue-900/50 border border-blue-700/50"
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