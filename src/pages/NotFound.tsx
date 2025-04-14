import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4 transition-colors duration-200">
            <div className="text-center animate-fadeIn">
                <h1 className="text-9xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
                    Página Não Encontrada
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md">
                    Desculpe, mas a página que você está procurando não existe ou foi movida.
                </p>
                <button
                    onClick={handleGoHome}
                    className="px-6 py-3 cursor-pointer bg-blue-600 dark:bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors duration-200"
                >
                    Voltar para Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;