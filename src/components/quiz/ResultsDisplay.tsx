import { Question, Quiz } from "../../hooks/useQuizData";
import { UserAnswer } from "../../pages/PlayQuiz";

interface ResultsDisplayProps {
    quiz: Quiz;
    questions: Question[];
    userAnswers: UserAnswer[];
    onRestart: () => void;
    onBack: () => void;
}

export const ResultsDisplay = ({ quiz, questions, userAnswers, onRestart, onBack }: ResultsDisplayProps) => {
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

    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Resultado</h2>
            <p className="text-lg">
                Você acertou <span className="text-green-400">{userAnswers.filter((ans) => ans.isCorrect).length}</span> de{" "}
                {questions.length} perguntas!
            </p>
            {quiz.settings.showAnswersAfter === "end" && (
                <div className="mt-6 space-y-4">
                    <h3 className="text-xl font-semibold">Revisão das Respostas</h3>
                    {questions.map((q) => {
                        const userAnswer = userAnswers.find((ans) => ans.questionId === q.id);
                        return (
                            <div key={q.id} className="text-left bg-gray-700 p-4 rounded-lg">
                                <p className="font-medium">{q.question}</p>
                                <p className="text-gray-400">
                                    Sua resposta: {userAnswer ? getAnswerText(q, userAnswer.selectedAnswer) : "Não respondida"}
                                    {userAnswer?.isCorrect ? (
                                        <span className="text-green-400"> (Correto)</span>
                                    ) : (
                                        <span className="text-red-400"> (Errado)</span>
                                    )}
                                </p>
                                {!userAnswer?.isCorrect && (
                                    <p className="text-gray-300">Resposta correta: {getCorrectAnswerText(q)}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            {quiz.settings.allowMultipleAttempts && (
                <button onClick={onRestart} className="mt-6 px-6 py-3 mr-1 bg-blue-600 rounded-lg hover:bg-blue-700">
                    Jogar Novamente
                </button>
            )}
            <button onClick={onBack} className="mt-4 px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-700">
                Voltar
            </button>
        </div>
    );
};