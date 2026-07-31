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

export interface CollectionQuiz extends Quiz {
    collectionItemId: string;
    sectionId?: string | null;
    order: number;
}

export interface Question {
    id: string;
    type: "multiple-choice" | "true-false" | "fill-in-the-blank";
    question: string;
    options?: string[];
    correctAnswer?: number;
    blankAnswer?: string;

    optionFeedback?: (string | null)[];
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

export interface QuizCollection {
    id: string;
    name: string;
    description?: string;

    userId: string;
    createdAt: Timestamp | any;

    quizCount?: number;
    sectionCount?: number;
    isFavorite?: boolean;
    isOwner?: boolean;
    creator?: {
        name: string;
        photoURL?: string;
    };
}

export interface QuizCollectionItem {
    collectionId: string;
    name: string;
    description?: string;
    userId: string;
    createdAt?: Timestamp;
    quizIds?: string[];
}