import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import { 
    DocumentTextIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    UserGroupIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const { service, stats, loading } = useService();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Service non trouvé</p>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
        <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                </div>
                <div className="p-3 rounded-2xl" style={{ backgroundColor: `${service.color}20` }}>
                    <Icon className="h-6 w-6" style={{ color: service.color }} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header du service */}
            <div className="relative overflow-hidden rounded-2xl p-8 text-white" style={{ backgroundColor: service.color }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <span className="text-6xl">{service.icon}</span>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {language === 'fr' ? service.name_fr : service.name_en}
                        </h1>
                        <p className="opacity-90 mt-1">{service.code}</p>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Documents" value={stats?.totalDocuments || 0} icon={DocumentTextIcon} onClick={() => navigate('/documents')} />
                <StatCard title="Vues" value={stats?.totalViews || 0} icon={EyeIcon} />
                <StatCard title="Téléchargements" value={stats?.totalDownloads || 0} icon={ArrowDownTrayIcon} />
                <StatCard title="Utilisateurs" value={stats?.activeUsers || 0} icon={UserGroupIcon} />
            </div>

            {/* Documents par catégorie */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Documents par catégorie</h3>
                <div className="space-y-4">
                    {stats?.documentsByCategory?.map((cat) => (
                        <div key={cat.id}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{language === 'fr' ? cat.name_fr : cat.name_en}</span>
                                <span className="font-medium">{cat.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="h-2 rounded-full" style={{ width: `${(cat.count / stats.totalDocuments) * 100}%`, backgroundColor: cat.color }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;