import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20`}>
                <div className="flex items-center justify-between p-8 border-b border-slate-50">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{title}</h3>
                    <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 max-h-[85vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};
