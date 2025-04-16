import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-200">
            <p className="text-center text-lg">{message}</p>
        </div>
    );
};

export default ErrorMessage;