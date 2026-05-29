import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { HomeIcon, DocumentTextIcon, CloudArrowUpIcon, UsersIcon, ClockIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Sidebar = ({ open }) => {
    const { user } = useAuth();
    const { t } = useLanguage();

    const menuItems = [
        { path: '/dashboard', icon: HomeIcon, label: 'dashboard', roles: ['admin', 'archiviste', 'consultant'] },
        { path: '/documents', icon: DocumentTextIcon, label: 'documents', roles: ['admin', 'archiviste', 'consultant'] },
        { path: '/upload', icon: CloudArrowUpIcon, label: 'upload', roles: ['admin', 'archiviste'] },
        { path: '/users', icon: UsersIcon, label: 'users', roles: ['admin'] },
        { path: '/audit', icon: ClockIcon, label: 'Audit', roles: ['admin', 'archiviste'] },
        { path: '/settings', icon: Cog6ToothIcon, label: 'settings', roles: ['admin', 'archiviste', 'consultant'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 z-40 ${open ? 'w-64' : 'w-20'}`}>
            <nav className="h-full overflow-y-auto p-4">
                {filteredMenu.map((item) => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) => `
                        flex items-center px-3 py-3 rounded-lg mb-2 transition-all duration-200
                        ${isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                    `}>
                        <item.icon className={`h-6 w-6 flex-shrink-0 ${!open && 'mx-auto'}`} />
                        {open && <span className="ml-3 text-sm font-medium">{t(item.label)}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;