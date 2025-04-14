import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    FaBars,
    FaTimes,
    FaRegListAlt,
    FaRegUserCircle,
    FaSignOutAlt,
    FaRegCompass,
} from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import Logo from '../assets/logo.svg';
import LogoSmall from '../assets/logo-small.svg';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogoutClick = async () => {
        try {
            await logout();
            navigate('/login');
            toggleSidebar();
        } catch (error) {
            console.error('Sidebar - logout error:', error);
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
                className={`fixed top-0 left-0 h-full bg-gray-800 text-white transform transition-all duration-300 ease-in-out z-40 overflow-y-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 
                w-72 md:w-20 lg:w-72 flex flex-col p-3 md:p-2 lg:p-3`}
            >
                <div className="flex justify-center p-2">
                    <Link to="/">
                        <img
                            src={Logo}
                            className="w-48 h-14 md:hidden lg:block transition-opacity duration-300 ease-in-out"
                            alt="Logo"
                        />
                        <img
                            src={LogoSmall}
                            className="w-10 h-10 hidden md:block lg:hidden transition-opacity duration-300 ease-in-out"
                            alt="Logo Small"
                        />
                    </Link>
                </div>
                <nav className="flex-1 flex items-center">
                    <ul className="w-full space-y-2">
                        <li>
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-5 md:px-0 md:justify-center lg:px-5 lg:justify-start rounded-md hover:bg-gray-700 transition-all duration-300 ease-in-out ${isActive ? 'text-purple-400 font-bold' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaRegCompass className="mr-3 md:mr-0 lg:mr-3 w-6 h-6 transition-all duration-300 ease-in-out" />
                                <span className="md:hidden lg:inline transition-opacity duration-300 ease-in-out">Explorar</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/my-quizzes"
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-5 md:px-0 md:justify-center lg:px-5 lg:justify-start rounded-md hover:bg-gray-700 transition-all duration-300 ease-in-out ${isActive ? 'text-purple-400 font-bold' : 'text-gray-300'
                                    }`
                                }
                            >
                                <FaRegListAlt className="mr-3 md:mr-0 lg:mr-3 w-6 h-6 transition-all duration-300 ease-in-out" />
                                <span className="md:hidden lg:inline transition-opacity duration-300 ease-in-out">Meus quizzes</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/create-quiz"
                                className={({ isActive }) =>
                                    `flex items-center py-3 px-5 md:px-0 md:justify-center lg:px-5 lg:justify-start rounded-md hover:bg-gray-700 transition-all duration-300 ease-in-out ${isActive ? 'text-purple-400 font-bold' : 'text-gray-300'
                                    }`
                                }
                            >
                                <IoMdAdd className="mr-3 md:mr-0 lg:mr-3 w-6 h-6 transition-all duration-300 ease-in-out" />
                                <span className="md:hidden lg:inline transition-opacity duration-300 ease-in-out">Criar quiz</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className="mt-auto">
                    <hr className="mb-4 border-t-2 border-gray-600" />
                    {user ? (
                        <div className="p-4 md:p-2 lg:p-4 flex items-center justify-between md:justify-center lg:justify-between space-x-2 transition-all duration-300 ease-in-out">
                            {user.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    className="w-8 h-8 rounded-full object-cover"
                                    alt="User avatar"
                                />
                            ) : (
                                <FaRegUserCircle className="w-8 h-8 text-gray-400" />
                            )}
                            <div className="flex flex-col mr-5 md:hidden lg:flex transition-opacity duration-300 ease-in-out">
                                <span className="text-sm truncate">{user.displayName}</span>
                                <span className="text-xs truncate text-gray-400">{user.email}</span>
                            </div>
                            <button onClick={handleLogoutClick} className="focus:outline-none">
                                <FaSignOutAlt className="cursor-pointer w-6 h-6 text-gray-300 hover:text-gray-200" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 md:p-2 lg:p-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center w-full text-gray-300 hover:text-gray-200"
                            >
                                <FaRegUserCircle className="w-6 h-6 mr-3 md:mr-0 lg:mr-3" />
                                <span className="md:hidden cursor-pointer lg:inline">Login</span>
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