interface AppFooterProps {
    withBottomBar?: boolean
}

export function AppFooter({
    withBottomBar = false,
}: AppFooterProps) {
    return (
        <footer
            className={`flex shrink-0 flex-col items-center gap-1 px-4 pt-5 text-center ${withBottomBar
                ? 'pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6'
                : 'pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:pb-6'
                }`}
        >
            <p className="text-muted-foreground text-xs">
                Desenvolvido por{' '}
                <span className="text-foreground font-medium">
                    Yanderson Kaio
                </span>
            </p>

            <p className="text-muted-foreground/70 text-[11px]">
                © {new Date().getFullYear()} QuizMix
            </p>
        </footer>
    )
}
