import { useSyncExternalStore } from 'react'
import { AlertTriangle, LoaderCircle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

interface ConfirmDeleteModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title?: string
    message?: string
    isLoading?: boolean
}

const mobileQuery = '(max-width: 767px)'

function subscribeToViewport(callback: () => void) {
    const mediaQuery = window.matchMedia(mobileQuery)
    mediaQuery.addEventListener('change', callback)

    return () => mediaQuery.removeEventListener('change', callback)
}

function getIsMobile() {
    return window.matchMedia(mobileQuery).matches
}

function WarningIcon() {
    return (
        <div className="bg-destructive/10 text-destructive mx-auto mb-4 flex size-12 items-center justify-center rounded-xl">
            <AlertTriangle size={23} strokeWidth={1.8} aria-hidden="true" />
        </div>
    )
}

interface ConfirmationActionsProps {
    onClose: () => void
    onConfirm: () => void
    isLoading: boolean
}

function ConfirmationActions({ onClose, onConfirm, isLoading }: ConfirmationActionsProps) {
    return (
        <div className="flex w-full items-center gap-3">
            <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="h-11 min-w-0 flex-1 rounded-lg"
            >
                Cancelar
            </Button>

            <Button
                type="button"
                variant="destructive"
                onClick={onConfirm}
                disabled={isLoading}
                className="h-11 min-w-0 flex-1 gap-2 rounded-lg"
            >
                {isLoading ? (
                    <>
                        <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                        Excluindo...
                    </>
                ) : (
                    <>
                        <Trash2 size={17} strokeWidth={1.8} aria-hidden="true" />
                        Excluir
                    </>
                )}
            </Button>
        </div>
    )
}

export function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Exclusão',
    message = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.',
    isLoading = false,
}: ConfirmDeleteModalProps) {
    const isMobile = useSyncExternalStore(
        subscribeToViewport,
        getIsMobile,
        () => false
    )

    const handleOpenChange = (open: boolean) => {
        if (!open && !isLoading) onClose()
    }

    if (isMobile) {
        return (
            <Drawer
                open={isOpen}
                onOpenChange={handleOpenChange}
                dismissible={!isLoading}
            >
                <DrawerContent role="alertdialog" aria-busy={isLoading} className="max-h-[90dvh]">
                    <div className="mx-auto flex w-full max-w-sm min-h-0 flex-col">
                        <DrawerHeader className="px-5 pt-5 text-center">
                            <WarningIcon />
                            <DrawerTitle className="text-foreground text-center text-lg font-semibold tracking-tight">
                                {title}
                            </DrawerTitle>
                            <DrawerDescription className="text-muted-foreground mt-2 text-center text-sm leading-relaxed">
                                {message}
                            </DrawerDescription>
                        </DrawerHeader>

                        <DrawerFooter className="px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                            <ConfirmationActions
                                onClose={onClose}
                                onConfirm={onConfirm}
                                isLoading={isLoading}
                            />
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                role="alertdialog"
                aria-busy={isLoading}
                className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5 sm:p-6"
                onEscapeKeyDown={(event) => {
                    if (isLoading) event.preventDefault()
                }}
                onInteractOutside={(event) => {
                    if (isLoading) event.preventDefault()
                }}
            >
                <DialogHeader className="text-center sm:text-center">
                    <WarningIcon />
                    <DialogTitle className="text-foreground text-center text-lg font-semibold tracking-tight">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2 text-center text-sm leading-relaxed">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2">
                    <ConfirmationActions
                        onClose={onClose}
                        onConfirm={onConfirm}
                        isLoading={isLoading}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
