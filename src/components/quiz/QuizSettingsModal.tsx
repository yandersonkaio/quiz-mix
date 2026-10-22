import { useState, useSyncExternalStore } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
    BookOpen,
    Check,
    Clock3,
    EyeOff,
    LoaderCircle,
    Target,
    Trophy,
    Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { useQuizData } from '@/hooks/useQuizData'
import type { Quiz, QuizDifficulty } from '@/types/quiz'
import { DifficultyBadge } from '@/components/quiz/DifficultyBadge'

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
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'

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

type QuizMode = 'challenge' | 'study'

interface QuizSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    quizDetails?: Partial<Quiz>
    quizId?: string
    onSave?: (updatedDetails: Partial<Quiz>) => Promise<void>
    isCreating?: boolean
}

const fieldClass =
    'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60'

const optionClass =
    'flex min-w-0 flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'

const selectedClass = 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
const unselectedClass = 'border-border bg-background text-foreground hover:bg-accent/60'

export function QuizSettingsModal(props: QuizSettingsModalProps) {
    if (!props.isOpen) return null

    return <QuizSettingsContent {...props} />
}

function QuizSettingsContent({
    onClose,
    quizDetails,
    onSave,
    isCreating = false,
}: QuizSettingsModalProps) {
    const isMobile = useSyncExternalStore(
        subscribeToMobileViewport,
        getMobileViewportSnapshot,
        getServerViewportSnapshot
    )

    const [formData, setFormData] = useState<Partial<Quiz>>(() => ({
        ...(quizDetails ?? {}),
        name: quizDetails?.name ?? '',
        description: quizDetails?.description ?? '',
        settings: {
            showAnswersAfter: quizDetails?.settings?.showAnswersAfter ?? 'end',
            timeLimitPerQuestion: quizDetails?.settings?.timeLimitPerQuestion,
        },
    }))
    const [quizMode, setQuizMode] = useState<QuizMode>(() =>
        quizDetails?.settings?.showAnswersAfter === 'untilCorrect' ? 'study' : 'challenge'
    )
    const [hasTimeLimit, setHasTimeLimit] = useState(
        Boolean(quizDetails?.settings?.timeLimitPerQuestion)
    )
    const [isSaving, setIsSaving] = useState(false)

    const { user, createQuiz, operationLoading } = useQuizData()
    const navigate = useNavigate()
    const isBusy = isSaving || operationLoading
    const challengeAnswerMode =
        formData.settings?.showAnswersAfter === 'immediately' ? 'immediately' : 'end'

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (isBusy) return

        if (!formData.name?.trim()) {
            toast.error('O nome do quiz é obrigatório.')
            return
        }

        if (isCreating && !user?.uid) {
            toast.error('Você precisa estar logado para criar um quiz.')
            return
        }

        setIsSaving(true)

        try {
            const settings: Quiz['settings'] = {
                // Nunca salvar 'untilCorrect' ao voltar para o modo Desafio.
                showAnswersAfter: quizMode === 'study' ? 'untilCorrect' : challengeAnswerMode,
                timeLimitPerQuestion:
                    quizMode === 'study' || !hasTimeLimit
                        ? undefined
                        : (formData.settings?.timeLimitPerQuestion ?? 30),
            }

            if (isCreating) {
                const newQuiz: Omit<Quiz, 'id' | 'createdAt'> = {
                    name: formData.name.trim(),
                    description: formData.description,
                    difficulty: formData.difficulty,
                    userId: user!.uid,
                    settings,
                }

                const createdQuizId = await createQuiz(newQuiz)
                if (createdQuizId) {
                    navigate(`/quiz/details/${createdQuizId}`)
                    onClose()
                }
            } else if (onSave) {
                await onSave({ ...formData, name: formData.name.trim(), settings })
                onClose()
            }
        } catch (error) {
            console.error('Erro ao salvar configurações:', error)
            toast.error(`Erro ao ${isCreating ? 'criar' : 'salvar'} o quiz.`)
        } finally {
            setIsSaving(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        if (!open && !isBusy) onClose()
    }

    const formContent = (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div data-vaul-no-drag="" className="min-h-0 flex-1 space-y-7 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="quiz-name" className="text-foreground block text-sm font-medium">
                            Nome do Quiz
                        </label>
                        <input
                            id="quiz-name"
                            type="text"
                            value={formData.name ?? ''}
                            onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
                            className={fieldClass}
                            placeholder="Digite o nome do quiz"
                            required
                            disabled={isBusy}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="quiz-description" className="text-foreground block text-sm font-medium">
                            Descrição
                        </label>
                        <textarea
                            id="quiz-description"
                            value={formData.description ?? ''}
                            onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
                            className={`${fieldClass} min-h-24 resize-y`}
                            placeholder="Digite a descrição do quiz"
                            rows={3}
                            disabled={isBusy}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="quiz-difficulty" className="text-foreground block text-sm font-medium">
                            Dificuldade
                        </label>
                        <select
                            id="quiz-difficulty"
                            value={formData.difficulty ?? ''}
                            onChange={(event) => setFormData((previous) => ({
                                ...previous,
                                difficulty: event.target.value ? event.target.value as QuizDifficulty : undefined,
                            }))}
                            className={fieldClass}
                            disabled={isBusy}
                        >
                            <option value="">Sem classificação</option>
                            <option value="easy">Fácil</option>
                            <option value="medium">Médio</option>
                            <option value="hard">Difícil</option>
                        </select>

                        {formData.difficulty && (
                            <DifficultyBadge
                                difficulty={formData.difficulty}
                                className="mt-2"
                            />
                        )}
                    </div>
                </div>

                <section className="space-y-3">
                    <h3 className="text-foreground text-sm font-semibold">Como os participantes responderão?</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => setQuizMode('challenge')}
                            aria-pressed={quizMode === 'challenge'}
                            className={`${optionClass} ${quizMode === 'challenge' ? selectedClass : unselectedClass}`}
                            disabled={isBusy}
                        >
                            <div className="flex w-full items-center justify-between">
                                <Target size={22} strokeWidth={1.8} className={quizMode === 'challenge' ? 'text-primary' : 'text-muted-foreground'} />
                                {quizMode === 'challenge' && <Check size={17} className="text-primary" />}
                            </div>
                            <span className="font-semibold">Desafio</span>
                            <span className="text-muted-foreground text-sm leading-relaxed">
                                Teste seus conhecimentos e veja seu desempenho ao final.
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setQuizMode('study')}
                            aria-pressed={quizMode === 'study'}
                            className={`${optionClass} ${quizMode === 'study' ? selectedClass : unselectedClass}`}
                            disabled={isBusy}
                        >
                            <div className="flex w-full items-center justify-between">
                                <BookOpen size={22} strokeWidth={1.8} className={quizMode === 'study' ? 'text-primary' : 'text-muted-foreground'} />
                                {quizMode === 'study' && <Check size={17} className="text-primary" />}
                            </div>
                            <span className="font-semibold">Estudo</span>
                            <span className="text-muted-foreground text-sm leading-relaxed">
                                Aprenda enquanto responde. Tente novamente até acertar.
                            </span>
                        </button>
                    </div>
                </section>

                {quizMode === 'challenge' ? (
                    <>
                        <section className="space-y-3">
                            <h3 className="text-foreground text-sm font-semibold">
                                Quando mostrar as respostas?
                            </h3>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData((previous) => ({
                                        ...previous,
                                        settings: {
                                            showAnswersAfter: 'immediately',
                                            timeLimitPerQuestion: previous.settings?.timeLimitPerQuestion,
                                        },
                                    }))}
                                    aria-pressed={challengeAnswerMode === 'immediately'}
                                    className={`${optionClass} ${challengeAnswerMode === 'immediately' ? selectedClass : unselectedClass}`}
                                    disabled={isBusy}
                                >
                                    <Zap size={21} strokeWidth={1.8} className={challengeAnswerMode === 'immediately' ? 'text-primary' : 'text-muted-foreground'} />
                                    <span className="font-semibold">Após cada resposta</span>
                                    <span className="text-muted-foreground text-sm leading-relaxed">
                                        Veja imediatamente se acertou ou errou.
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData((previous) => ({
                                        ...previous,
                                        settings: {
                                            showAnswersAfter: 'end',
                                            timeLimitPerQuestion: previous.settings?.timeLimitPerQuestion,
                                        },
                                    }))}
                                    aria-pressed={challengeAnswerMode === 'end'}
                                    className={`${optionClass} ${challengeAnswerMode === 'end' ? selectedClass : unselectedClass}`}
                                    disabled={isBusy}
                                >
                                    <EyeOff size={21} strokeWidth={1.8} className={challengeAnswerMode === 'end' ? 'text-primary' : 'text-muted-foreground'} />
                                    <span className="font-semibold">No final</span>
                                    <span className="text-muted-foreground text-sm leading-relaxed">
                                        Responda todas as questões e veja seu resultado no final.
                                    </span>
                                </button>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Clock3 size={18} className="text-muted-foreground" />
                                <h3 className="text-foreground text-sm font-semibold">Tempo por pergunta</h3>
                            </div>

                            <div className="border-border bg-background rounded-xl border p-4">
                                <label className="flex items-center gap-2.5">
                                    <input
                                        type="checkbox"
                                        checked={!hasTimeLimit}
                                        onChange={(event) => setHasTimeLimit(!event.target.checked)}
                                        className="border-input accent-primary size-4 shrink-0 rounded"
                                        disabled={isBusy}
                                    />
                                    <span className="text-foreground text-sm font-medium">Sem limite de tempo</span>
                                </label>

                                {hasTimeLimit && (
                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <label htmlFor="quiz-time-limit" className="text-muted-foreground text-sm">
                                            Tempo por pergunta
                                        </label>
                                        <input
                                            id="quiz-time-limit"
                                            type="number"
                                            min={1}
                                            value={formData.settings?.timeLimitPerQuestion ?? 30}
                                            onChange={(event) => setFormData((previous) => ({
                                                ...previous,
                                                settings: {
                                                    showAnswersAfter: previous.settings?.showAnswersAfter ?? 'end',
                                                    timeLimitPerQuestion: event.target.value ? Number(event.target.value) : undefined,
                                                },
                                            }))}
                                            className={`${fieldClass} w-24`}
                                            disabled={isBusy}
                                        />
                                        <span className="text-muted-foreground text-sm">segundos</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    </>
                ) : (
                    <section className="space-y-3">
                        <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4">
                            <BookOpen size={20} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h3 className="text-foreground text-sm font-semibold">Modo de Estudo</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    O participante poderá tentar responder à questão até acertar. Não há limite de tempo.
                                </p>
                            </div>
                        </div>
                        <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4">
                            <Trophy size={20} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div className="space-y-1">
                                <h3 className="text-foreground text-sm font-semibold">Participa do ranking</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    A classificação considera quantas tentativas foram necessárias. Quanto menos, melhor.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <div className="border-border bg-card flex shrink-0 gap-3 border-t px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:justify-end sm:px-6 md:pb-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isBusy}
                    className="border-border bg-muted text-foreground hover:bg-accent flex h-11 flex-1 items-center justify-center rounded-xl border px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isBusy}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                    {isBusy ? (
                        <>
                            <LoaderCircle size={17} className="animate-spin" />
                            {isCreating ? 'Criando...' : 'Salvando...'}
                        </>
                    ) : (
                        isCreating ? 'Criar Quiz' : 'Salvar'
                    )}
                </button>
            </div>
        </form>
    )

    const title = isCreating ? 'Configurações do Quiz' : 'Editar Configurações do Quiz'
    const description = 'Configure como os participantes irão responder.'

    if (isMobile) {
        return (
            <Drawer open={true} onOpenChange={handleOpenChange}>
                <DrawerContent className="border-border bg-card text-card-foreground flex h-[92dvh] max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-2xl p-0">
                    <DrawerHeader className="border-border relative shrink-0 border-b px-5 pt-5 pb-4 pr-14 text-left">
                        <DrawerTitle className="text-foreground text-lg font-semibold tracking-tight">
                            {title}
                        </DrawerTitle>
                        <DrawerDescription className="text-muted-foreground text-xs sm:text-sm">
                            {description}
                        </DrawerDescription>
                    </DrawerHeader>
                    {formContent}
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={true} onOpenChange={handleOpenChange}>
            <DialogContent className="border-border bg-card text-card-foreground flex max-h-[calc(100dvh-3rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl">
                <DialogHeader className="border-border shrink-0 border-b px-5 py-4 pr-14 text-left sm:px-6">
                    <DialogTitle className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                {formContent}
            </DialogContent>
        </Dialog>
    )
}
