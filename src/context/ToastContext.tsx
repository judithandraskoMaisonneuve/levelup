import { createContext, useContext, useState, ReactNode } from 'react';
import { IonToast } from '@ionic/react';
import './ToastContext.css';

// Create the context
interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const showToast = (message: string) => {
        setToastMessage(message);
        setIsOpen(true);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <IonToast
                isOpen={isOpen}
                message={toastMessage || "Error Showing points message"} 
                duration={3000} // Stays for 3 seconds
                onDidDismiss={() => setIsOpen(false)}
                cssClass="custom-toast"
            />
        </ToastContext.Provider>
    );
};

// Hook to use the toast in any component
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
