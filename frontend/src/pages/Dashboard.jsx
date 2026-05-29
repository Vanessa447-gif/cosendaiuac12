import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
    DocumentTextIcon, 
    EyeIcon, 
    ArrowDownTrayIcon, 
    UserGroupIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
    FolderIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => { loadStats(); }, []);

    const loadStats = async () => {
        const result = await statsAPI.get();
        if (result.success) setStats(result.stats);
        setLoading(false);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    const getUserName = () => {
        if (!user) return 'Invité';
        if (user.fullName) return user.fullName.split(' ')[0];
        return user.username || 'Utilisateur';
    };

    const StatCard = ({ title, value, icon: Icon, gradient, change }) => (
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-full h-full" />
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                        {change && (
                            <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {change >= 0 ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                                <span>{Math.abs(change)}% ce mois</span>
                            </div>
                        )}
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
                <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-full transition-all duration-1000"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Bon retour, {getUserName()} 👋</h1>
                    <p className="text-purple-100">Voici ce qui se passe avec vos documents aujourd'hui.</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-purple-200">
                        <ClockIcon className="h-4 w-4" />
                        <span>Dernière mise à jour : {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Documents" value={stats?.totalDocuments || 0} icon={DocumentTextIcon} gradient="from-blue-500 to-blue-600" change={12} />
                <StatCard title="Vues Totales" value={stats?.totalViews || 0} icon={EyeIcon} gradient="from-green-500 to-emerald-600" change={8} />
                <StatCard title="Téléchargements" value={stats?.totalDownloads || 0} icon={ArrowDownTrayIcon} gradient="from-orange-500 to-red-500" change={-3} />
                <StatCard title="Utilisateurs" value={stats?.activeUsers || 0} icon={UserGroupIcon} gradient="from-purple-500 to-pink-600" change={5} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📈 Évolution des activités</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tendances hebdomadaires</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">Cette semaine</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="documents" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorDocs)" name="Documents" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">🎯 Objectifs</h3>
                            <p className="text-sm text-purple-200 mt-1">Progression mensuelle</p>
                        </div>
                        <ChartBarIcon className="h-8 w-8 opacity-50" />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Objectif documents</span>
                                <span className="font-bold">{stats?.totalDocuments || 0}/100</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div className="bg-white rounded-full h-2" style={{ width: `${Math.min(100, (stats?.totalDocuments || 0))}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Taux d'utilisation</span>
                                <span className="font-bold">78%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div className="bg-white rounded-full h-2 w-[78%]"></div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 bg-white/20 hover:bg-white/30 rounded-xl py-2 text-sm font-medium transition-all">
                        Voir le rapport complet →
                    </button>
                </div>
            </div>

            {/* Recent Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📄 Documents récents</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Les 5 derniers documents ajoutés</p>
                        </div>
                        <button onClick={() => navigate('/documents')} className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                            Voir tout →
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stats?.recentDocuments?.slice(0, 5).map((doc, idx) => (
                        <div key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-all flex items-center justify-center">
                                        <DocumentTextIcon className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                            {language === 'fr' ? doc.title_fr : doc.title_en}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span>{doc.uploader_name}</span>
                                            <span>•</span>
                                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{doc.views_count} vues</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;