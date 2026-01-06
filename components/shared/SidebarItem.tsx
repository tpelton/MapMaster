import React, { ElementType } from 'react';

interface SidebarItemProps {
    icon: ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center space-x-3 px-6 py-4 rounded-xl transition-all group ${active
                ? 'bg-lat-blue text-white shadow-lg shadow-lat-blue/30'
                : 'text-slate-400 hover:bg-slate-50 hover:text-lat-blue'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className="font-bold text-sm tracking-tight text-left">{label}</span>
    </button>
);
