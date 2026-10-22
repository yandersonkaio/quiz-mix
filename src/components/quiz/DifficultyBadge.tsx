
import type { Quiz } from '@/types/quiz'
import { getDifficultyConfig } from '@/utils/quis'
import { useTheme } from '@/contexts/ThemeContext'

interface DifficultyBadgeProps {
    difficulty: Quiz['difficulty']
    className?: string
}

export function DifficultyBadge({
    difficulty,
    className = '',
}: DifficultyBadgeProps) {
    const { theme } = useTheme()
    const difficultyConfig = getDifficultyConfig(difficulty)

    const isLightTheme = theme === 'light' || theme === 'pink'

    const difficultyColors =
        difficulty === 'easy'
            ? 'border-answer-correct-foreground/20 bg-answer-correct/30 text-answer-correct-foreground'
            : difficulty === 'medium'
                ? isLightTheme
                    ? 'border-amber-600/30 bg-amber-500/10 text-amber-700'
                    : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                : difficulty === 'hard'
                    ? 'border-answer-incorrect-foreground/20 bg-answer-incorrect/30 text-answer-incorrect-foreground'
                    : 'border-border bg-muted text-muted-foreground'

    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${difficultyColors} ${className}`}
        >
            {difficultyConfig.icon}
            {difficultyConfig.label}
        </span>
    )
}
