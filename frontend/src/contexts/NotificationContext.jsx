import React, { createContext, useContext, useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    
    // Auto-supprimer après 5 secondes
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.slice(0, 5).map(notif => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] ${
              notif.type === 'success' ? 'bg-green-500' :
              notif.type === 'error' ? 'bg-red-500' :
              notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            } text-white animate-slide-up`}
          >
            <span>{notif.message}</span>
            <button onClick={() => removeNotification(notif.id)} className="ml-4">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};