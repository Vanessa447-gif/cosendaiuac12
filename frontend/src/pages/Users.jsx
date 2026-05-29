import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    UserPlusIcon, 
    PencilIcon, 
    TrashIcon, 
    KeyIcon,
    XMarkIcon,
    CheckIcon,
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        role: 'consultant',
        department: 'Registrariat'
    });
    const { user: currentUser, token } = useAuth();
    const { language } = useLanguage();

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) setUsers(data.users || []);
        } catch (error) {
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({
            username: '', password: '', full_name: '', email: '',
            role: 'consultant', department: 'Registrariat'
        });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            department: user.department || 'Registrariat'
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = editingUser 
            ? `http://localhost:5000/api/admin/users/${editingUser.id}`
            : 'http://localhost:5000/api/admin/users';
        const method = editingUser ? 'PUT' : 'POST';
        
        const dataToSend = editingUser 
            ? { full_name: formData.full_name, email: formData.email, role: formData.role, department: formData.department, is_active: 1 }
            : formData;
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dataToSend)
            });
            const data = await response.json();
            
            if (data.success) {
                toast.success(editingUser ? 'Utilisateur modifié' : 'Utilisateur créé');
                setShowModal(false);
                fetchUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Erreur lors de l\'opération');
        }
    };

    const handleDelete = async (user) => {
        if (user.id === currentUser?.id) {
            toast.error('Vous ne pouvez pas supprimer votre propre compte');
            return;
        }
        if (!window.confirm(`Supprimer ${user.full_name} ?`)) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Utilisateur supprimé');
                fetchUsers();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const resetPassword = async (user) => {
        const newPassword = prompt('Nouveau mot de passe :');
        if (!newPassword || newPassword.length < 4) {
            toast.error('Mot de passe trop court (min 4 caractères)');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${user.id}/reset-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ new_password: newPassword })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(`Mot de passe de ${user.full_name} réinitialisé`);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const getRoleConfig = (role) => {
        const roles = {
            'admin': { fr: 'Administrateur', en: 'Administrator', color: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600', icon: '👑' },
            'archiviste': { fr: 'Archiviste', en: 'Archivist', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600', icon: '📁' },
            'consultant': { fr: 'Consultant', en: 'Consultant', color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600', icon: '👀' }
        };
        return roles[role] || roles.consultant;
    };

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👥 Gestion des utilisateurs</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Créez, modifiez et gérez les permissions</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                    <UserPlusIcon className="h-5 w-5" />
                    Nouvel utilisateur
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500 transition-all"
                />
            </div>

            {/* Users Grid */}
            {filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <UserCircleIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucun utilisateur trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredUsers.map((u) => {
                        const roleConfig = getRoleConfig(u.role);
                        return (
                            <div key={u.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <div className={`h-2 bg-gradient-to-r ${roleConfig.color}`}></div>
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleConfig.color} flex items-center justify-center shadow-lg`}>
                                                <span className="text-2xl">{roleConfig.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                    {u.full_name}
                                                    {u.id === currentUser?.id && (
                                                        <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Vous</span>
                                                    )}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400">@{u.username}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}>
                                            {language === 'fr' ? roleConfig.fr : roleConfig.en}
                                        </span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <EnvelopeIcon className="h-4 w-4" />
                                            <span className="truncate">{u.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <BuildingOfficeIcon className="h-4 w-4" />
                                            <span>{u.department || 'Registrariat'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <CalendarIcon className="h-4 w-4" />
                                            <span>{new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <ShieldCheckIcon className="h-4 w-4" />
                                            <span>ID: #{u.id}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(u)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            title="Modifier"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => resetPassword(u)}
                                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all"
                                            title="Réinitialiser le mot de passe"
                                        >
                                            <KeyIcon className="h-5 w-5" />
                                        </button>
                                        {u.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleDelete(u)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Création/Modification */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
                        
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!editingUser && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Nom d'utilisateur *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.username}
                                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Mot de passe *
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom complet *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Rôle
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="admin">👑 Administrateur</option>
                                        <option value="archiviste">📁 Archiviste</option>
                                        <option value="consultant">👀 Consultant</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Département
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                                        className="w-full px-4 py-2 border rounded-xl dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                                    >
                                        {editingUser ? 'Enregistrer' : 'Créer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;