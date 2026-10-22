import { Outlet } from 'react-router'

import { AppFooter } from '@/components/AppFooter'

export default function PublicLayout() {
    return (
        <div className="bg-background text-foreground flex min-h-dvh w-full flex-col">
            <main className="flex min-h-0 w-full flex-1 flex-col">
                <Outlet />
            </main>

            <AppFooter />
        </div>
    )
}
