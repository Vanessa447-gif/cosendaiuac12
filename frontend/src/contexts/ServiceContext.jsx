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
    const [services, setServices] = useState([]);
    const [currentService, setCurrentService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchServices();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/services/my-services', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            
            if (data.success && data.services.length > 0) {
                setServices(data.services);
                
                // Récupérer le dernier service utilisé
                const savedServiceId = localStorage.getItem('currentServiceId');
                const savedService = savedServiceId ? 
                    data.services.find(s => s.id === parseInt(savedServiceId)) : null;
                
                if (savedService) {
                    setCurrentService(savedService);
                } else {
                    setCurrentService(data.services[0]);
                    localStorage.setItem('currentServiceId', data.services[0].id);
                }
            }
        } catch (error) {
            console.error('Erreur chargement services:', error);
        } finally {
            setLoading(false);
        }
    };

    const switchService = async (service) => {
        setCurrentService(service);
        localStorage.setItem('currentServiceId', service.id);
        
        // Notifier le backend du changement
        try {
            await fetch('http://localhost:5000/api/services/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ service_id: service.id })
            });
        } catch (error) {
            console.error('Erreur switch service:', error);
        }
    };

    const value = {
        services,
        currentService,
        switchService,
        loading
    };

    return (
        <ServiceContext.Provider value={value}>
            {children}
        </ServiceContext.Provider>
    );
};