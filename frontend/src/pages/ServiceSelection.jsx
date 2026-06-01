import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, GlobeAltIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ServiceSelection = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services/public');
            const data = await response.json();
            if (data.success) setServices(data.services);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectService = (service) => {
        localStorage.setItem('selectedService', JSON.stringify(service));
        navigate(`/login/${service.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={toggleLanguage} className="p-2 bg-white/20 rounded-lg text-white">
                    <GlobeAltIcon className="h-5 w-5" />
                </button>
                <button onClick={toggleTheme} className="p-2 bg-white/20 rounded-lg text-white">
                    {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
                </button>
            </div>

            <div className="text-center pt-16 pb-8 px-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                    <span className="text-5xl">🏢</span>
                </motion.div>
                <h1 className="text-4xl font-bold text-white mb-4">SAE Cosendai</h1>
                <p className="text-white/80 text-lg">Sélectionnez votre service</p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                            onClick={() => selectService(service)}
                            className="cursor-pointer"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden" style={{ borderTop: `4px solid ${service.color}` }}>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${service.color}20` }}>
                                            {service.icon}
                                        </div>
                                        <ChevronRightIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{language === 'fr' ? service.name_fr : service.name_en}</h3>
                                    <p className="text-gray-500 text-sm">{service.code}</p>
                                    <p className="text-gray-600 mt-3 text-sm">{language === 'fr' ? service.description_fr : service.description_en}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceSelection;