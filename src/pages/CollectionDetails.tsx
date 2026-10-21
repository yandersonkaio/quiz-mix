import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
    ChevronDown,
    Folder,
    FolderOpen,
    Heart,
    Info,
    Layers3,
    ListChecks,
    LoaderCircle,
    Pencil,
    Settings2,
    Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

import Loading from '../components/Loading'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { CollectionSettingsModal } from '@/components/collection/CollectionSettingsModal'
import AddQuizToCollectionModal from '@/components/collection/AddQuizToCollectionModal'
import ManageSectionsModal from '@/components/collection/ManageSectionsModal'
import { QuizListItem } from '@/components/quiz/QuizListItem'

import { useCollection } from '@/hooks/useCollection'
import { useCollectionData } from '../hooks/useCollectionData'
import { useCollectionQuizzes } from '@/hooks/useCollectionQuizzes'
import { useCollectionSections } from '@/hooks/useCollectionSections'
import { useCollectionFavorite } from '@/hooks/useCollectionFavorite'

import type { QuizCollection } from '@/types/quiz'

interface SectionCardProps {
    title: string
    description?: string
    count: number
    expanded: boolean
    onToggle: () => void
    children: ReactNode
}

function SectionCard({
    title,
    description,
    count,
    expanded,
    onToggle,
    children,
}: SectionCardProps) {
    return (
        <section className="border-border bg-muted/40 overflow-hidden rounded-xl border">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="hover:bg-accent/60 focus-visible:ring-ring flex w-full items-center gap-3 p-4 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none sm:p-5"
            >
                <span className="bg-card text-muted-foreground border-border flex size-10 shrink-0 items-center justify-center rounded-lg border">
                    {expanded ? (
                        <FolderOpen size={20} aria-hidden="true" />
                    ) : (
                        <Folder size={20} aria-hidden="true" />
                    )}
                </span>

                <span className="min-w-0 flex-1">
                    <span className="text-foreground block truncate text-sm font-semibold sm:text-base">
                        {title}
                    </span>
                    {description && (
                        <span className="text-muted-foreground mt-0.5 block truncate text-xs sm:text-sm">
                            {description}
                        </span>
                    )}
                </span>

                <span className="bg-card text-muted-foreground border-border shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium">
                    {count} {count === 1 ? 'quiz' : 'quizzes'}
                </span>

                <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className={`text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {expanded && (
                <div className="border-border border-t px-3 py-4 sm:px-5">
                    {children}
                </div>
            )}
        </section>
    )
}

export default function CollectionDetails() {
    const { collectionId } = useParams<{ collectionId: string }>()
    const navigate = useNavigate()

    const { collection, loading, user } = useCollection(collectionId)
    const { sections, loading: sectionsLoading } = useCollectionSections(collectionId)
    const { quizzes, loading: quizzesLoading } = useCollectionQuizzes(collectionId)
    const { deleteCollection, operationLoading } = useCollectionData()
    const { updateCollection } = useCollectionData()

    const {
        isFavorite,
        loading: favoriteLoading,
        toggleFavorite,
        operationLoading: favoriteOperationLoading,
    } = useCollectionFavorite(collectionId)

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isAddQuizModalOpen, setIsAddQuizModalOpen] = useState(false)
    const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }))
    }

    const handleSaveCollection = async (updatedCollection: Partial<QuizCollection>) => {
        if (!collection) return

        try {
            await updateCollection(collection.id, updatedCollection)
            toast.success('Coleção atualizada com sucesso.')
            setIsSettingsModalOpen(false)
        } catch (error) {
            console.error(error)
            toast.error('Erro ao atualizar coleção.')
        }
    }

    const handleDeleteCollection = async () => {
        if (!collection) return

        try {
            await deleteCollection(collection.id)
            toast.success('Coleção excluída com sucesso.')
            navigate('/my-collections')
        } catch (error) {
            console.error(error)
            toast.error('Erro ao excluir coleção.')
        }
    }

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite()
            toast.success(
                isFavorite
                    ? 'Coleção removida dos favoritos.'
                    : 'Coleção adicionada aos favoritos!'
            )
        } catch (error) {
            console.error(error)
            toast.error('Erro ao atualizar favorito.')
        }
    }

    const getQuizzesBySection = (sectionId: string | null) =>
        quizzes.filter((quiz) => quiz.sectionId === sectionId)

    const quizzesSemSecao = getQuizzesBySection(null)

    if (loading) return <Loading />

    if (!collection) {
        return (
            <div className="text-muted-foreground flex min-h-[60vh] items-center justify-center px-4 text-center">
                Coleção não encontrada.
            </div>
        )
    }

    const isCreator = collection.userId === user?.uid
    const favoriteBusy = favoriteLoading || favoriteOperationLoading

    const formattedDate = collection.createdAt?.toDate
        ? collection.createdAt.toDate().toLocaleDateString('pt-BR')
        : 'N/A'

    return (
        <div className="bg-background text-foreground min-h-full w-full">
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                {/* Cabeçalho */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">
                            {collection.name}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
                            {collection.description || 'Sem descrição'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleToggleFavorite}
                        disabled={favoriteBusy}
                        aria-pressed={isFavorite}
                        aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className={`border-border bg-card hover:bg-accent focus-visible:ring-ring inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${isFavorite ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {favoriteBusy ? (
                            <LoaderCircle size={18} className="motion-safe:animate-spin" aria-hidden="true" />
                        ) : (
                            <Heart
                                size={18}
                                className={isFavorite ? 'fill-current' : ''}
                                aria-hidden="true"
                            />
                        )}
                        {isFavorite ? 'Favorita' : 'Favoritar'}
                    </button>
                </div>

                {/* Informações e gerenciamento */}
                <div className={`mb-8 grid gap-5 ${isCreator ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
                    <section className="border-border bg-card rounded-xl border p-5 sm:p-6">
                        <div className="mb-5 flex items-center gap-2.5">
                            <Info size={20} className="text-muted-foreground" aria-hidden="true" />
                            <h2 className="text-lg font-semibold">Informações</h2>
                        </div>

                        <dl className="space-y-4 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Criada em</dt>
                                <dd className="font-medium">{formattedDate}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Total de quizzes</dt>
                                <dd className="font-semibold">{quizzes.length}</dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Seções</dt>
                                <dd className="font-semibold">{sections.length}</dd>
                            </div>
                        </dl>
                    </section>

                    {isCreator && (
                        <section className="border-border bg-card rounded-xl border p-5 md:col-span-2 sm:p-6">
                            <div className="mb-5 flex items-center gap-2.5">
                                <Settings2 size={20} className="text-muted-foreground" aria-hidden="true" />
                                <h2 className="text-lg font-semibold">Configurações da coleção</h2>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsModalOpen(true)}
                                    className="border-border bg-muted/60 text-foreground hover:bg-accent flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors"
                                >
                                    Editar informações
                                    <Pencil size={18} className="shrink-0" aria-hidden="true" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15 flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors"
                                >
                                    Excluir coleção
                                    <Trash2 size={18} className="shrink-0" aria-hidden="true" />
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* Conteúdo da coleção */}
                <section className="border-border bg-card rounded-xl border p-4 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <ListChecks size={20} className="text-muted-foreground" aria-hidden="true" />
                                <h2 className="text-lg font-semibold">Quizzes</h2>
                            </div>

                            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                                {sections.length} {sections.length === 1 ? 'seção' : 'seções'} ·{' '}
                                {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
                            </span>
                        </div>

                        {isCreator && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setIsAddQuizModalOpen(true)}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    <ListChecks size={18} aria-hidden="true" />
                                    Gerenciar quizzes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsSectionsModalOpen(true)}
                                    className="border-border bg-card text-foreground hover:bg-accent inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    <Layers3 size={18} aria-hidden="true" />
                                    Gerenciar seções
                                </button>
                            </div>
                        )}
                    </div>

                    {sectionsLoading || quizzesLoading ? (
                        <div role="status" className="flex flex-col items-center justify-center gap-3 py-12">
                            <LoaderCircle
                                size={28}
                                aria-hidden="true"
                                className="text-primary motion-safe:animate-spin"
                            />
                            <p className="text-muted-foreground text-sm">Carregando estrutura...</p>
                        </div>
                    ) : sections.length === 0 && quizzes.length === 0 ? (
                        <div className="flex flex-col items-center py-10 text-center sm:py-12">
                            <div className="bg-muted text-muted-foreground mb-4 flex size-16 items-center justify-center rounded-2xl">
                                <FolderOpen size={30} strokeWidth={1.5} aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-semibold">Coleção vazia</h3>
                            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                                Comece adicionando seções e quizzes para organizar sua coleção.
                            </p>
                            {isCreator && (
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsSectionsModalOpen(true)}
                                        className="border-border bg-card text-foreground hover:bg-accent rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                                    >
                                        Criar seção
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddQuizModalOpen(true)}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                                    >
                                        Adicionar quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sections.map((section) => {
                                const sectionQuizzes = getQuizzesBySection(section.id)
                                const isExpanded = expandedSections[section.id] === true

                                return (
                                    <SectionCard
                                        key={section.id}
                                        title={section.name}
                                        count={sectionQuizzes.length}
                                        expanded={isExpanded}
                                        onToggle={() => toggleSection(section.id)}
                                    >
                                        {sectionQuizzes.length > 0 ? (
                                            <div className="space-y-3">
                                                {sectionQuizzes.map((quiz) => (
                                                    <QuizListItem key={quiz.id} quiz={quiz} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground py-2 text-sm italic">
                                                Nenhum quiz nesta seção
                                            </p>
                                        )}
                                    </SectionCard>
                                )
                            })}

                            {quizzesSemSecao.length > 0 && (
                                <SectionCard
                                    title="Sem seção"
                                    description="Quizzes não organizados em seções"
                                    count={quizzesSemSecao.length}
                                    expanded={expandedSections['sem-secao'] === true}
                                    onToggle={() => toggleSection('sem-secao')}
                                >
                                    <div className="space-y-3">
                                        {quizzesSemSecao.map((quiz) => (
                                            <QuizListItem key={quiz.id} quiz={quiz} />
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Modais: mesmo comportamento do componente original */}
            {isCreator && (
                <>
                    <CollectionSettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        collection={collection}
                        onSave={handleSaveCollection}
                    />

                    <ConfirmDeleteModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteCollection}
                        title="Excluir Coleção"
                        message={`Tem certeza que deseja excluir "${collection.name}"?`}
                        isLoading={operationLoading}
                    />

                    <AddQuizToCollectionModal
                        isOpen={isAddQuizModalOpen}
                        onClose={() => setIsAddQuizModalOpen(false)}
                        collectionId={collection.id}
                    />

                    <ManageSectionsModal
                        isOpen={isSectionsModalOpen}
                        onClose={() => setIsSectionsModalOpen(false)}
                        collectionId={collection.id}
                    />
                </>
            )}
        </div>
    )
}
