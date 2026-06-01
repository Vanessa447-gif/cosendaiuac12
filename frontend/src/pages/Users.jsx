import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { UserCircleIcon, EnvelopeIcon, BuildingOfficeIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const { language } = useLanguage();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Erreur fetch users:', error);
            toast.error('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const getRoleConfig = (role) => {
        const roles = {
            'admin': { fr: 'Administrateur', en: 'Administrator', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
            'archiviste': { fr: 'Archiviste', en: 'Archivist', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
            'consultant': { fr: 'Consultant', en: 'Consultant', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
        };
        return roles[role] || roles.consultant;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👥 Gestion des utilisateurs</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{users.length} utilisateur(s) dans ce service</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {users.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    return (
                        <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                            <div className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                        {user.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {user.full_name}
                                            {user.id === currentUser?.id && (
                                                <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Vous</span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${roleConfig.color}`}>
                                            {language === 'fr' ? roleConfig.fr : roleConfig.en}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <EnvelopeIcon className="h-4 w-4" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <BuildingOfficeIcon className="h-4 w-4" />
                                        <span>{user.department || 'Registrariat'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Inscrit le {new Date(user.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Users;