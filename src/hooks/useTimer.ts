
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTimerProps {
    initialTime: number
    onTimeUp: () => void
    isActive: boolean
}

export const useTimer = ({
    initialTime,
    onTimeUp,
    isActive,
}: UseTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialTime)

    const [pauseState, setPauseState] = useState({
        previousIsActive: isActive,
        isPaused: false,
    })

    const hasNotifiedRef = useRef(false)

    if (pauseState.previousIsActive !== isActive) {
        setPauseState({
            previousIsActive: isActive,
            isPaused: false,
        })
    }

    const isRunning =
        isActive &&
        !pauseState.isPaused &&
        timeLeft > 0

    useEffect(() => {
        if (!isRunning) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [isRunning])

    useEffect(() => {
        if (
            timeLeft !== 0 ||
            initialTime <= 0 ||
            hasNotifiedRef.current
        ) {
            return
        }

        hasNotifiedRef.current = true
        onTimeUp()
    }, [timeLeft, initialTime, onTimeUp])

    const resetTimer = useCallback(() => {
        hasNotifiedRef.current = false

        setTimeLeft(initialTime)

        setPauseState({
            previousIsActive: isActive,
            isPaused: false,
        })
    }, [initialTime, isActive])

    const pauseTimer = useCallback(() => {
        setPauseState({
            previousIsActive: isActive,
            isPaused: true,
        })
    }, [isActive])

    const resumeTimer = useCallback(() => {
        if (timeLeft <= 0) return

        setPauseState({
            previousIsActive: isActive,
            isPaused: false,
        })
    }, [isActive, timeLeft])

    return {
        timeLeft,
        resetTimer,
        pauseTimer,
        resumeTimer,
        isRunning,
    }
}
