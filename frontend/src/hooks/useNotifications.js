import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useNotifications = () => {
    const [permission, setPermission] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission === 'granted');
        }
    }, []);

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result === 'granted');
        return result === 'granted';
    };

    const showNotification = (title, options = {}) => {
        if (permission) {
            new Notification(title, {
                icon: '/favicon.ico',
                ...options
            });
        }
        toast.success(title);
    };

    return { permission, requestPermission, showNotification };
};