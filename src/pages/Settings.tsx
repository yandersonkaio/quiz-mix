import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const handleThemeChange = (selected: 'light' | 'dark') => {
        setTheme(selected);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 ml-12 md:ml-0 text-gray-800 dark:text-white">Aparência</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div
                    onClick={() => handleThemeChange('light')}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-colors duration-300
                        ${theme === 'light'
                            ? 'border-green-500 bg-white dark:bg-gray-100'
                            : 'border-transparent bg-gray-100 dark:bg-gray-700'}
                        hover:border-green-400`}
                >
                    <div className="w-full h-28 bg-gray-200 rounded-lg mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tema claro</h3>
                </div>

                <div
                    onClick={() => handleThemeChange('dark')}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-colors duration-300
                        ${theme === 'dark'
                            ? 'border-green-500 bg-white dark:bg-gray-800'
                            : 'border-transparent bg-gray-100 dark:bg-gray-700'}
                        hover:border-green-400`}
                >
                    <div className="w-full h-28 bg-gray-900 rounded-lg mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Tema escuro</h3>
                </div>
            </div>
        </div>
    );
};

export default Settings;
