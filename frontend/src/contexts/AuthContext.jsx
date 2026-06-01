import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [currentService, setCurrentService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        const savedService = localStorage.getItem('currentService');
        
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            if (savedService) setCurrentService(JSON.parse(savedService));
        }
        setLoading(false);
    }, []);

    const login = (userData, token, serviceData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        if (serviceData) {
            localStorage.setItem('currentService', JSON.stringify(serviceData));
            setCurrentService(serviceData);
        }
        setUser(userData);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setCurrentService(null);
    };

    return (
        <AuthContext.Provider value={{ user, currentService, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};