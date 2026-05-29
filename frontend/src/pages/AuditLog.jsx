import React, { useState, useEffect } from 'react';
import { 
    MagnifyingGlassIcon, 
    FunnelIcon,
    ArrowPathIcon,
    UserCircleIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('all');

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/audit');
            const data = await response.json();
            if (data.success) setLogs(data.logs);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionConfig = (action) => {
        const configs = {
            'connexion': { icon: KeyIcon, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600', label: 'Connexion' },
            'login': { icon: KeyIcon, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600', label: 'Connexion' },
            'upload': { icon: ArrowUpTrayIcon, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600', label: 'Upload' },
            'suppression': { icon: TrashIcon, color: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600', label: 'Suppression' },
            'delete': { icon: TrashIcon, color: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600', label: 'Suppression' },
            'consultation': { icon: EyeIcon, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600', label: 'Consultation' },
            'view': { icon: EyeIcon, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600', label: 'Consultation' },
            'modification': { icon: PencilIcon, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600', label: 'Modification' },
            'update': { icon: PencilIcon, color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30', text: 'text-yellow-600', label: 'Modification' },
            'téléchargement': { icon: ArrowDownTrayIcon, color: 'from-teal-500 to-green-500', bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600', label: 'Téléchargement' },
            'download': { icon: ArrowDownTrayIcon, color: 'from-teal-500 to-green-500', bg: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600', label: 'Téléchargement' }
        };
        return configs[action] || { icon: ShieldCheckIcon, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50 dark:bg-gray-700', text: 'text-gray-600', label: action };
    };

    const filteredLogs = logs.filter(log => {
        if (filterAction !== 'all' && log.action_fr !== filterAction && log.action_en !== filterAction) return false;
        if (search && !log.user_name?.toLowerCase().includes(search.toLowerCase()) && 
            !log.document_name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const actionTypes = [
        { value: 'all', label: 'Toutes', icon: null },
        { value: 'connexion', label: 'Connexions', icon: KeyIcon },
        { value: 'upload', label: 'Uploads', icon: ArrowUpTrayIcon },
        { value: 'consultation', label: 'Consultations', icon: EyeIcon },
        { value: 'suppression', label: 'Suppressions', icon: TrashIcon },
        { value: 'modification', label: 'Modifications', icon: PencilIcon },
        { value: 'téléchargement', label: 'Téléchargements', icon: ArrowDownTrayIcon },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Journal d'audit</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Traçabilité complète des actions</p>
            </div>

            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par utilisateur ou document..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {actionTypes.map((action) => (
                        <button
                            key={action.value}
                            onClick={() => setFilterAction(action.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                                filterAction === action.value 
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 shadow'
                            }`}
                        >
                            {action.icon && <action.icon className="h-4 w-4" />}
                            {action.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchLogs}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all"
                >
                    <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                    <span className="hidden md:inline">Rafraîchir</span>
                </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {filteredLogs.length} activité(s) trouvée(s)
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Mise à jour en temps réel</span>
                </div>
            </div>

            {/* Timeline */}
            {filteredLogs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <ShieldCheckIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune activité enregistrée</p>
                    <p className="text-sm text-gray-400 mt-1">Les actions des utilisateurs apparaîtront ici</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map((log, idx) => {
                        const config = getActionConfig(log.action_fr);
                        const Icon = config.icon;
                        return (
                            <div key={log.id} className="group relative">
                                {/* Timeline line */}
                                {idx !== filteredLogs.length - 1 && (
                                    <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 group-last:hidden"></div>
                                )}
                                
                                <div className="relative flex gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-lg transition-all">
                                    {/* Timeline dot */}
                                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">{log.user_name || 'Utilisateur'}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        
                                        {log.document_name && (
                                            <div className="mt-2 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                                                <DocumentTextIcon className="h-4 w-4" />
                                                <span>{log.document_name}</span>
                                            </div>
                                        )}
                                        
                                        <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                                            <span>IP: {log.ip_address || '127.0.0.1'}</span>
                                            {log.details && <span>• {log.details}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AuditLog;