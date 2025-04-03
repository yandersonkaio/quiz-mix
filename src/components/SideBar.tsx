import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../db/firebase';
import { User } from 'firebase/auth';
import {
    FaBars,
    FaTimes,
    FaRegListAlt,
    FaRegUserCircle,
    FaSignOutAlt,
    FaRegCompass
} from 'react-icons/fa';
import { IoMdAdd } from "react-icons/io";
import Logo from '../assets/logo.svg';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    user: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, user }) => {
    const navigate = useNavigate();

    const handleLogout = async (): Promise<void> => {
        try {
            await auth.signOut();
            navigate("/login");
            toggleSidebar();
        } catch (error) {
            console.error("Erro ao deslogar:", (error as Error).message);
        }
    };

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 text-gray-800 p-2"
                onClick={toggleSidebar}
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <div
                className={`fixed top-0 left-0 h-full p-3 bg-gray-800 text-white w-72 transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 flex flex-col`}
            >
                <div className="flex justify-center p-2">
                    <Link to="/">
                        <img src={Logo} className="w-48 h-14" alt="Logo" />
                    </Link>
                </div>
                <nav className="flex-1 flex items-center">
                    <ul className="w-full space-y-2">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-5 rounded-md hover:bg-gray-700 transition-colors duration-200 ${isActive ? ' text-purple-400 font-bold' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaRegCompass className="mr-3 w-6 h-6" />
                                <span>Explorar</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/my-quizzes"
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-5 rounded-md hover:bg-gray-700 transition-colors duration-200 ${isActive ? 'text-purple-400 font-bold' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaRegListAlt className="mr-3 w-6 h-6" />
                                <span>Meus quizzes</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/create-quiz"
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-5 rounded-md hover:bg-gray-700 transition-colors duration-200 ${isActive ? 'text-purple-400 font-bold' : 'text-gray-300'
                                    }`
                                }
                            >
                                <IoMdAdd className="mr-3 w-6 h-6" />
                                <span>Criar quiz</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="mt-auto">
                    <hr className="mb-4 border-t-2 border-gray-600" />
                    {user && (
                        <div className="p-4 flex items-center space-x-2">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <FaRegUserCircle className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="flex flex-col mr-5">
                                <span className="text-sm truncate">{user.displayName}</span>
                                <span className="text-xs truncate text-gray-400">{user.email}</span>
                            </div>

                            <button onClick={handleLogout} className="focus:outline-none">
                                <FaSignOutAlt className="cursor-pointer w-6 h-6 text-gray-300 hover:text-gray-200" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;