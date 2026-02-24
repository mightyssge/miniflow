import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastContextType {
    showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#1c1c1c',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    border: '1px solid #333',
                    zIndex: 9999,
                    animation: 'toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                    <CheckCircle size={16} color="#28b478" />
                    {toast}
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
