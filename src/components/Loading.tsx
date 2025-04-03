const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="relative">
                <div className="w-16 h-16 border-6 border-primary border-t-transparent text-purple-400 rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Loading;