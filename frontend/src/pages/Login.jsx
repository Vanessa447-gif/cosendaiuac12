import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, GlobeAltIcon, ArrowLeftIcon, UserIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [service, setService] = useState(null);
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const { serviceId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('selectedService');
        if (saved) {
            setService(JSON.parse(saved));
        } else if (serviceId) {
            fetchService(serviceId);
        } else {
            navigate('/');
        }
    }, [serviceId]);

    const fetchService = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/public/${id}`);
            const data = await response.json();
            if (data.success && data.service) {
                setService(data.service);
                localStorage.setItem('selectedService', JSON.stringify(data.service));
            } else {
                navigate('/');
            }
        } catch (error) {
            navigate('/');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, service_id: service?.id })
            });
            const data = await response.json();
            
            if (data.success) {
                toast.success(`Connexion à ${service?.name_fr} réussie !`);
                login(data.user, data.token, data.service);
                navigate('/dashboard');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    if (!service) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={toggleLanguage} className="p-2 bg-white/20 rounded-lg text-white"><GlobeAltIcon className="h-5 w-5" /></button>
                <button onClick={toggleTheme} className="p-2 bg-white/20 rounded-lg text-white">
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
            </div>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="text-center pt-8 pb-4 px-6" style={{ backgroundColor: `${service.color}10` }}>
                    <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg" style={{ backgroundColor: service.color, color: 'white' }}>
                        {service.icon}
                    </div>
                    <h2 className="text-2xl font-bold">{language === 'fr' ? service.name_fr : service.name_en}</h2>
                    <p className="text-gray-500 text-sm">{service.code}</p>
                </div>

                <div className="p-6">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6">
                        <ArrowLeftIcon className="h-4 w-4" /> Changer de service
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Nom d'utilisateur" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Mot de passe</label>
                            <div className="relative">
                                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500" placeholder="Mot de passe" required />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-medium text-white hover:shadow-lg transition-all disabled:opacity-50" style={{ backgroundColor: service.color }}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <p className="text-sm font-medium mb-2">🔑 Comptes de test :</p>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Admin :</span> {service.code?.toLowerCase()}_admin / admin123</p>
                            <p><span className="font-medium">Archiviste :</span> {service.code?.toLowerCase()}_archiviste / archiviste123</p>
                            <p><span className="font-medium">Consultant :</span> {service.code?.toLowerCase()}_consultant / consultant123</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;