import React, { useEffect } from 'react';
import { Bell, Check } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-10 right-10 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-5 duration-300 z-[100]">
            <div className="bg-lat-blue rounded-full p-1">
                <Check size={16} className="text-white" />
            </div>
            <span className="font-bold">{message}</span>
        </div>
    );
};
