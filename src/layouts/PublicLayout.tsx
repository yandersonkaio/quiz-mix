
import { Outlet } from 'react-router'

export default function PublicLayout() {
    return (
        <div className="bg-background text-foreground min-h-dvh w-full">
            <main className="min-h-dvh">
                <Outlet />
            </main>
        </div>
    )
}
