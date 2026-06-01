import React from 'react';
import { useService } from '../contexts/ServiceContext';
import { useLanguage } from '../contexts/LanguageContext';
import { EyeIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon, KeyIcon } from '@heroicons/react/24/outline';

const AuditLog = () => {
    const { service, history, loading } = useService();
    const { language } = useLanguage();

    const getActionConfig = (action) => {
        const configs = {
            'connexion': { icon: KeyIcon, color: 'from-green-500 to-emerald-500', label: 'Connexion' },
            'upload': { icon: ArrowUpTrayIcon, color: 'from-blue-500 to-cyan-500', label: 'Upload' },
            'suppression': { icon: TrashIcon, color: 'from-red-500 to-rose-500', label: 'Suppression' },
            'consultation': { icon: EyeIcon, color: 'from-purple-500 to-pink-500', label: 'Consultation' },
            'modification': { icon: PencilIcon, color: 'from-yellow-500 to-orange-500', label: 'Modification' },
            'téléchargement': { icon: ArrowDownTrayIcon, color: 'from-teal-500 to-green-500', label: 'Téléchargement' }
        };
        return configs[action] || { icon: KeyIcon, color: 'from-gray-500 to-gray-600', label: action };
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Journal d'audit - {language === 'fr' ? service?.name_fr : service?.name_en}
                    </h1>
                    <p className="text-gray-500">Traçabilité complète des actions</p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <KeyIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Aucune activité enregistrée pour ce service</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((log) => {
                        const config = getActionConfig(log.action_fr);
                        const Icon = config.icon;
                        return (
                            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap justify-between items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{log.user_name}</span>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                                    {log.action_fr}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        {log.document_title && (
                                            <p className="mt-2 text-sm text-purple-600">"{log.document_title}"</p>
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