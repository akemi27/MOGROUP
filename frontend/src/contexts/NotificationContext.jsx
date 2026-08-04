import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toast } from '../components/Toast';

const KEY = 'mg_notifications';

const loadFromStorage = () => {
    try {
        const stored = localStorage.getItem(KEY);
        if (!stored) return [];
        return JSON.parse(stored).map(n => ({ ...n, ts: new Date(n.ts) }));
    } catch { return []; }
};

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState(loadFromStorage);
    const [toast, setToast] = useState(null);

    // Sincronizar con localStorage cuando cambien las notificaciones
    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify(notifications.slice(0, 30)));
        } catch { /* ignorar errores de cuota */ }
    }, [notifications]);

    const notify = useCallback((msg, type = 'success') => {
        const n = { id: Date.now(), msg, type, ts: new Date(), read: false };
        setNotifications(prev => [n, ...prev].slice(0, 50));
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    const unread = notifications.filter(n => !n.read).length;

    const markAllRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearToast = useCallback(() => setToast(null), []);

    return (
        <NotificationContext.Provider value={{ notify, notifications, unread, markAllRead }}>
            {children}
            <Toast toast={toast} onClose={clearToast} />
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
