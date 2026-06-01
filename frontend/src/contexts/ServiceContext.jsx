import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ServiceContext = createContext();

export const useService = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useService must be used within ServiceProvider');
    }
    return context;
};

export const ServiceProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [service, setService] = useState(null);
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadServiceData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadServiceData = async () => {
        setLoading(true);
        try {
            // Charger les infos du service
            const serviceRes = await fetch('http://localhost:5000/api/services/current', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const serviceData = await serviceRes.json();
            if (serviceData.success) {
                setService(serviceData.service);
                localStorage.setItem('currentService', JSON.stringify(serviceData.service));
            }
            
            // Charger les statistiques
            const statsRes = await fetch('http://localhost:5000/api/services/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.stats);
            
            // Charger les catégories
            const catRes = await fetch('http://localhost:5000/api/services/categories', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const catData = await catRes.json();
            if (catData.success) setCategories(catData.categories);
            
            // Charger l'historique
            const histRes = await fetch('http://localhost:5000/api/services/history', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const histData = await histRes.json();
            if (histData.success) setHistory(histData.history);
            
        } catch (error) {
            console.error('Erreur chargement service:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/services/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setStats(data.stats);
        } catch (error) {
            console.error('Erreur refresh stats:', error);
        }
    };

    const refreshHistory = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/services/history', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setHistory(data.history);
        } catch (error) {
            console.error('Erreur refresh history:', error);
        }
    };

    return (
        <ServiceContext.Provider value={{ 
            service, stats, categories, history, loading, 
            refreshStats, refreshHistory, loadServiceData 
        }}>
            {children}
        </ServiceContext.Provider>
    );
};