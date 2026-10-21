
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

import Loading from '../components/Loading'
import { useAllQuizzes } from '../hooks/useAllQuizzes'
import { useAllCollections } from '../hooks/useAllCollections'
import { QuizCard } from '../components/quiz/QuizCard'
import { CollectionCard } from '../components/collection/CollectionCard'
import { EmptyState } from '../components/quiz/EmptyState'

type ExploreTab = 'quizzes' | 'collections'

export default function Explore() {
    const {
        allQuizzes,
        loading: quizzesLoading,
        error: quizzesError,
    } = useAllQuizzes()

    const {
        collections,
        loading: collectionsLoading,
        error: collectionsError,
    } = useAllCollections()

    const [activeTab, setActiveTab] = useState<ExploreTab>('quizzes')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredQuizzes = useMemo(() => {
        const term = searchTerm.toLowerCase()

        return allQuizzes.filter(
            (quiz) =>
                quiz.name.toLowerCase().includes(term) ||
                quiz.description?.toLowerCase().includes(term) ||
                quiz.creator?.name.toLowerCase().includes(term)
        )
    }, [allQuizzes, searchTerm])

    const filteredCollections = useMemo(() => {
        const term = searchTerm.toLowerCase()

        return collections.filter(
            (collection) =>
                collection.name.toLowerCase().includes(term) ||
                collection.description?.toLowerCase().includes(term)
        )
    }, [collections, searchTerm])

    const loading = quizzesLoading || collectionsLoading
    const error = quizzesError || collectionsError

    if (loading) {
        return <Loading />
    }

    if (error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
                <div className="border-destructive/20 bg-destructive/10 w-full max-w-lg rounded-xl border p-6 text-center">
                    <h2 className="text-destructive mb-2 text-lg font-semibold">
                        Erro ao carregar conteúdo
                    </h2>

                    <p className="text-destructive text-sm">
                        {error.message}
                    </p>
                </div>
            </div>
        )
    }

    const showQuizzes = activeTab === 'quizzes'

    return (
        <div className="bg-background text-foreground w-full min-h-full">
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

                {/* Cabeçalho da página */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Explorar
                    </h1>

                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                        Encontre quizzes e coleções criadas pela comunidade.
                    </p>
                </div>

                {/* Filtros e pesquisa */}
                <div className="mb-7 space-y-5">

                    {/* Abas */}
                    <div
                        role="group"
                        aria-label="Tipo de conteúdo"
                        className="bg-muted inline-flex items-center gap-1 rounded-xl p-1"
                    >
                        <button
                            type="button"
                            aria-pressed={showQuizzes}
                            onClick={() => setActiveTab('quizzes')}
                            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${showQuizzes
                                    ? 'bg-card text-card-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Quizzes
                        </button>

                        <button
                            type="button"
                            aria-pressed={!showQuizzes}
                            onClick={() => setActiveTab('collections')}
                            className={`rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 ${!showQuizzes
                                    ? 'bg-card text-card-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Coleções
                        </button>
                    </div>

                    {/* Campo de pesquisa */}
                    <div className="relative">
                        <Search
                            size={19}
                            aria-hidden="true"
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
                        />

                        <label htmlFor="explore-search" className="sr-only">
                            {showQuizzes
                                ? 'Pesquisar quizzes'
                                : 'Pesquisar coleções'}
                        </label>

                        <input
                            id="explore-search"
                            type="search"
                            placeholder={
                                showQuizzes
                                    ? 'Pesquisar quizzes...'
                                    : 'Pesquisar coleções...'
                            }
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 h-12 w-full rounded-xl border pr-12 pl-11 text-sm outline-none transition-colors focus-visible:ring-2 [&::-webkit-search-cancel-button]:hidden"
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                aria-label="Limpar pesquisa"
                                onClick={() => setSearchTerm('')}
                                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg transition-colors"
                            >
                                <X size={17} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Conteúdo */}
                {showQuizzes ? (
                    filteredQuizzes.length === 0 ? (
                        <EmptyState
                            title="Nenhum quiz encontrado"
                            description="Não existem quizzes disponíveis."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                            {filteredQuizzes.map((quiz) => (
                                <QuizCard
                                    key={quiz.id}
                                    quiz={quiz}
                                />
                            ))}
                        </div>
                    )
                ) : (
                    filteredCollections.length === 0 ? (
                        <EmptyState
                            title="Nenhuma coleção encontrada"
                            description="Não existem coleções disponíveis."
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                            {filteredCollections.map((collection) => (
                                <CollectionCard
                                    key={collection.id}
                                    collection={collection}
                                />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
