import { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Question } from "../../types/quiz";

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
                return "w-full p-3 rounded-lg text-left text-green-700 bg-green-100 border border-green-300 dark:text-green-400 dark:bg-green-900/50 dark:border-green-700/50 transition-colors duration-200";
            }
            if (lastIncorrect === index) {
                return "w-full p-3 rounded-lg text-left text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-900/50 dark:border-red-700/50 transition-colors duration-200";
            }
            if (selectedAnswer === index && !isSubmitted) {
                return "w-full p-3 rounded-lg text-left text-blue-700 bg-blue-100 border border-blue-300 dark:text-blue-400 dark:bg-blue-900/50 dark:border-blue-700/50 transition-colors duration-200";
            }
            return "w-full p-3 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-colors duration-200";
        }

        if (!isSubmitted) {
            if (selectedAnswer === index) {
                return "w-full p-3 rounded-lg text-left text-blue-700 bg-blue-100 border border-blue-300 dark:text-blue-400 dark:bg-blue-900/50 dark:border-blue-700/50 transition-colors duration-200";
            }
            return "w-full p-3 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg text-left text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition-colors duration-200";
        }

        if (showAnswersAfter === "immediately") {
            const isCorrectOption =
                question.type === "multiple-choice" || question.type === "true-false"
                    ? Number(index) === question.correctAnswer
                    : String(index).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();

            if (selectedAnswer === index && !isCorrectOption) {
                return "w-full p-3 rounded-lg text-left text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-900/50 dark:border-red-700/50 transition-colors duration-200";
            }
            if (isCorrectOption) {
                return "w-full p-3 rounded-lg text-left text-green-700 bg-green-100 border border-green-300 dark:text-green-400 dark:bg-green-900/50 dark:border-green-700/50 transition-colors duration-200";
            }
        }

        return "w-full p-3 bg-gray-100 rounded-lg text-left text-gray-900 opacity-50 dark:bg-gray-700 dark:text-white dark:opacity-50 transition-colors duration-200";
    };

    const getOptionLetter = (index: number): string => {
        return String.fromCharCode(65 + index); // 65 é o código ASCII para 'A'
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-none shadow-md dark:shadow-lg transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{question.question}</h2>
            {question.type === "multiple-choice" && (
                <div className="space-y-2">
                    {question.options?.map((option: string, index: number) => {
                        const isCorrectOption =
                            question.type === "multiple-choice" || question.type === "true-false"
                                ? Number(index) === question.correctAnswer
                                : String(index).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
                        const isSelected = selectedAnswer === index;

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                className={`flex items-center ${getButtonClass(index)}`}
                                disabled={isUntilCorrect && isCorrect}
                            >
                                <span
                                    className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full transition-colors duration-200 ${isUntilCorrect
                                        ? isCorrect && latestAttempt === index
                                            ? "bg-green-600 text-white dark:bg-green-500"
                                            : lastIncorrect === index
                                                ? "bg-red-600 text-white dark:bg-red-500"
                                                : isSelected && !isSubmitted
                                                    ? "bg-blue-600 text-white dark:bg-blue-500"
                                                    : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                                        : showAnswersAfter === "immediately" && isSubmitted
                                            ? isCorrectOption
                                                ? "bg-green-600 text-white dark:bg-green-500"
                                                : isSelected && !isCorrectOption
                                                    ? "bg-red-600 text-white dark:bg-red-500"
                                                    : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                                            : isSelected && !isSubmitted
                                                ? "bg-blue-600 text-white dark:bg-blue-500"
                                                : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                                        }`}
                                >
                                    {isUntilCorrect
                                        ? isCorrect && latestAttempt === index
                                            ? <FaCheck />
                                            : lastIncorrect === index
                                                ? <FaTimes />
                                                : getOptionLetter(index)
                                        : showAnswersAfter === "immediately" && isSubmitted
                                            ? isCorrectOption
                                                ? <FaCheck />
                                                : isSelected && !isCorrectOption
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
                    {[1, 0].map((value) => {
                        const isCorrectOption = Number(value) === question.correctAnswer;
                        const isSelected = selectedAnswer === value;

                        return (
                            <button
                                key={value}
                                onClick={() => handleOptionClick(value)}
                                className={getButtonClass(value)}
                                disabled={isUntilCorrect && isCorrect}
                            >
                                <span
                                    className={`flex items-center justify-center w-8 h-8 mr-3 rounded-full transition-colors duration-200 ${isUntilCorrect
                                        ? isCorrect && latestAttempt === value
                                            ? "bg-green-600 text-white dark:bg-green-500"
                                            : lastIncorrect === value
                                                ? "bg-red-600 text-white dark:bg-red-500"
                                                : isSelected && !isSubmitted
                                                    ? "bg-blue-600 text-white dark:bg-blue-500"
                                                    : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                                        : showAnswersAfter === "immediately" && isSubmitted
                                            ? isCorrectOption
                                                ? "bg-green-600 text-white dark:bg-green-500"
                                                : isSelected && !isCorrectOption
                                                    ? "bg-red-600 text-white dark:bg-red-500"
                                                    : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                                            : isSelected && !isSubmitted
                                                ? "bg-blue-600 text-white dark:bg-blue-500"
                                                : "bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white"
                                        }`}
                                >
                                    {isUntilCorrect
                                        ? isCorrect && latestAttempt === value
                                            ? <FaCheck />
                                            : lastIncorrect === value
                                                ? <FaTimes />
                                                : value === 1
                                                    ? "V"
                                                    : "F"
                                        : showAnswersAfter === "immediately" && isSubmitted
                                            ? isCorrectOption
                                                ? <FaCheck />
                                                : isSelected && !isCorrectOption
                                                    ? <FaTimes />
                                                    : value === 1
                                                        ? "V"
                                                        : "F"
                                            : value === 1
                                                ? "V"
                                                : "F"}
                                </span>
                                {value === 1 ? "Verdadeiro" : "Falso"}
                            </button>
                        );
                    })}
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
                        className={`w-full p-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-300 focus:border-blue-600 focus:outline-none transition-colors duration-200 ${isUntilCorrect
                            ? isCorrect
                                ? "bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700/50"
                                : lastIncorrect !== null && !selectedAnswer
                                    ? "bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700/50"
                                    : selectedAnswer && !isSubmitted
                                        ? "bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700/50"
                                        : ""
                            : selectedAnswer && !isSubmitted
                                ? "bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700/50"
                                : ""
                            }`}
                        placeholder="Digite sua resposta"
                        required
                        disabled={isUntilCorrect && isCorrect}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                        disabled={isUntilCorrect && (isCorrect || selectedAnswer === null)}
                    >
                        Responder
                    </button>
                </form>
            )}
            {isUntilCorrect && question.type !== "fill-in-the-blank" && !isCorrect && selectedAnswer !== null && (
                <button
                    onClick={handleSubmit}
                    className="mt-4 w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                >
                    Responder
                </button>
            )}
            {isUntilCorrect && isCorrect && (
                <button
                    onClick={onNext}
                    className="mt-4 w-full p-3 cursor-pointer bg-green-600 rounded-lg hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
                >
                    Avançar
                </button>
            )}
        </div>
    );
};