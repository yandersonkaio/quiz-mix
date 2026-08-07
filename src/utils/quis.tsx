import { GoDotFill } from "react-icons/go";
import { QuizDifficulty } from "@/types/quiz";
import { JSX } from "react";

interface DifficultyConfig {
    label: string;
    icon: JSX.Element | null;
    colors: string;
}

export const getDifficultyConfig = (difficulty?: QuizDifficulty | null): DifficultyConfig => {
    const configs: Record<string, DifficultyConfig> = {
        easy: {
            label: "Fácil",
            icon: <GoDotFill className="w-3.5 h-3.5 text-green-500" />,
            colors: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
        },
        medium: {
            label: "Médio",
            icon: <GoDotFill className="w-3.5 h-3.5 text-yellow-500" />,
            colors: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
        },
        hard: {
            label: "Difícil",
            icon: <GoDotFill className="w-3.5 h-3.5 text-red-500" />,
            colors: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
        }
    };

    return difficulty ? configs[difficulty] : {
        label: "Sem classificação",
        icon: <GoDotFill className="w-3.5 h-3.5 text-gray-400" />,
        colors: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    };
};