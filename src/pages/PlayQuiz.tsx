import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizData } from '../hooks/useQuizData';
import { useTimer } from '../hooks/useTimer';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { QuestionDisplay } from '../components/quiz/QuestionDisplay';
import { ResultsDisplay } from '../components/quiz/ResultsDisplay';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Question, UserAnswer } from '../types/quiz';
import { toast } from 'sonner';

const DEFAULT_TIME_LIMIT = 0;

const checkAnswer = (question: Question, answer: number | string): boolean => {
    if (question.type === 'multiple-choice' || question.type === 'true-false') {
        return Number(answer) === question.correctAnswer;
    }
    if (question.type === 'fill-in-the-blank') {
        return String(answer).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
    }
    return false;
};

const goToNextQuestion = (
    currentIndex: number,
    questionsLength: number,
    userAnswers: UserAnswer[],
    saveAttempt: (correctCount: number, total: number, answers: UserAnswer[], totalAttempts?: number, mode?: 'challenge' | 'study') => Promise<void>,
    setIndex: (index: number) => void,
    setAttempt: (attempt: (number | string)[]) => void,
    setShowResult: (show: boolean) => void,
    isUntilCorrectMode: boolean,
    resetTimer: () => void,
    currentAttemptCount?: number
) => {
    if (currentIndex + 1 < questionsLength) {
        setIndex(currentIndex + 1);
        setAttempt([]);
        if (!isUntilCorrectMode) resetTimer();
    } else {
        if (!isUntilCorrectMode) {
            const correctCount = userAnswers.filter((ans) => ans.isCorrect).length;
            saveAttempt(correctCount, questionsLength, userAnswers, undefined, 'challenge').then(() => setShowResult(true));
        } else {
            // No modo untilCorrect, calcula o total de tentativas
            const totalAttempts = userAnswers.reduce((sum, answer) => sum + (answer.attempts || 0), 0) + (currentAttemptCount || 0);
            saveAttempt(questionsLength, questionsLength, userAnswers, totalAttempts, 'study').then(() => setShowResult(true));
        }
    }
};

function PlayQuiz() {
    const { quiz, questions, loading, fetchRanking, saveAttempt } = useQuizData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [currentAttempt, setCurrentAttempt] = useState<(number | string)[]>([]);
    const [questionAttemptCount, setQuestionAttemptCount] = useState<number>(0);
    const navigate = useNavigate();

    const isUntilCorrectMode = quiz?.settings.showAnswersAfter === 'untilCorrect';

    const { timeLeft, pauseTimer, resetTimer } = useTimer({
        initialTime: quiz?.settings.timeLimitPerQuestion || DEFAULT_TIME_LIMIT,
        onTimeUp: () => {
            if (!isUntilCorrectMode) {
                const currentQuestion = questions[currentQuestionIndex];
                setUserAnswers((prev) => [
                    ...prev,
                    { questionId: currentQuestion.id, selectedAnswer: -1, isCorrect: false, attempts: 1 },
                ]);
                toast.info('Tempo esgotado!');
                goToNextQuestion(
                    currentQuestionIndex,
                    questions.length,
                    userAnswers,
                    saveAttempt,
                    setCurrentQuestionIndex,
                    setCurrentAttempt,
                    setShowResult,
                    isUntilCorrectMode,
                    resetTimer,
                    0
                );
            }
        },
        isActive: !!quiz?.settings.timeLimitPerQuestion && !isUntilCorrectMode && !showResult,
    });

    useEffect(() => {
        if (quiz?.settings.timeLimitPerQuestion && !showResult && !isUntilCorrectMode) {
            resetTimer();
        }
    }, [quiz, showResult, currentQuestionIndex, resetTimer, isUntilCorrectMode]);

    useEffect(() => {
        if (showResult) {
            const mode = isUntilCorrectMode ? 'study' : 'challenge';
            fetchRanking(mode);
        }
    }, [showResult, fetchRanking, isUntilCorrectMode]);

    const handleAnswer = useCallback(
        (answer: number | string) => {
            if (!quiz) return;

            const currentQuestion = questions[currentQuestionIndex];
            const isCorrect = checkAnswer(currentQuestion, answer);

            if (isUntilCorrectMode) {
                setCurrentAttempt((prev) => [...prev, answer]);
                const newAttemptCount = questionAttemptCount + 1;
                setQuestionAttemptCount(newAttemptCount);

                if (isCorrect) {
                    setUserAnswers((prev) => [
                        ...prev,
                        {
                            questionId: currentQuestion.id,
                            selectedAnswer: answer,
                            isCorrect: true,
                            attempts: newAttemptCount
                        },
                    ]);
                    setQuestionAttemptCount(0);
                }
            } else {
                if (quiz.settings.timeLimitPerQuestion) pauseTimer();
                const newAnswer: UserAnswer = {
                    questionId: currentQuestion.id,
                    selectedAnswer: answer,
                    isCorrect,
                    attempts: 1
                };
                setUserAnswers((prev) => [...prev, newAnswer]);

                if (quiz.settings.showAnswersAfter === 'end') {
                    goToNextQuestion(
                        currentQuestionIndex,
                        questions.length,
                        [...userAnswers, newAnswer],
                        saveAttempt,
                        setCurrentQuestionIndex,
                        setCurrentAttempt,
                        setShowResult,
                        isUntilCorrectMode,
                        resetTimer,
                        0
                    );
                }
            }
        },
        [
            quiz,
            questions,
            currentQuestionIndex,
            isUntilCorrectMode,
            questionAttemptCount,
            userAnswers,
            pauseTimer,
            resetTimer,
            saveAttempt,
        ]
    );

    const handleRestart = useCallback(() => {
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setCurrentAttempt([]);
        setQuestionAttemptCount(0);
        setShowResult(false);
        if (!isUntilCorrectMode && quiz?.settings.timeLimitPerQuestion) resetTimer();
    }, [isUntilCorrectMode, quiz, resetTimer]);

    if (loading) return <Loading />;
    if (!quiz) return <ErrorMessage message="Quiz não encontrado." />;
    if (questions.length === 0) return <ErrorMessage message="Nenhuma pergunta disponível no quiz." />;

    const renderQuizContent = () => (
        <div className="max-w-2xl w-full">
            {!showResult ? (
                <>
                    <QuizHeader
                        quiz={quiz}
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        timeLeft={isUntilCorrectMode ? null : timeLeft}
                    />
                    <QuestionDisplay
                        question={questions[currentQuestionIndex]}
                        onAnswer={handleAnswer}
                        showAnswersAfter={quiz.settings.showAnswersAfter}
                        onNext={() =>
                            goToNextQuestion(
                                currentQuestionIndex,
                                questions.length,
                                userAnswers,
                                saveAttempt,
                                setCurrentQuestionIndex,
                                setCurrentAttempt,
                                setShowResult,
                                isUntilCorrectMode,
                                resetTimer,
                                questionAttemptCount
                            )
                        }
                        currentAttempt={isUntilCorrectMode ? currentAttempt : undefined}
                        isLastQuestion={currentQuestionIndex === questions.length - 1}
                    />
                </>
            ) : (
                <ResultsDisplay
                    quiz={quiz}
                    questions={questions}
                    userAnswers={userAnswers}
                    onRestart={handleRestart}
                    onBack={() => navigate(`/quiz/details/${quiz.id}`)}
                    mode={isUntilCorrectMode ? 'study' : 'challenge'}
                />
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-200">
            {renderQuizContent()}
        </div>
    );
}

export default PlayQuiz;