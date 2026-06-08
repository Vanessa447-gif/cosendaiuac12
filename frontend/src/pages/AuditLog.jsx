import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useService } from '../contexts/ServiceContext';
import { EyeIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon, KeyIcon } from '@heroicons/react/24/outline';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { service } = useService();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/audit', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setLogs(data.logs || []);
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            'connexion': <KeyIcon className="h-5 w-5" />,
            'login': <KeyIcon className="h-5 w-5" />,
            'upload': <ArrowUpTrayIcon className="h-5 w-5" />,
            'suppression': <TrashIcon className="h-5 w-5" />,
            'consultation': <EyeIcon className="h-5 w-5" />,
            'view': <EyeIcon className="h-5 w-5" />,
            'téléchargement': <ArrowDownTrayIcon className="h-5 w-5" />,
            'download': <ArrowDownTrayIcon className="h-5 w-5" />,
            'modification': <PencilIcon className="h-5 w-5" />
        };
        return icons[action] || <KeyIcon className="h-5 w-5" />;
    };

    const getActionColor = (action) => {
        const colors = {
            'connexion': 'bg-green-100 text-green-600',
            'login': 'bg-green-100 text-green-600',
            'upload': 'bg-blue-100 text-blue-600',
            'suppression': 'bg-red-100 text-red-600',
            'consultation': 'bg-purple-100 text-purple-600',
            'view': 'bg-purple-100 text-purple-600',
            'téléchargement': 'bg-teal-100 text-teal-600',
            'download': 'bg-teal-100 text-teal-600'
        };
        return colors[action] || 'bg-gray-100 text-gray-600';
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
            <div className="flex items-center gap-3">
                <span className="text-3xl">{service?.icon}</span>
                <div>
                    <h1 className="text-2xl font-bold">📋 Journal d'audit</h1>
                    <p className="text-gray-500">Traçabilité des actions - {logs.length} action(s)</p>
                </div>
            </div>

            {logs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <KeyIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune activité enregistrée</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div key={log.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${getActionColor(log.action_fr)}`}>
                                    {getActionIcon(log.action_fr)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <div>
                                            <span className="font-semibold">{log.user_name || 'Utilisateur'}</span>
                                            <span className="mx-2">•</span>
                                            <span className="capitalize">{log.action_fr}</span>
                                            {log.document_name && (
                                                <span className="text-purple-600 ml-1">"{log.document_name}"</span>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuditLog;