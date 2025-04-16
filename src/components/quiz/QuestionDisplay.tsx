import { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import clsx from 'clsx';
import { Question } from '../../types/quiz';

interface QuestionDisplayProps {
    question: Question;
    onAnswer: (answer: number | string) => void;
    showAnswersAfter: 'immediately' | 'end' | 'untilCorrect';
    onNext: () => void;
    currentAttempt?: (number | string)[];
}

interface OptionButtonProps {
    option: string | number;
    isSelected: boolean;
    isCorrect: boolean;
    isIncorrect: boolean;
    isSubmitted: boolean;
    showAnswersAfter: QuestionDisplayProps['showAnswersAfter'];
    onClick: (option: number | string) => void;
    disabled: boolean;
    label: string;
    icon?: React.ReactNode;
    isCorrectAnswer?: boolean;
}

const OptionButton: React.FC<OptionButtonProps> = ({
    option,
    isSelected,
    isCorrect,
    isIncorrect,
    isSubmitted,
    showAnswersAfter,
    onClick,
    disabled,
    label,
    icon,
    isCorrectAnswer,
}) => {
    const isUntilCorrect = showAnswersAfter === 'untilCorrect';
    const baseClass = 'flex items-center w-full p-3 rounded-lg text-left transition-colors duration-200';
    const className = clsx(baseClass, {
        // Estilo para resposta correta
        'text-green-700 bg-green-100 border border-green-300 dark:text-green-400 dark:bg-green-900/50 dark:border-green-700/50':
            (isUntilCorrect && isCorrect) ||
            (showAnswersAfter === 'immediately' && isSubmitted && isCorrectAnswer),
        // Estilo para resposta incorreta selecionada
        'text-red-700 bg-red-100 border border-red-300 dark:text-red-400 dark:bg-red-900/50 dark:border-red-700/50':
            (isUntilCorrect && isIncorrect) ||
            (showAnswersAfter === 'immediately' && isSubmitted && isSelected && !isCorrectAnswer),
        // Estilo para resposta selecionada (antes de submeter)
        'text-blue-700 bg-blue-100 border border-blue-300 dark:text-blue-400 dark:bg-blue-900/50 dark:border-blue-700/50':
            isSelected && !isSubmitted,
        // Estilo para opções não selecionadas e interativas
        'cursor-pointer bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white':
            !isSubmitted && !isSelected && !isCorrect && !isIncorrect,
        // Estilo para opções desabilitadas no modo untilCorrect após acertar
        'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700 dark:text-white':
            isUntilCorrect && isCorrect && !isCorrectAnswer,
        // Estilo para opções não selecionadas no modo immediately após submissão
        'opacity-70 bg-gray-100 dark:bg-gray-700 dark:text-white':
            showAnswersAfter === 'immediately' && isSubmitted && !isSelected && !isCorrectAnswer,
        // Estilo para opções desabilitadas no modo end após submissão
        'opacity-50 bg-gray-100 dark:bg-gray-700 dark:text-white':
            showAnswersAfter === 'end' && isSubmitted && !isCorrectAnswer,
    });

    return (
        <button
            className={className}
            onClick={() => onClick(option)}
            disabled={disabled || (isUntilCorrect && isCorrect && !isCorrectAnswer)}
            aria-label={`Opção ${label}`}
            aria-disabled={disabled || (isUntilCorrect && isCorrect && !isCorrectAnswer)}
        >
            <span
                className={clsx(
                    'flex items-center justify-center w-8 h-8 mr-3 rounded-full transition-colors duration-200',
                    isUntilCorrect
                        ? isCorrect && isCorrectAnswer
                            ? 'bg-green-600 text-white dark:bg-green-500'
                            : isIncorrect
                                ? 'bg-red-600 text-white dark:bg-red-500'
                                : isCorrect && !isCorrectAnswer
                                    ? 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
                                    : isSelected && !isSubmitted
                                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                                        : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white'
                        : showAnswersAfter === 'immediately' && isSubmitted
                            ? isCorrectAnswer
                                ? 'bg-green-600 text-white dark:bg-green-500'
                                : isSelected && !isCorrectAnswer
                                    ? 'bg-red-600 text-white dark:bg-red-500'
                                    : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white opacity-70'
                            : isSelected && !isSubmitted
                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white'
                )}
            >
                {icon || label}
            </span>
            {option}
        </button>
    );
};

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    onAnswer,
    showAnswersAfter,
    onNext,
    currentAttempt,
}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [lastIncorrect, setLastIncorrect] = useState<number | string | null>(null);
    const [inputValue, setInputValue] = useState<string>('');

    const isUntilCorrect = showAnswersAfter === 'untilCorrect';
    const latestAttempt = currentAttempt && currentAttempt.length > 0 ? currentAttempt[currentAttempt.length - 1] : null;
    const isCorrect =
        latestAttempt !== null &&
        (question.type === 'multiple-choice' || question.type === 'true-false'
            ? Number(latestAttempt) === question.correctAnswer
            : String(latestAttempt).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase());

    useEffect(() => {
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setLastIncorrect(null);
        setInputValue('');
    }, [question]);

    const handleOptionClick = (answer: number | string) => {
        if (isUntilCorrect && isCorrect) return;
        if (!isUntilCorrect && isSubmitted) return;

        setSelectedAnswer(answer);
        setLastIncorrect(null);

        if (!isUntilCorrect) {
            setIsSubmitted(true);
            onAnswer(answer);
            if (showAnswersAfter === 'immediately') {
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
                question.type === 'multiple-choice' || question.type === 'true-false'
                    ? Number(selectedAnswer) === question.correctAnswer
                    : String(selectedAnswer).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
            if (!isAnswerCorrect) {
                setLastIncorrect(selectedAnswer);
            }
            setSelectedAnswer(null);
            setIsSubmitted(false);
        }
    };

    const handleInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        if (isUntilCorrect) {
            setIsSubmitted(true);
            onAnswer(inputValue);
            const isAnswerCorrect =
                String(inputValue).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
            if (!isAnswerCorrect) {
                setLastIncorrect(inputValue);
            }
            setInputValue('');
            setIsSubmitted(false);
        } else {
            handleOptionClick(inputValue);
        }
    };

    const getOptionLetter = (index: number): string => {
        return String.fromCharCode(65 + index); // 65 é o código ASCII para 'A'
    };

    const renderOptions = () => {
        if (question.type === 'multiple-choice') {
            return question.options?.map((option, index) => (
                <OptionButton
                    key={index}
                    option={option}
                    isSelected={selectedAnswer === index}
                    isCorrect={isCorrect && latestAttempt === index}
                    isIncorrect={lastIncorrect === index}
                    isSubmitted={isSubmitted}
                    showAnswersAfter={showAnswersAfter}
                    onClick={() => handleOptionClick(index)}
                    disabled={isUntilCorrect && isCorrect}
                    label={getOptionLetter(index)}
                    icon={
                        isUntilCorrect
                            ? isCorrect && latestAttempt === index
                                ? <FaCheck />
                                : lastIncorrect === index
                                    ? <FaTimes />
                                    : undefined
                            : showAnswersAfter === 'immediately' && isSubmitted
                                ? Number(index) === question.correctAnswer
                                    ? <FaCheck />
                                    : selectedAnswer === index && Number(index) !== question.correctAnswer
                                        ? <FaTimes />
                                        : undefined
                                : undefined
                    }
                    isCorrectAnswer={Number(index) === question.correctAnswer}
                />
            ));
        }

        if (question.type === 'true-false') {
            return [1, 0].map((value) => (
                <OptionButton
                    key={value}
                    option={value === 1 ? 'Verdadeiro' : 'Falso'}
                    isSelected={selectedAnswer === value}
                    isCorrect={isCorrect && latestAttempt === value}
                    isIncorrect={lastIncorrect === value}
                    isSubmitted={isSubmitted}
                    showAnswersAfter={showAnswersAfter}
                    onClick={() => handleOptionClick(value)}
                    disabled={isUntilCorrect && isCorrect}
                    label={value === 1 ? 'V' : 'F'}
                    icon={
                        isUntilCorrect
                            ? isCorrect && latestAttempt === value
                                ? <FaCheck />
                                : lastIncorrect === value
                                    ? <FaTimes />
                                    : undefined
                            : showAnswersAfter === 'immediately' && isSubmitted
                                ? Number(value) === question.correctAnswer
                                    ? <FaCheck />
                                    : selectedAnswer === value && Number(value) !== question.correctAnswer
                                        ? <FaTimes />
                                        : undefined
                                : undefined
                    }
                    isCorrectAnswer={Number(value) === question.correctAnswer}
                />
            ));
        }

        return null;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md dark:shadow-lg transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{question.question}</h2>
            {(question.type === 'multiple-choice' || question.type === 'true-false') && (
                <div className="space-y-2">{renderOptions()}</div>
            )}
            {question.type === 'fill-in-the-blank' && (
                <form onSubmit={handleInputSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={clsx(
                            'w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-600 focus:outline-none transition-colors duration-200',
                            {
                                'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700/50':
                                    isUntilCorrect && isCorrect,
                                'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700/50':
                                    isUntilCorrect && lastIncorrect !== null && !isCorrect,
                                'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700/50':
                                    inputValue && !isSubmitted && !isCorrect,
                            }
                        )}
                        placeholder="Digite sua resposta"
                        required
                        disabled={isUntilCorrect && isCorrect}
                        aria-label="Resposta para a pergunta"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                        disabled={isUntilCorrect && (isCorrect || !inputValue.trim())}
                        aria-label="Enviar resposta"
                    >
                        Responder
                    </button>
                </form>
            )}
            {isUntilCorrect && question.type !== 'fill-in-the-blank' && !isCorrect && selectedAnswer !== null && (
                <button
                    onClick={handleSubmit}
                    className="mt-4 w-full p-3 cursor-pointer bg-blue-600 rounded-lg hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
                    aria-label="Enviar resposta"
                >
                    Responder
                </button>
            )}
            {isUntilCorrect && isCorrect && (
                <button
                    onClick={onNext}
                    className="mt-4 w-full p-3 cursor-pointer bg-green-600 rounded-lg hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
                    aria-label="Avançar para a próxima pergunta"
                >
                    Avançar
                </button>
            )}
        </div>
    );
};