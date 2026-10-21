
import { Link } from 'react-router'
import { FolderOpen } from 'lucide-react'

import type { QuizCollection } from '@/types/quiz'

interface CollectionListItemProps {
    collection: QuizCollection
}

export function CollectionListItem({
    collection,
}: CollectionListItemProps) {
    const formattedDate = collection.createdAt?.toDate
        ? collection.createdAt.toDate().toLocaleDateString('pt-BR')
        : 'Data desconhecida'

    return (
        <Link
            to={`/collections/${collection.id}`}
            className="group border-border bg-card text-card-foreground hover:border-ring/50 flex min-w-0 flex-col rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:p-5"
        >
            {/* Cabeçalho */}
            <div className="flex min-w-0 items-start gap-3">
                <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <FolderOpen
                        size={21}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <h2 className="text-foreground text-base leading-snug font-semibold tracking-tight wrap-break-word sm:text-lg">
                        {collection.name}
                    </h2>

                    <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed sm:line-clamp-1">
                        {collection.description || 'Sem descrição'}
                    </p>
                </div>
            </div>

            {/* Informações */}
            <div className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4 sm:grid-cols-3 sm:gap-5">
                {/* Data */}
                <div className="min-w-0 space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                        Criada em
                    </p>

                    <p className="text-foreground text-sm font-medium">
                        {formattedDate}
                    </p>
                </div>

                {/* Quizzes */}
                <div className="min-w-0 space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                        Quizzes
                    </p>

                    <p className="text-foreground text-sm font-semibold">
                        {collection.quizCount ?? 0}
                    </p>
                </div>

                {/* Seções */}
                <div className="min-w-0 space-y-1.5">
                    <p className="text-muted-foreground text-xs">
                        Seções
                    </p>

                    <p className="text-foreground text-sm font-semibold">
                        {collection.sectionCount ?? 0}
                    </p>
                </div>
            </div>
        </Link>
    )
}
