import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizData, Question } from "../hooks/useQuizData";
import { QuizHeader } from "../components/quiz/QuizHeader";
import { QuestionDisplay } from "../components/quiz/QuestionDisplay";
import { ResultsDisplay } from "../components/quiz/ResultsDisplay";
import { RankingDisplay } from "../components/quiz/RankingDisplay";
import Loading from "../components/Loading";
import { useTimer } from "../hooks/useTimer";

export interface UserAnswer {
    questionId: string;
    selectedAnswer: number | string;
    isCorrect: boolean;
}

function PlayQuiz() {
    const { quiz, questions, allUserAttempts, canPlay, ranking, loading, fetchRanking, saveAttempt } = useQuizData();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [showResult, setShowResult] = useState(false);
    const navigate = useNavigate();

    const { timeLeft, resetTimer } = useTimer({
        initialTime: quiz?.settings.timeLimitPerQuestion || 0,
        onTimeUp: () => {
            const currentQuestion = questions[currentQuestionIndex];
            setUserAnswers([...userAnswers, { questionId: currentQuestion.id, selectedAnswer: -1, isCorrect: false }]);
            alert("Tempo esgotado!");
            goToNextQuestion();
        },
        isActive: !!quiz?.settings.timeLimitPerQuestion && !showResult && (canPlay ?? false),
    });

    useEffect(() => {
        if (quiz?.settings.timeLimitPerQuestion && canPlay && !showResult) {
            resetTimer();
        }
    }, [quiz, canPlay, showResult, currentQuestionIndex, resetTimer]);

    useEffect(() => {
        if (showResult) fetchRanking();
    }, [showResult, fetchRanking]);

    const checkAnswer = (question: Question, answer: number | string): boolean => {
        if (question.type === "multiple-choice" || question.type === "true-false") {
            return Number(answer) === question.correctAnswer;
        } else if (question.type === "fill-in-the-blank") {
            return String(answer).trim().toLowerCase() === question.blankAnswer?.trim().toLowerCase();
        }
        return false;
    };

    const handleAnswer = (answer: number | string) => {
        if (!quiz || !canPlay) return;
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = checkAnswer(currentQuestion, answer);
        const newAnswer: UserAnswer = { questionId: currentQuestion.id, selectedAnswer: answer, isCorrect };
        const updatedAnswers = [...userAnswers, newAnswer];
        setUserAnswers(updatedAnswers);

        if (quiz.settings.showAnswersAfter !== "immediately") {
            goToNextQuestion();
        }

        if (currentQuestionIndex + 1 === questions.length) {
            const correctCount = updatedAnswers.filter((ans) => ans.isCorrect).length;
            saveAttempt(correctCount).then(() => setShowResult(true));
        }
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            resetTimer();
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        if (!canPlay) return;
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setShowResult(false);
        resetTimer();
    };

    if (loading) return <Loading />;
    if (!quiz) return <div className="text-white text-center mt-10">Quiz não encontrado.</div>;
    if (questions.length === 0) return <div className="min-h-screen bg-gray-900 p-6 text-white flex items-center justify-center">...</div>;
    if (canPlay === false) return <div className="min-h-screen bg-gray-900 p-6 text-white flex items-center justify-center">...</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-6 text-white flex items-center justify-center">
            <div className="max-w-2xl w-full">
                {!showResult ? (
                    <>
                        <QuizHeader
                            quiz={quiz}
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={questions.length}
                            timeLeft={timeLeft}
                        />
                        <QuestionDisplay
                            question={questions[currentQuestionIndex]}
                            onAnswer={handleAnswer}
                            showAnswersAfter={quiz.settings.showAnswersAfter}
                            onNext={goToNextQuestion}
                        />
                    </>
                ) : (
                    <>
                        <ResultsDisplay
                            quiz={quiz}
                            questions={questions}
                            userAnswers={userAnswers}
                            onRestart={handleRestart}
                            onBack={() => navigate("/my-quizzes")}
                        />
                        <RankingDisplay ranking={ranking} allUserAttempts={allUserAttempts} totalQuestions={questions.length} />
                    </>
                )}
            </div>
        </div>
    );
}

export default PlayQuiz;