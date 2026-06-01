import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import ServiceSwitcher from './ServiceSwitcher';
import { motion } from 'framer-motion';
import { 
    Bars3Icon, 
    XMarkIcon,
    SunIcon,
    MoonIcon,
    GlobeAltIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
    BellIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const { currentService } = useService();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left section */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                        </button>

                        <Link to="/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">R</span>
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {language === 'fr' ? 'SAE Cosendai' : 'Cosendai EAS'}
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {language === 'fr' ? 'Plateforme multi-services' : 'Multi-service platform'}
                                </p>
                            </div>
                        </Link>

                        {/* Service Switcher */}
                        <ServiceSwitcher />
                    </div>

                    {/* Right section */}
                    <div className="flex items-center gap-3">
                        {/* Service indicator */}
                        {currentService && (
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <span className="text-lg">{currentService.icon}</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {language === 'fr' ? currentService.name_fr : currentService.name_en}
                                </span>
                            </div>
                        )}

                        {/* Language Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleLanguage}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            <GlobeAltIcon className="h-5 w-5" />
                            <span className="ml-1 text-sm font-medium hidden sm:inline">{language.toUpperCase()}</span>
                        </motion.button>

                        {/* Theme Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                        </motion.button>

                        {/* User Menu */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                                    {getInitials(user?.full_name)}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                            </motion.button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                                        {t('logout')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;