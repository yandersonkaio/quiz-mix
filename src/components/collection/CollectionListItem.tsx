import { Link } from "react-router-dom";
import { HiOutlineFolder } from "react-icons/hi2";
import { QuizCollection } from "@/types/quiz";

interface CollectionListItemProps {
    collection: QuizCollection;
}

export function CollectionListItem({ collection }: CollectionListItemProps) {
    const formattedDate = collection.createdAt?.toDate
        ? new Date(collection.createdAt.toDate()).toLocaleDateString("pt-BR")
        : "Data desconhecida";

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <Link
                to={`/collections/${collection.id}`}
                className="block"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <HiOutlineFolder className="w-7 h-7 mt-1 text-blue-600 dark:text-blue-400 shrink-0" />

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {collection.name}
                            </h2>

                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                                {collection.description || "Sem descrição"}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Criada em {formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 text-sm">
                        <div className="text-center min-w-[70px]">
                            <div className="text-gray-500 dark:text-gray-400">
                                Quizzes
                            </div>

                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                                {collection.quizCount ?? 0}
                            </div>
                        </div>

                        <div className="text-center min-w-[70px]">
                            <div className="text-gray-500 dark:text-gray-400">
                                Seções
                            </div>

                            <div className="font-semibold text-green-600 dark:text-green-400">
                                {collection.sectionCount ?? 0}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}