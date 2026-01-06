import React from 'react';
import { Search, Bell, FolderOpen, Activity, CheckCircle2, ChevronRight } from 'lucide-react';

interface HeaderProps {
    globalSearchQuery: string;
    setGlobalSearchQuery: (query: string) => void;
    globalSearchResults: any[];
    onResultClick: (result: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
    globalSearchQuery,
    setGlobalSearchQuery,
    globalSearchResults,
    onResultClick
}) => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-24 flex items-center justify-between px-10 shrink-0 z-40">
            <div className="flex-1 max-w-3xl relative">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lat-blue transition-colors" size={22} />
                    <input
                        type="text"
                        value={globalSearchQuery}
                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                        placeholder="Global Search (Sites, Tasks, Products)..."
                        className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-200 rounded-[2rem] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-lat-blue/10 focus:border-lat-blue transition-all placeholder:text-slate-400"
                    />
                </div>

                {globalSearchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden max-h-[600px] overflow-y-auto animate-in fade-in slide-in-from-top-2 z-50 p-2">
                        {globalSearchResults.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 font-bold">No results found</div>
                        ) : (
                            globalSearchResults.map((res, i) => (
                                <button key={i} onClick={() => onResultClick(res)} className="w-full text-left p-4 hover:bg-slate-50 rounded-2xl flex items-center gap-4 transition-colors group">
                                    <div className={`p-3 rounded-xl ${res.type === 'project' ? 'bg-lat-blue/10 text-lat-blue' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-lat-blue group-hover:shadow-md'} transition-all`}>
                                        {res.type === 'project' ? <FolderOpen size={20} /> : res.type === 'task' ? <Activity size={20} /> : <CheckCircle2 size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm">{res.title}</h4>
                                        <p className="text-xs font-semibold text-slate-400">{res.subtitle}</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all" size={16} />
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6 pl-8 border-l border-slate-100 ml-8">
                <button className="relative p-2 text-slate-400 hover:text-lat-blue transition-colors">
                    <Bell size={24} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden xl:block">
                        <p className="text-sm font-black text-slate-800">Field Operator</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin</p>
                    </div>
                    <div className="w-12 h-12 bg-lat-blue rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-lat-blue/50">OP</div>
                </div>
            </div>
        </header>
    );
};
