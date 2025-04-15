interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm max-w-2xl mx-auto">
            <div className="flex items-center justify-center w-full mb-4">
                <div className="text-gray-400 dark:text-gray-500">
                    {icon || (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                </div>
            </div>
            <div className="w-full text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 mx-auto max-w-md">
                    {description}
                </p>
            </div>
            {action && (
                <div className="flex justify-center w-full">
                    {action}
                </div>
            )}
        </div>
    );
}