import React from "react";
import { Outlet } from "react-router-dom";

const PublicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default PublicLayout;