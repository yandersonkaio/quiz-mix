
import { GoDotFill } from 'react-icons/go'
import type { QuizDifficulty } from '@/types/quiz'
import type { JSX } from 'react'

interface DifficultyConfig {
    label: string
    icon: JSX.Element
}

const configs: Record<QuizDifficulty, DifficultyConfig> = {
    easy: {
        label: 'Fácil',
        icon: <GoDotFill className="size-3.5 text-green-500" />,
    },
    medium: {
        label: 'Médio',
        icon: <GoDotFill className="size-3.5 text-amber-500" />,
    },
    hard: {
        label: 'Difícil',
        icon: <GoDotFill className="size-3.5 text-red-500" />,
    },
}

export const getDifficultyConfig = (
    difficulty?: QuizDifficulty | null
): DifficultyConfig => {
    return difficulty
        ? configs[difficulty]
        : {
            label: 'Sem classificação',
            icon: <GoDotFill className="size-3.5 text-gray-400" />,
        }
}
