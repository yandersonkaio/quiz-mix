
import { Outlet, useMatch } from 'react-router'

import { Header } from '../components/Header'
import { BottomBar } from '@/components/BottomBar'

export default function PrivateLayout() {
    const isPlayingQuiz = useMatch('/play-quiz/:quizId')

    return (
        <div className="bg-background text-foreground flex min-h-dvh flex-col">
            {!isPlayingQuiz && <Header />}

            <main
                className={`mx-auto w-full max-w-7xl min-w-0 flex-1 ${isPlayingQuiz
                    ? ''
                    : 'pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0'
                    }`}
            >
                <Outlet />
            </main>

            {!isPlayingQuiz && <BottomBar />}
        </div>
    )
}
