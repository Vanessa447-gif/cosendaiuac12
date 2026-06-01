import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ServiceSelection from './pages/ServiceSelection';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Users from './pages/Users';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

const AppContent = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <Routes>
                <Route path="/" element={<ServiceSelection />} />
                <Route path="/login/:serviceId" element={<Login />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="documents" element={<Documents />} />
                <Route path="upload" element={<Upload />} />
                <Route path="users" element={<Users />} />
                <Route path="audit" element={<AuditLog />} />
                <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/login/:serviceId" element={<Login />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <LanguageProvider>
                    <Toaster position="top-right" />
                    <AppContent />
                </LanguageProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;