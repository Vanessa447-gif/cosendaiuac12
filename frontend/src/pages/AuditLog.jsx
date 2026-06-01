import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import { 
    MagnifyingGlassIcon, 
    FunnelIcon,
    ArrowPathIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    PencilIcon,
    TrashIcon,
    ArrowUpTrayIcon,
    KeyIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const { user } = useAuth();
    const { language } = useLanguage();
    const { currentService } = useService();

    useEffect(() => {
        fetchLogs();
    }, [currentService]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const url = user?.role === 'admin' 
                ? 'http://localhost:5000/api/audit'
                : `http://localhost:5000/api/audit?service_id=${currentService?.id}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
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
            'connexion': { icon: KeyIcon, color: 'from-green-500 to-emerald-500', label: 'Connexion' },
            'login': { icon: KeyIcon, color: 'from-green-500 to-emerald-500', label: 'Connexion' },
            'upload': { icon: ArrowUpTrayIcon, color: 'from-blue-500 to-cyan-500', label: 'Upload' },
            'suppression': { icon: TrashIcon, color: 'from-red-500 to-rose-500', label: 'Suppression' },
            'consultation': { icon: EyeIcon, color: 'from-purple-500 to-pink-500', label: 'Consultation' },
            'modification': { icon: PencilIcon, color: 'from-yellow-500 to-orange-500', label: 'Modification' },
            'téléchargement': { icon: ArrowDownTrayIcon, color: 'from-teal-500 to-green-500', label: 'Téléchargement' }
        };
        return configs[action] || { icon: BuildingOfficeIcon, color: 'from-gray-500 to-gray-600', label: action };
    };

    const filteredLogs = logs.filter(log => {
        if (filterAction !== 'all' && log.action_fr !== filterAction && log.action_en !== filterAction) return false;
        if (search && !log.user_name?.toLowerCase().includes(search.toLowerCase()) && 
            !log.document_title_fr?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Journal d'audit</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {user?.role === 'admin' ? 'Traçabilité globale' : `Traçabilité - ${language === 'fr' ? currentService?.name_fr : currentService?.name_en}`}
                </p>
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
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all">
                    <ArrowPathIcon className="h-5 w-5 text-gray-500" />
                    Rafraîchir
                </button>
            </div>

            <p className="text-sm text-gray-500">{filteredLogs.length} activité(s)</p>

            {filteredLogs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <BuildingOfficeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune activité enregistrée</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredLogs.map((log, idx) => {
                        const config = getActionConfig(log.action_fr);
                        const Icon = config.icon;
                        return (
                            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">{log.user_name}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                                    {log.action_fr}
                                                </span>
                                                {log.service_name_fr && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                        <BuildingOfficeIcon className="h-3 w-3" />
                                                        {language === 'fr' ? log.service_name_fr : log.service_name_en}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        {log.document_title_fr && (
                                            <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                                                "{language === 'fr' ? log.document_title_fr : log.document_title_en}"
                                            </p>
                                        )}
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