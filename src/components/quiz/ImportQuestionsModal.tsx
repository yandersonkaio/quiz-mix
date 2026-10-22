import { useSyncExternalStore } from 'react'
import { FileJson } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { ImportQuestionsBody } from './import-questions/ImportQuestionsBody'
import { ImportQuestionsActions } from './import-questions/ImportQuestionsActions'
import { useImportQuestions } from './import-questions/useImportQuestions'
import type { ImportQuestionsModalProps } from './import-questions/types'

const mobileQuery = '(max-width: 767px)'

function subscribeToMobileViewport(callback: () => void) {
    const mediaQuery = window.matchMedia(mobileQuery)
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
}

function getMobileViewportSnapshot() {
    return window.matchMedia(mobileQuery).matches
}

function getServerViewportSnapshot() {
    return false
}

type OpenModalProps = Pick<
    ImportQuestionsModalProps,
    'onClose' | 'onSaveImportedQuestions'
>

function OpenImportQuestionsModal({
    onClose,
    onSaveImportedQuestions,
}: OpenModalProps) {
    const isMobile = useSyncExternalStore(
        subscribeToMobileViewport,
        getMobileViewportSnapshot,
        getServerViewportSnapshot
    )

    const importer = useImportQuestions({ onClose, onSaveImportedQuestions })

    const headerContent = (
        <div className="flex min-w-0 items-start gap-3">
            <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                <FileJson size={20} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div className="min-w-0">
                {isMobile ? (
                    <>
                        <DrawerTitle className="text-foreground text-lg font-semibold tracking-tight">
                            Importar perguntas
                        </DrawerTitle>
                        <DrawerDescription className="text-muted-foreground mt-1 text-xs leading-relaxed">
                            Importe perguntas de um arquivo JSON para o seu quiz.
                        </DrawerDescription>
                    </>
                ) : (
                    <>
                        <DialogTitle className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                            Importar perguntas
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
                            Importe perguntas de um arquivo JSON para o seu quiz.
                        </DialogDescription>
                    </>
                )}
            </div>
        </div>
    )

    const body = <ImportQuestionsBody importer={importer} />
    const actions = <ImportQuestionsActions importer={importer} />

    if (isMobile) {
        return (
            <Drawer
                open
                onOpenChange={importer.handleOpenChange}
                dismissible={!importer.isBusy}
            >
                <DrawerContent
                    aria-busy={importer.isBusy}
                    className="bg-card text-card-foreground flex max-h-[92dvh] min-h-0 flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
                >
                    <DrawerHeader className="border-border shrink-0 border-b px-5 pt-5 pb-4 text-left">
                        {headerContent}
                    </DrawerHeader>
                    {body}
                    <DrawerFooter className="border-border bg-card flex shrink-0 flex-row items-center justify-end gap-3 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                        {actions}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open onOpenChange={importer.handleOpenChange}>
            <DialogContent
                aria-busy={importer.isBusy}
                onEscapeKeyDown={(event) => {
                    if (importer.isBusy) event.preventDefault()
                }}
                onInteractOutside={(event) => {
                    if (importer.isBusy) event.preventDefault()
                }}
                className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl"
            >
                <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pr-12 text-left sm:px-6 sm:pr-14">
                    {headerContent}
                </DialogHeader>
                {body}
                <DialogFooter className="border-border bg-card flex shrink-0 flex-row items-center justify-end gap-3 border-t px-5 py-4 sm:px-6">
                    {actions}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function ImportQuestionsModal({
    isOpen,
    onClose,
    onSaveImportedQuestions,
}: ImportQuestionsModalProps) {
    if (!isOpen) return null

    return (
        <OpenImportQuestionsModal
            onClose={onClose}
            onSaveImportedQuestions={onSaveImportedQuestions}
        />
    )
}
