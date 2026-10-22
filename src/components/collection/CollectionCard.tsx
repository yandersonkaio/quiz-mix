
import { FolderOpen, Globe2, Star } from 'lucide-react'
import { Link } from 'react-router'

import type { QuizCollection } from '@/types/quiz'

interface CollectionCardProps {
    collection: QuizCollection
}

export function CollectionCard({ collection }: CollectionCardProps) {
    const formattedDate = collection.createdAt?.toDate
        ? new Date(collection.createdAt.toDate()).toLocaleDateString('pt-BR')
        : 'Data desconhecida'

    const label = collection.isOwner
        ? 'Minha coleção'
        : collection.isFavorite
            ? 'Favorita'
            : 'Coleção pública'

    const Icon = collection.isOwner
        ? FolderOpen
        : collection.isFavorite
            ? Star
            : Globe2

    const statusColors = collection.isOwner
        ? 'border-answer-selected-foreground/20 bg-answer-selected text-answer-selected-foreground'
        : collection.isFavorite
            ? 'border-answer-correct-foreground/20 bg-answer-correct text-answer-correct-foreground'
            : 'border-border bg-muted text-muted-foreground'

    return (
        <Link
            to={`/collections/${collection.id}`}
            className="group border-border bg-card text-card-foreground hover:border-ring/50 flex h-full min-w-0 flex-col rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-6"
        >
            {/* Cabeçalho */}
            <div className="flex-1">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                        <Icon
                            size={21}
                            strokeWidth={1.8}
                            aria-hidden="true"
                            className="text-muted-foreground mt-0.5 shrink-0"
                        />

                        <h2 className="min-w-0 flex-1 text-lg leading-snug font-semibold tracking-tight wrap-break-word sm:text-xl">
                            {collection.name}
                        </h2>
                    </div>

                    <span
                        className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${statusColors}`}
                    >
                        {label}
                    </span>
                </div>

                <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {collection.description || 'Sem descrição'}
                </p>
            </div>

            {/* Informações */}
            <div className="border-border mt-6 border-t pt-4">
                <div className="mb-5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                            Quizzes
                        </p>

                        <p className="text-foreground text-sm font-semibold">
                            {collection.quizCount ?? 0}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">
                            Seções
                        </p>

                        <p className="text-foreground text-sm font-semibold">
                            {collection.sectionCount ?? 0}
                        </p>
                    </div>
                </div>

                {/* Rodapé */}
                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs">
                    <span>
                        Criada em {formattedDate}
                    </span>

                    <div className="flex min-w-0 max-w-full items-center gap-2">
                        {collection.creator?.photoURL ? (
                            <img
                                src={collection.creator.photoURL}
                                alt=""
                                className="size-6 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {collection.creator?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}

                        <span className="max-w-32 truncate font-medium sm:max-w-40">
                            {collection.creator?.name || 'Usuário'}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
