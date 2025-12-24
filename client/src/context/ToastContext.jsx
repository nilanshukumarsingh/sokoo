/**
 * Toast Context
 * Global toast notification state management
 */

import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Render toasts */}
            {toasts.length > 0 && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, pointerEvents: 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', paddingTop: '90px', pointerEvents: 'none' }}>
                        {toasts.map((toast, index) => (
                            <div key={toast.id} style={{
                                transform: `translateY(${index * 10}px)`,
                                pointerEvents: 'auto'
                            }}>
                                <Toast
                                    message={toast.message}
                                    type={toast.type}
                                    onClose={() => removeToast(toast.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};
