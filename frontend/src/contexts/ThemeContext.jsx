import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const THEMES = {
    blue: { primary: '#3b82f6', primaryDark: '#2563eb', primaryLight: '#60a5fa', name: 'Bleu' },
    purple: { primary: '#8b5cf6', primaryDark: '#7c3aed', primaryLight: '#a78bfa', name: 'Violet' },
    green: { primary: '#10b981', primaryDark: '#059669', primaryLight: '#34d399', name: 'Vert' },
    orange: { primary: '#f59e0b', primaryDark: '#d97706', primaryLight: '#fbbf24', name: 'Orange' },
    red: { primary: '#ef4444', primaryDark: '#dc2626', primaryLight: '#f87171', name: 'Rouge' },
    pink: { primary: '#ec4899', primaryDark: '#db2777', primaryLight: '#f472b6', name: 'Rose' }
};

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent') || 'blue');

    useEffect(() => {
        if (user?.role === 'archiviste') {
            setAccentColor('purple');
        } else if (user?.role === 'consultant') {
            setAccentColor('blue');
        }
    }, [user?.role]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('accent', accentColor);
        
        // Appliquer le thème dark/light
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Appliquer la couleur d'accentuation
        const root = document.documentElement;
        root.style.setProperty('--primary-color', THEMES[accentColor].primary);
        root.style.setProperty('--primary-color-dark', THEMES[accentColor].primaryDark);
        root.style.setProperty('--primary-color-light', THEMES[accentColor].primaryLight);
        root.style.setProperty('--primary-gradient-start', THEMES[accentColor].primary);
        root.style.setProperty('--primary-gradient-end', THEMES[accentColor].primaryDark);
        
        console.log('🎨 Couleur changée pour:', THEMES[accentColor].name);
        
    }, [theme, accentColor]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const changeAccentColor = (color) => setAccentColor(color);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, changeAccentColor, THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};