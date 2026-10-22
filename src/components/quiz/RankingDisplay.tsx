import { useState } from 'react'
import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    Eye,
    Target,
    Trash2,
    Trophy,
    UserRound,
} from 'lucide-react'
import { toast } from 'sonner'

import AnswersModal from './AnswersModal'
import { ConfirmDeleteModal } from '../ConfirmDeleteModal'
import type { Attempt, Question, RankingEntry } from '../../types/quiz'

interface RankingDisplayProps {
    ranking: Attempt[]
    studyRanking?: RankingEntry[]
    allUserAttempts: { [userId: string]: Attempt[] }
    questions: Question[]
    operationLoading: boolean
    onDeleteAllAttempts: () => Promise<void>
    onDeleteAttempt: (attemptId: string) => Promise<void>
    isCreator?: boolean
    currentUserId?: string
}

type RankingTab = 'challenge' | 'study'

interface AttemptActionsProps {
    attempt: Attempt
    isCreator: boolean
    currentUserId?: string
    operationLoading: boolean
    onView: (attempt: Attempt) => void
    onDelete: (attemptId: string) => void
    label: string
}

function AttemptActions({
    attempt,
    isCreator,
    currentUserId,
    operationLoading,
    onView,
    onDelete,
    label,
}: AttemptActionsProps) {
    const canViewAnswers = isCreator || currentUserId === attempt.userId

    if (!canViewAnswers) return null

    return (
        <div className="flex shrink-0 items-center gap-1">
            <button
                type="button"
                onClick={() => onView(attempt)}
                aria-label={`Ver respostas de ${label}`}
                title="Visualizar respostas"
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <Eye size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>

            {isCreator && (
                <button
                    type="button"
                    onClick={() => onDelete(attempt.id)}
                    disabled={operationLoading}
                    aria-label={`Excluir tentativa de ${label}`}
                    title="Excluir tentativa"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Trash2 size={18} strokeWidth={1.8} aria-hidden="true" />
                </button>
            )}
        </div>
    )
}

interface AttemptHistoryProps {
    attempts: Attempt[]
    mode: RankingTab
    isCreator: boolean
    currentUserId?: string
    operationLoading: boolean
    onView: (attempt: Attempt) => void
    onDelete: (attemptId: string) => void
}

function AttemptHistory({
    attempts,
    mode,
    isCreator,
    currentUserId,
    operationLoading,
    onView,
    onDelete,
}: AttemptHistoryProps) {
    const orderedAttempts = [...attempts].sort(
        (a, b) => a.completedAt.toMillis() - b.completedAt.toMillis()
    )

    return (
        <div className="border-border mt-2 space-y-2 border-l-2 pl-3 sm:ml-5 sm:pl-4">
            {orderedAttempts.map((attempt, index) => (
                <div
                    key={attempt.id}
                    className="border-border bg-background/60 flex min-w-0 items-start justify-between gap-3 rounded-lg border p-3 sm:p-4"
                >
                    <div className="min-w-0 space-y-1">
                        <p className="text-foreground text-sm font-medium">
                            Tentativa {index + 1}
                        </p>

                        {mode === 'study' ? (
                            <>
                                <p className="text-muted-foreground text-xs sm:text-sm">
                                    Respostas nesta rodada:{' '}
                                    {attempt.totalAttempts || attempt.totalQuestions}
                                </p>
                                <p className="text-muted-foreground text-xs sm:text-sm">
                                    Eficiência:{' '}
                                    {attempt.totalQuestions && attempt.totalAttempts
                                        ? (
                                            (attempt.totalQuestions / attempt.totalAttempts) *
                                            100
                                        ).toFixed(1)
                                        : '0.0'}
                                    %
                                </p>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-xs sm:text-sm">
                                {attempt.correctAnswers}/{attempt.totalQuestions} acertos (
                                {attempt.percentage}%)
                            </p>
                        )}

                        <p className="text-muted-foreground text-xs">
                            Concluída em:{' '}
                            {attempt.completedAt.toDate().toLocaleString('pt-BR')}
                        </p>
                    </div>

                    <AttemptActions
                        attempt={attempt}
                        isCreator={isCreator}
                        currentUserId={currentUserId}
                        operationLoading={operationLoading}
                        onView={onView}
                        onDelete={onDelete}
                        label={`tentativa ${index + 1}`}
                    />
                </div>
            ))}
        </div>
    )
}

