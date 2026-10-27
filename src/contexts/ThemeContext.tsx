
import { createContext, useContext } from 'react'

export type Theme = 'light' | 'dark' | 'blue' | 'mocha' | 'forest' | 'pink'

export interface ThemeContextData {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextData | null>(null)

export function useTheme() {
    const context = useContext(ThemeContext)

    if (!context) {
        throw new Error('useTheme precisa estar dentro do ThemeProvider')
    }

    return context
}
