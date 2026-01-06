import React from 'react';
import {
    FolderOpen,
    Activity,
    LayoutDashboard,
    Settings,
    Book
} from 'lucide-react';
import { SidebarItem } from '../shared/SidebarItem';

interface SidebarProps {
    activeView: 'projects' | 'tasks' | 'config' | 'dashboard';
    setActiveView: (view: 'projects' | 'tasks' | 'config' | 'dashboard') => void;
    selectedProjectId: string | null;
    onOpenSettings: () => void;
    onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    setActiveView,
    selectedProjectId,
    onOpenSettings,
    onOpenHelp
}) => {
    return (
        <aside className="w-80 bg-white border-r border-slate-100 p-12 hidden md:flex flex-col shadow-2xl z-[60]">
            <div className="flex items-center space-x-5 mb-16">
                <div className="bg-white p-2 rounded-[1.5rem] shadow-xl border border-slate-100">
                    <img
                        src="https://static.wixstatic.com/media/fa4487_99cf258881364b2092472184e2b9f146~mv2.png/v1/fill/w_49,h_49,al_c,q_85,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/full%20color%20logo%20icon.png"
                        alt="LAT Logo"
                        className="w-8 h-8"
                    />
                </div>
                <div>
                    <span className="text-2xl font-black text-slate-800">LAT Dashboard</span>
                    <span className="text-[10px] font-black text-lat-blue block uppercase tracking-[0.3em]">LAT Engine 1.0</span>
                </div>
            </div>
            <nav className="flex-1 space-y-4">
                <SidebarItem
                    icon={FolderOpen}
                    label="PROJECTS"
                    active={activeView === 'projects'}
                    onClick={() => setActiveView('projects')}
                />
                <SidebarItem
                    icon={Activity}
                    label="TASK LISTS"
                    disabled={!selectedProjectId}
                    active={activeView === 'tasks'}
                    onClick={() => setActiveView('tasks')}
                />
                <SidebarItem
                    icon={LayoutDashboard}
                    label="ANALYTICS"
                    disabled={!selectedProjectId}
                    active={activeView === 'dashboard'}
                    onClick={() => setActiveView('dashboard')}
                />
                <SidebarItem
                    icon={Settings}
                    label="PROJECT CONFIGURATION"
                    disabled={!selectedProjectId}
                    active={activeView === 'config'}
                    onClick={() => setActiveView('config')}
                />
            </nav>

            <div className="mt-auto space-y-2">
                <button
                    onClick={onOpenHelp}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-lat-blue hover:bg-slate-50 rounded-xl transition-all"
                >
                    <Book size={20} />
                    <span className="font-bold text-sm tracking-tight">Help & Documentation</span>
                </button>
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-lat-blue hover:bg-slate-50 rounded-xl transition-all"
                >
                    <Settings size={20} />
                    <span className="font-bold text-sm tracking-tight">Global Settings</span>
                </button>
            </div>
        </aside>
    );
};
