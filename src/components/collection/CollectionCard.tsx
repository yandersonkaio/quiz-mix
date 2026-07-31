import { Link } from "react-router-dom";
import { QuizCollection } from "@/types/quiz";

interface CollectionCardProps {
    collection: QuizCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
    const formattedDate = collection.createdAt?.toDate
        ? new Date(collection.createdAt.toDate()).toLocaleDateString("pt-BR")
        : "Data desconhecida";

    const label = collection.isOwner
        ? "Minha coleção"
        : collection.isFavorite
            ? "Favorita"
            : "Coleção pública";

    const icon = collection.isOwner
        ? "📁"
        : collection.isFavorite
            ? "⭐"
            : "🌎";

    return (
        <Link
            to={`/collections/${collection.id}`}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full"
        >
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                        {icon}
                    </span>

                    <div className="flex-1 min-n-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                            {collection.name}
                        </h2>

                        <span
                            className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium ${collection.isOwner
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : collection.isFavorite
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                        >
                            {label}
                        </span>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 line-clamp-2">
                    {collection.description || "Sem descrição"}
                </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">
                            Quizzes
                        </span>

                        <span className="block font-semibold text-blue-600 dark:text-blue-400">
                            {collection.quizCount ?? 0}
                        </span>
                    </div>

                    <div>
                        <span className="text-gray-500 dark:text-gray-400">
                            Seções
                        </span>

                        <span className="block font-semibold text-green-600 dark:text-green-400">
                            {collection.sectionCount ?? 0}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        Criada em {formattedDate}
                    </span>

                    <div className="flex items-center gap-1">
                        {collection.creator?.photoURL ? (
                            <img
                                src={collection.creator.photoURL}
                                alt={collection.creator.name}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-xs text-gray-500 dark:text-gray-300">
                                    {collection.creator?.name?.charAt(0)?.toUpperCase() || "U"}
                                </span>
                            </div>
                        )}

                        <span className="font-medium">
                            {collection.creator?.name || "Usuário"}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}