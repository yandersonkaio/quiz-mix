import React, { useState } from "react";
import Sidebar from "../components/SideBar";
import { Outlet } from "react-router-dom";

const PrivateLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main
                className="flex-1 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white duration-300 ease-in-out md:ml-20 lg:ml-72"
            >
                <Outlet />
            </main>
        </div>
    );
};

export default PrivateLayout;