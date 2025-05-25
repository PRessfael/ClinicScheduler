import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = ({ title, description, variant = 'default' }) => {
        setToast({ title, description, variant });
        setTimeout(() => setToast(null), 3000); // Hide after 3 seconds
    };

    return (
        <ToastContext.Provider value={{ toast: showToast }}>
            {children}
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
                    <div className={`rounded-lg shadow-lg p-4 max-w-sm ${toast.variant === 'success' ? 'bg-green-100 text-green-800' :
                            toast.variant === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-white text-gray-800'
                        }`}>
                        {toast.title && (
                            <h4 className="font-semibold mb-1">{toast.title}</h4>
                        )}
                        {toast.description && (
                            <p className="text-sm">{toast.description}</p>
                        )}
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}; 