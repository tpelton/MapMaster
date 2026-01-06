
import React, { useState } from 'react';
import { LegendTemplate } from '../../types';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: LegendTemplate[];
    onSave: (mapId: string, templateId: string) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    isOpen, onClose, templates, onSave
}) => {
    const [mapId, setMapId] = useState('');
    const [templateId, setTemplateId] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!mapId || !templateId) {
            alert("Please enter a Name and select a Type.");
            return;
        }
        onSave(mapId, templateId);
        setMapId('');
        setTemplateId('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Manual Task</h2>
                        <p className="text-slate-500 font-medium">Add a new item to the map.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
                    <div>
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Item Name / ID</label>
                        <input
                            type="text"
                            placeholder="e.g. D105"
                            value={mapId}
                            onChange={(e) => setMapId(e.target.value)}
                            className="w-full text-lg p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">Category Type</label>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className="w-full text-lg p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                        >
                            <option value="">Select a Category...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-lat-blue text-white font-bold rounded-xl hover:bg-lat-blue/90 shadow-lg shadow-lat-blue/20 transition-all"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

