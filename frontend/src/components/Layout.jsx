import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ServiceProvider } from '../contexts/ServiceContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user } = useAuth();

    if (!user) return null;

    return (
        <ServiceProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <Sidebar open={sidebarOpen} />
                <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="p-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </ServiceProvider>
    );
};

export default Layout;