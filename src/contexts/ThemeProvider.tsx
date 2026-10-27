
import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './ThemeContext'

const themes: Theme[] = ['light', 'dark', 'blue', 'mocha', 'forest', 'pink']
const darkThemes: Theme[] = ['dark', 'blue', 'mocha', 'forest']

function getInitialTheme(): Theme {
    try {
        const stored = localStorage.getItem('theme')

        if (themes.includes(stored as Theme)) {
            return stored as Theme
        }
    } catch {
        // Usa o tema padrão se o armazenamento não estiver disponível.
    }

    return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(getInitialTheme)

    useEffect(() => {
        const root = document.documentElement

        root.classList.remove(...themes)
        root.classList.add(theme)

        try {
            localStorage.setItem('theme', theme)
        } catch {
            // A aplicação continua funcionando sem persistência.
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme((current) =>
            darkThemes.includes(current) ? 'light' : 'dark'
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
