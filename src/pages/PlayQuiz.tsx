// src/pages/PlayQuiz.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizData } from '../hooks/useQuizData';
import { useTimer } from '../hooks/useTimer';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { QuestionDisplay } from '../components/quiz/QuestionDisplay';
import { ResultsDisplay } from '../components/quiz/ResultsDisplay';
import { RankingDisplay } from '../components/quiz/RankingDisplay';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Question, UserAnswer } from '../types/quiz';

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

/**
 * Avança para a próxima pergunta ou finaliza o quiz, salvando a tentativa.
 * @param currentIndex Índice da pergunta atual
 * @param questionsLength Total de perguntas
 * @param userAnswers Respostas do usuário
 * @param saveAttempt Função para salvar a tentativa
 * @param setIndex Atualiza o índice da pergunta
 * @param setAttempt Atualiza as tentativas atuais
 * @param setShowResult Mostra o resultado final
 * @param isUntilCorrectMode Modo "até acertar"
 * @param resetTimer Reseta o temporizador
 */
const goToNextQuestion = (
    currentIndex: number,
    questionsLength: number,
    userAnswers: UserAnswer[],
    saveAttempt: (correctCount: number, total: number, answers: UserAnswer[]) => Promise<void>,
    setIndex: (index: number) => void,
    setAttempt: (attempt: (number | string)[]) => void,
    setShowResult: (show: boolean) => void,
    isUntilCorrectMode: boolean,
    resetTimer: () => void
) => {
    if (currentIndex + 1 < questionsLength) {
        setIndex(currentIndex + 1);
        setAttempt([]);
        if (!isUntilCorrectMode) resetTimer();
    } else {
        const correctCount = userAnswers.filter((ans) => ans.isCorrect).length;
        saveAttempt(correctCount, questionsLength, userAnswers).then(() => setShowResult(true));
    }
};

function PlayQuiz() {
    const { quiz, questions, allUserAttempts, ranking, loading, fetchRanking, saveAttempt } = useQuizData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [currentAttempt, setCurrentAttempt] = useState<(number | string)[]>([]);
    const navigate = useNavigate();

    const isUntilCorrectMode = quiz?.settings.showAnswersAfter === 'untilCorrect';

    const { timeLeft, pauseTimer, resetTimer } = useTimer({
        initialTime: quiz?.settings.timeLimitPerQuestion || DEFAULT_TIME_LIMIT,
        onTimeUp: () => {
            if (!isUntilCorrectMode) {
                const currentQuestion = questions[currentQuestionIndex];
                setUserAnswers((prev) => [
                    ...prev,
                    { questionId: currentQuestion.id, selectedAnswer: -1, isCorrect: false },
                ]);
                alert('Tempo esgotado!');
                goToNextQuestion(
                    currentQuestionIndex,
                    questions.length,
                    userAnswers,
                    saveAttempt,
                    setCurrentQuestionIndex,
                    setCurrentAttempt,
                    setShowResult,
                    isUntilCorrectMode,
                    resetTimer
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
        if (showResult) fetchRanking();
    }, [showResult, fetchRanking]);

    const handleAnswer = useCallback(
        (answer: number | string) => {
            if (!quiz) return;

            const currentQuestion = questions[currentQuestionIndex];
            const isCorrect = checkAnswer(currentQuestion, answer);

            if (isUntilCorrectMode) {
                setCurrentAttempt((prev) => [...prev, answer]);
                if (isCorrect) {
                    setUserAnswers((prev) => [
                        ...prev,
                        { questionId: currentQuestion.id, selectedAnswer: answer, isCorrect },
                    ]);
                }
            } else {
                if (quiz.settings.timeLimitPerQuestion) pauseTimer();
                const newAnswer: UserAnswer = { questionId: currentQuestion.id, selectedAnswer: answer, isCorrect };
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
                        resetTimer
                    );
                } else if (currentQuestionIndex + 1 === questions.length) {
                    const correctCount = [...userAnswers, newAnswer].filter((ans) => ans.isCorrect).length;
                    saveAttempt(correctCount, questions.length, [...userAnswers, newAnswer]).then(() =>
                        setShowResult(true)
                    );
                }
            }
        },
        [
            quiz,
            questions,
            currentQuestionIndex,
            isUntilCorrectMode,
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
                                resetTimer
                            )
                        }
                        currentAttempt={isUntilCorrectMode ? currentAttempt : undefined}
                    />
                </>
            ) : (
                <>
                    <ResultsDisplay
                        quiz={quiz}
                        questions={questions}
                        userAnswers={userAnswers}
                        onRestart={handleRestart}
                        onBack={() => navigate('/my-quizzes')}
                    />
                    {!isUntilCorrectMode && (
                        <RankingDisplay
                            ranking={ranking}
                            allUserAttempts={allUserAttempts}
                            questions={questions}
                        />
                    )}
                </>
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