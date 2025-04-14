import { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./SideBar";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isPublicRoute = location.pathname === "/login";
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {!isPublicRoute && (
                <Sidebar
                    isOpen={sidebarOpen}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />
            )}
            <main
                className={`flex-1 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white duration-300 ease-in-out
          ${!isPublicRoute ? "md:ml-20 lg:ml-72" : ""}`}
            >
                {children}
            </main>
        </div>
    );
};

export default MainLayout;