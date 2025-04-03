import { useState, useEffect } from "react";
import { Question } from "../../hooks/useQuizData";

interface QuestionDisplayProps {
    question: Question;
    onAnswer: (answer: number | string) => void;
    showAnswersAfter: string;
    onNext: () => void;
}

export const QuestionDisplay = ({ question, onAnswer, showAnswersAfter, onNext }: QuestionDisplayProps) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    // Reinicia o estado quando a pergunta muda
    useEffect(() => {
        setSelectedAnswer(null);
        setIsAnswered(false);
    }, [question]);

    const handleOptionClick = (answer: number | string) => {
        if (isAnswered) return; // Impede múltiplas seleções
        setSelectedAnswer(answer);
        setIsAnswered(true);
        onAnswer(answer);

        if (showAnswersAfter === "immediately") {
            setTimeout(() => {
                setSelectedAnswer(null);
                setIsAnswered(false);
                onNext();
            }, 2000);
        }
    };

    const getButtonClass = (index: number | string) => {
        if (!isAnswered) {
            return "w-full p-3 cursor-pointer bg-gray-700 rounded-lg text-left hover:bg-gray-600";
        }

        if (showAnswersAfter !== "immediately") {
            return "w-full p-3 bg-gray-700 rounded-lg text-left opacity-50";
        }

        const isCorrect =
            question.type === "multiple-choice" || question.type === "true-false"
                ? Number(index) === question.correctAnswer
                : String(index).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();

        if (selectedAnswer === index && !isCorrect) {
            return "w-full p-3 bg-red-600 rounded-lg text-left";
        }
        if (isCorrect) {
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
                            disabled={isAnswered}
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
                        disabled={isAnswered}
                    >
                        Verdadeiro
                    </button>
                    <button
                        onClick={() => handleOptionClick(0)}
                        className={getButtonClass(0)}
                        disabled={isAnswered}
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
                        handleOptionClick(input.value);
                    }}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Digite sua resposta"
                        required
                        disabled={isAnswered}
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-600 rounded-lg hover:bg-blue-700"
                        disabled={isAnswered}
                    >
                        Enviar
                    </button>
                </form>
            )}
        </div>
    );
};