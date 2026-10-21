
import { useState } from 'react'
import { Link } from 'react-router'
import { LayoutGrid, List, Plus } from 'lucide-react'

import { useUserQuizzes } from '../hooks/useUserQuizzes'
import Loading from '../components/Loading'
import { QuizSettingsModal } from '../components/quiz/QuizSettingsModal'
import { QuizCard } from '../components/quiz/QuizCard'
import { EmptyState } from '../components/quiz/EmptyState'
import { QuizListItem } from '../components/quiz/QuizListItem'

type ViewMode = 'grid' | 'list'

export default function MyQuizzes() {
    const { userQuizzes, loading, error, user } = useUserQuizzes()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
                <div className="border-destructive/20 bg-destructive/10 w-full max-w-lg rounded-xl border p-6 text-center">
                    <h2 className="text-destructive mb-2 text-lg font-semibold">
                        Erro ao carregar seus quizzes
                    </h2>

                    <p className="text-destructive text-sm">
                        {error.message}
                    </p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
                <EmptyState
                    title="Faça login para continuar"
                    description="Entre na sua conta para visualizar e gerenciar seus quizzes."
                    action={
                        <Link
                            to="/login"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-colors"
                        >
                            Entrar
                        </Link>
                    }
                />
            </div>
        )
    }

    return (
        <div className="bg-background text-foreground min-h-full w-full">
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

                {/* Cabeçalho */}
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Meus Quizzes
                        </h1>

                        <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                            {userQuizzes.length}{' '}
                            {userQuizzes.length === 1 ? 'quiz criado' : 'quizzes criados'}
                        </p>
                    </div>

                    {/* Ações */}
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        <button
                            type="button"
                            onClick={() =>
                                setViewMode((current) =>
                                    current === 'grid' ? 'list' : 'grid'
                                )
                            }
                            title={
                                viewMode === 'grid'
                                    ? 'Alternar para visualização em lista'
                                    : 'Alternar para visualização em grade'
                            }
                            aria-label={
                                viewMode === 'grid'
                                    ? 'Visualizar em lista'
                                    : 'Visualizar em grade'
                            }
                            className="border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                            {viewMode === 'grid' ? (
                                <List size={19} strokeWidth={1.8} />
                            ) : (
                                <LayoutGrid size={19} strokeWidth={1.8} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none sm:flex-none"
                        >
                            <Plus size={18} strokeWidth={2} />
                            Criar quiz
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                {userQuizzes.length === 0 ? (
                    <EmptyState
                        title="Você ainda não criou nenhum quiz"
                        description="Comece criando seu primeiro quiz para compartilhar com seus alunos ou amigos."
                        action={
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors"
                            >
                                <Plus size={18} />
                                Criar primeiro quiz
                            </button>
                        }
                    />
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                        {userQuizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {userQuizzes.map((quiz) => (
                            <QuizListItem
                                key={quiz.id}
                                quiz={quiz}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de criação */}
            <QuizSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isCreating={true}
            />
        </div>
    )
}
