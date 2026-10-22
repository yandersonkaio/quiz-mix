import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTimerProps {
    initialTime: number
    onTimeUp: () => void
    isActive: boolean
}

interface TimerState {
    initialTime: number
    previousIsActive: boolean
    timeLeft: number
    isPaused: boolean
}

export const useTimer = ({
    initialTime,
    onTimeUp,
    isActive,
}: UseTimerProps) => {
    const duration = Math.max(0, initialTime)

    const [timerState, setTimerState] = useState<TimerState>(() => ({
        initialTime: duration,
        previousIsActive: isActive,
        timeLeft: duration,
        isPaused: false,
    }))

    const hasNotifiedRef = useRef(false)

    if (
        timerState.initialTime !== duration ||
        timerState.previousIsActive !== isActive
    ) {
        setTimerState({
            initialTime: duration,
            previousIsActive: isActive,
            timeLeft:
                timerState.initialTime !== duration
                    ? duration
                    : timerState.timeLeft,
            isPaused: false,
        })
    }

    const { timeLeft, isPaused } = timerState
    const isRunning = isActive && !isPaused && timeLeft > 0

    useEffect(() => {
        hasNotifiedRef.current = false
    }, [duration])

    useEffect(() => {
        if (!isRunning) return

        const timer = setInterval(() => {
            setTimerState((prev) => ({
                ...prev,
                timeLeft: Math.max(0, prev.timeLeft - 1),
            }))
        }, 1000)

        return () => clearInterval(timer)
    }, [isRunning])

    useEffect(() => {
        if (
            !isActive ||
            isPaused ||
            timeLeft !== 0 ||
            duration <= 0 ||
            hasNotifiedRef.current
        ) {
            return
        }

        hasNotifiedRef.current = true
        onTimeUp()
    }, [timeLeft, duration, isActive, isPaused, onTimeUp])

    const resetTimer = useCallback(() => {
        hasNotifiedRef.current = false

        setTimerState({
            initialTime: duration,
            previousIsActive: isActive,
            timeLeft: duration,
            isPaused: false,
        })
    }, [duration, isActive])

    const pauseTimer = useCallback(() => {
        setTimerState((prev) => ({
            ...prev,
            isPaused: true,
        }))
    }, [])

    const resumeTimer = useCallback(() => {
        setTimerState((prev) =>
            prev.timeLeft > 0
                ? { ...prev, isPaused: false }
                : prev
        )
    }, [])

    return {
        timeLeft,
        resetTimer,
        pauseTimer,
        resumeTimer,
        isRunning,
    }
}
