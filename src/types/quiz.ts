import { Timestamp } from "firebase/firestore";

export interface QuizUser {
    id: string;
    name: string;
    photoUrl?: string;
}

export interface Quiz {
    id: string;
    name: string;
    userId: string;
    createdAt: Timestamp | any;
    description?: string;
    questionCount?: number;
    creator?: QuizUser;
    settings: {
        timeLimitPerQuestion?: number;
        showAnswersAfter: "immediately" | "end" | "untilCorrect";
    };
}

export interface Question {
    id: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank";
    question: string;
    options?: string[];
    correctAnswer?: number;
    blankAnswer?: string;
}

export interface Attempt {
    id: string;
    userId: string;
    quizId: string;
    completedAt: any;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    displayName: string;
    photoURL?: string;
    answers: UserAnswer[];
}

export interface UserAnswer {
    questionId: string;
    selectedAnswer: number | string;
    isCorrect: boolean;
}