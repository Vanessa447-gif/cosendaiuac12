import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useService } from '../contexts/ServiceContext';
import { 
    DocumentTextIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    UserGroupIcon,
    BuildingOfficeIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [globalStats, setGlobalStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { language } = useLanguage();
    const { currentService, services } = useService();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentService) {
            loadStats();
        }
        if (user?.role === 'admin') {
            loadGlobalStats();
        }
    }, [currentService]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/stats/service/${currentService.id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadGlobalStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/stats/global', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) setGlobalStats(data.stats);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const weeklyData = [
        { day: 'Lun', documents: 12, vues: 45 },
        { day: 'Mar', documents: 19, vues: 67 },
        { day: 'Mer', documents: 25, vues: 89 },
        { day: 'Jeu', documents: 18, vues: 56 },
        { day: 'Ven', documents: 32, vues: 120 },
        { day: 'Sam', documents: 8, vues: 23 },
        { day: 'Dim', documents: 5, vues: 12 }
    ];

    if (loading || !currentService) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, change, onClick }) => (
        <div onClick={onClick} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
                                        {change !== undefined && (
                                            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {change >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                                                <span>{Math.abs(change)}% ce mois</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30`}>
                                        <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                                    </div>
                                </div>
                                <div className="mt-4 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className={`h-full w-0 bg-${color}-500 rounded-full group-hover:w-full transition-all duration-1000`}></div>
                                </div>
                            </div>
                        </div>
                    );

                    return (
                        <div className="space-y-8">
                            {/* Hero Section avec service actuel */}
                            <div className="relative overflow-hidden rounded-2xl p-8 text-white" style={{ backgroundColor: currentService.color }}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-5xl">{currentService.icon}</span>
                                        <div>
                                            <h1 className="text-3xl font-bold">
                                                {language === 'fr' ? currentService.name_fr : currentService.name_en}
                                            </h1>
                                            <p className="opacity-90 mt-1">
                                                {language === 'fr' ? currentService.description_fr : currentService.description_en}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard 
                                    title="Documents actifs" 
                                    value={stats?.activeDocuments || 0} 
                                    icon={DocumentTextIcon} 
                                    color="blue"
                                    onClick={() => navigate('/documents')}
                                />
                                <StatCard title="Vues totales" value={stats?.totalViews || 0} icon={EyeIcon} color="green" />
                                <StatCard title="Téléchargements" value={stats?.totalDownloads || 0} icon={ArrowDownTrayIcon} color="orange" />
                                <StatCard title="Archives" value={stats?.archivedDocuments || 0} icon={BuildingOfficeIcon} color="purple" />
                            </div>

                            {/* Graphique */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    📈 Évolution des activités - {language === 'fr' ? currentService.name_fr : currentService.name_en}
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={weeklyData}>
                                        <defs>
                                            <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={currentService.color} stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor={currentService.color} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="documents" stroke={currentService.color} strokeWidth={3} fill="url(#colorDocs)" name="Documents" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Vue d'ensemble multi-services (admin uniquement) */}
                            {user?.role === 'admin' && globalStats && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        🏢 Vue d'ensemble des services
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {globalStats.documentsByService?.map((service, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${service.color}20` }}>
                                                    <span className="text-xl">{service.icon}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {language === 'fr' ? service.name_fr : service.name_en}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{service.count || 0} documents</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                };

                export default Dashboard;