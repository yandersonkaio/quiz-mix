import { useState, useEffect, useCallback } from "react";

interface UseTimerProps {
    initialTime: number;
    onTimeUp: () => void;
    isActive: boolean;
}

export const useTimer = ({ initialTime, onTimeUp, isActive }: UseTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number>(initialTime);
    const [isRunning, setIsRunning] = useState<boolean>(isActive);

    useEffect(() => {
        setIsRunning(isActive);
    }, [isActive]);

    const resetTimer = useCallback(() => {
        setTimeLeft(initialTime);
        setIsRunning(isActive);
    }, [initialTime, isActive]);

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer!);
                        setIsRunning(false);
                        onTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning, timeLeft, onTimeUp]);

    const pauseTimer = () => {
        setIsRunning(false);
    };

    const resumeTimer = () => {
        if (timeLeft > 0) {
            setIsRunning(true);
        }
    };

    return {
        timeLeft,
        resetTimer,
        pauseTimer,
        resumeTimer,
        isRunning,
    };
};