function RankPosition({ index }: { index: number }) {
    const firstPlace = index === 0

    return (
        <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold sm:size-10 ${firstPlace
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
            title={`${index + 1}º lugar`}
        >
            {firstPlace ? (
                <Trophy size={19} strokeWidth={1.8} aria-label="1º lugar" />
            ) : (
                `${index + 1}º`
            )}
        </div>
    )
}

function RankingEmptyState({ mode }: { mode: RankingTab }) {
    const isStudy = mode === 'study'
    const Icon = isStudy ? BookOpen : Target

    return (
        <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center">
            <div className="bg-muted text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-xl">
                <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
            </div>
            <h4 className="text-foreground text-sm font-semibold">
                {isStudy ? 'Nenhum resultado de estudo' : 'Nenhum resultado de desafio'}
            </h4>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                {isStudy
                    ? 'Ainda não há participantes no ranking de estudo.'
                    : 'Ainda não há participantes no ranking de desafio.'}
            </p>
        </div>
    )
}

export const RankingDisplay = ({
    ranking,
    studyRanking = [],
    allUserAttempts,
    questions,
    operationLoading,
    onDeleteAllAttempts,
    onDeleteAttempt,
    isCreator = false,
    currentUserId,
}: RankingDisplayProps) => {
    const [expandedUser, setExpandedUser] = useState<string | null>(null)
    const [expandedStudyUser, setExpandedStudyUser] = useState<string | null>(null)
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<'all' | 'single' | null>(null)
    const [attemptIdToDelete, setAttemptIdToDelete] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<RankingTab>('challenge')

    const hasAnyRanking = ranking.length > 0 || studyRanking.length > 0

    const handleDeleteAllAttempts = () => {
        if (operationLoading) return
        setDeleteTarget('all')
        setAttemptIdToDelete(null)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteAttempt = (attemptId: string) => {
        if (operationLoading) return
        setDeleteTarget('single')
        setAttemptIdToDelete(attemptId)
        setIsDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false)
        setDeleteTarget(null)
        setAttemptIdToDelete(null)
    }

    const confirmDelete = async () => {
        try {
            if (deleteTarget === 'all') {
                await onDeleteAllAttempts()
            } else if (deleteTarget === 'single' && attemptIdToDelete) {
                await onDeleteAttempt(attemptIdToDelete)
            }

            closeDeleteModal()
        } catch (error) {
            console.error('Erro ao excluir:', error)
            toast.error('Erro ao realizar a exclusão.')
        }
    }

    return (
        <section className="text-card-foreground min-w-0 space-y-5">
            {/* Cabeçalho */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-foreground text-lg font-semibold tracking-tight sm:text-xl">
                        Ranking
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Acompanhe os resultados dos participantes.
                    </p>
                </div>

                {hasAnyRanking && isCreator && (
                    <button
                        type="button"
                        onClick={handleDeleteAllAttempts}
                        disabled={operationLoading}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10 focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        title="Excluir todas as tentativas"
                    >
                        <Trash2 size={16} strokeWidth={1.8} aria-hidden="true" />
                        <span className="hidden sm:inline">Limpar ranking</span>
                        <span className="sm:hidden">Limpar</span>
                    </button>
                )}
            </div>

            {/* Alternância entre modos */}
            <div
                role="group"
                aria-label="Tipo de ranking"
                className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1"
            >
                <button
                    type="button"
                    onClick={() => setActiveTab('challenge')}
                    aria-pressed={activeTab === 'challenge'}
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'challenge'
                            ? 'bg-card text-card-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Target size={17} strokeWidth={1.8} aria-hidden="true" />
                    <span>Desafio</span>
                    {ranking.length > 0 && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
                            {ranking.length}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('study')}
                    aria-pressed={activeTab === 'study'}
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:px-4 ${activeTab === 'study'
                            ? 'bg-card text-card-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <BookOpen size={17} strokeWidth={1.8} aria-hidden="true" />
                    <span>Estudo</span>
                    {studyRanking.length > 0 && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs tabular-nums">
                            {studyRanking.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Ranking de desafio */}
            {activeTab === 'challenge' && (
                <div className="space-y-3">
                    {ranking.length === 0 ? (
                        <RankingEmptyState mode="challenge" />
                    ) : (
                        ranking.map((attempt, index) => {
                            // Tentativas antigas podem não ter o campo mode.
                            const challengeAttempts = (
                                allUserAttempts[attempt.userId] || [attempt]
                            ).filter((item) => item.mode !== 'study')
                            const hasMultipleAttempts = challengeAttempts.length > 1
                            const isExpanded = expandedUser === attempt.userId

                            return (
                                <div key={attempt.id} className="min-w-0">
                                    <div
                                        className={`border-border flex min-w-0 items-center gap-2 rounded-xl border p-3 transition-colors sm:gap-3 sm:p-4 ${index === 0
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'bg-muted/30 hover:bg-muted/50'
                                            }`}
                                    >
                                        <RankPosition index={index} />

                                        {attempt.photoURL ? (
                                            <img
                                                src={attempt.photoURL}
                                                alt=""
                                                className="size-8 shrink-0 rounded-full object-cover sm:size-10"
                                            />
                                        ) : (
                                            <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full sm:size-10">
                                                <UserRound size={18} aria-hidden="true" />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-foreground truncate text-sm font-semibold sm:text-base">
                                                {attempt.displayName}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed sm:text-sm">
                                                {attempt.correctAnswers}/{attempt.totalQuestions} acertos ·{' '}
                                                {attempt.percentage}%
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                            <AttemptActions
                                                attempt={attempt}
                                                isCreator={isCreator}
                                                currentUserId={currentUserId}
                                                operationLoading={operationLoading}
                                                onView={setSelectedAttempt}
                                                onDelete={handleDeleteAttempt}
                                                label={attempt.displayName}
                                            />

                                            {hasMultipleAttempts && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedUser(isExpanded ? null : attempt.userId)
                                                    }
                                                    aria-expanded={isExpanded}
                                                    aria-label={
                                                        isExpanded ? 'Ocultar tentativas' : 'Mostrar tentativas'
                                                    }
                                                    title={
                                                        isExpanded ? 'Ocultar tentativas' : 'Mostrar tentativas'
                                                    }
                                                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp size={19} aria-hidden="true" />
                                                    ) : (
                                                        <ChevronDown size={19} aria-hidden="true" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {hasMultipleAttempts && isExpanded && (
                                        <AttemptHistory
                                            attempts={challengeAttempts}
                                            mode="challenge"
                                            isCreator={isCreator}
                                            currentUserId={currentUserId}
                                            operationLoading={operationLoading}
                                            onView={setSelectedAttempt}
                                            onDelete={handleDeleteAttempt}
                                        />
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* Ranking de estudo */}
            {activeTab === 'study' && (
                <div className="space-y-3">
                    {studyRanking.length === 0 ? (
                        <RankingEmptyState mode="study" />
                    ) : (
                        studyRanking.map((entry, index) => {
                            const studyAttempts = (allUserAttempts[entry.userId] || []).filter(
                                (attempt) => attempt.mode === 'study'
                            )
                            const primaryAttempt = studyAttempts[0]
                            const hasMultipleAttempts = studyAttempts.length > 1
                            const isExpanded = expandedStudyUser === entry.userId

                            return (
                                <div
                                    key={`${entry.userId}-${entry.completedAt?.toMillis?.() ?? index}`}
                                    className="min-w-0"
                                >
                                    <div
                                        className={`border-border flex min-w-0 items-center gap-2 rounded-xl border p-3 transition-colors sm:gap-3 sm:p-4 ${index === 0
                                                ? 'border-primary/30 bg-primary/5'
                                                : 'bg-muted/30 hover:bg-muted/50'
                                            }`}
                                    >
                                        <RankPosition index={index} />

                                        {entry.photoURL ? (
                                            <img
                                                src={entry.photoURL}
                                                alt=""
                                                className="size-8 shrink-0 rounded-full object-cover sm:size-10"
                                            />
                                        ) : (
                                            <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full sm:size-10">
                                                <UserRound size={18} aria-hidden="true" />
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-foreground truncate text-sm font-semibold sm:text-base">
                                                {entry.userName}
                                            </p>
                                            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed sm:text-sm">
                                                {entry.totalAttempts} respostas · Eficiência: {entry.score}%
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                                            {primaryAttempt && (
                                                <AttemptActions
                                                    attempt={primaryAttempt}
                                                    isCreator={isCreator}
                                                    currentUserId={currentUserId}
                                                    operationLoading={operationLoading}
                                                    onView={setSelectedAttempt}
                                                    onDelete={handleDeleteAttempt}
                                                    label={entry.userName}
                                                />
                                            )}

                                            {hasMultipleAttempts && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedStudyUser(isExpanded ? null : entry.userId)
                                                    }
                                                    aria-expanded={isExpanded}
                                                    aria-label={
                                                        isExpanded ? 'Ocultar tentativas' : 'Mostrar tentativas'
                                                    }
                                                    title={
                                                        isExpanded ? 'Ocultar tentativas' : 'Mostrar tentativas'
                                                    }
                                                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp size={19} aria-hidden="true" />
                                                    ) : (
                                                        <ChevronDown size={19} aria-hidden="true" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {hasMultipleAttempts && isExpanded && (
                                        <AttemptHistory
                                            attempts={studyAttempts}
                                            mode="study"
                                            isCreator={isCreator}
                                            currentUserId={currentUserId}
                                            operationLoading={operationLoading}
                                            onView={setSelectedAttempt}
                                            onDelete={handleDeleteAttempt}
                                        />
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* Visualização das respostas */}
            {selectedAttempt && (
                <AnswersModal
                    isOpen={!!selectedAttempt}
                    onClose={() => setSelectedAttempt(null)}
                    attempt={selectedAttempt}
                    questions={questions}
                />
            )}

            {/* Confirmação de exclusão */}
            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                title={
                    deleteTarget === 'all'
                        ? 'Excluir Todas as Tentativas'
                        : 'Excluir Tentativa'
                }
                message={
                    deleteTarget === 'all'
                        ? 'Tem certeza que deseja excluir TODAS as tentativas deste quiz? Esta ação não pode ser desfeita.'
                        : 'Tem certeza que deseja excluir esta tentativa? Esta ação não pode ser desfeita.'
                }
                isLoading={operationLoading}
            />
        </section>
    )
}
