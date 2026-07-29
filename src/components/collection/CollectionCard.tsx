import { Link } from "react-router-dom";
import { QuizCollection } from "@/types/quiz";

interface CollectionCardProps {
    collection: QuizCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
    const formattedDate = collection.createdAt?.toDate
        ? new Date(collection.createdAt.toDate()).toLocaleDateString("pt-BR")
        : "Data desconhecida";

    return (
        <Link
            to={`/collections/${collection.id}`}
            className="flex flex-col bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700 transition-all duration-200 h-full"
        >
            <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📁</span>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {collection.name}
                    </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
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
                    <span>Criada em {formattedDate}</span>
                </div>
            </div>
        </Link>
    );
}