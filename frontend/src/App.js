import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Upload from './pages/Upload';
import Users from './pages/Users';
import AuditLog from './pages/AuditLog';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Settings from './pages/Settings';

// Ajoutez dans les routes :

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '10px', background: '#333', color: '#fff' },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="documents" element={<Documents />} />
              <Route path="upload" element={<Upload />} />
              <Route path="users" element={<Users />} />
              <Route path="audit" element={<AuditLog />} />
              <Route path="settings" element={<Settings />} />
              // Dans App.jsx, assurez-vous que la route /users est protégée pour admin uniquement
              <Route path="users" element={
              <PrivateRoute allowedRoles={['admin']}>
              <Users />
              </PrivateRoute>
            } />
            </Route>
          </Routes>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;