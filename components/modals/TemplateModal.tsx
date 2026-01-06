import React from 'react';
import { Modal } from '../shared/Modal';
import { LegendTemplate } from '../../types';
import { generateUUID } from '../../utils/helpers';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingTemplate: LegendTemplate | null;
    onSave: (template: LegendTemplate) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, editingTemplate, onSave }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const label = formData.get('label') as string;
        const matchKeysStr = formData.get('matchKeys') as string;
        const matchKeys = matchKeysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);

        const newTemplate: LegendTemplate = editingTemplate
            ? { ...editingTemplate, label, matchKeys }
            : { id: generateUUID(), label, icon: 'Box', matchKeys, baseSubTasks: [] };

        onSave(newTemplate);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Operational Template">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Label</label>
                    <input name="label" required defaultValue={editingTemplate?.label || ''} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Match Keys (Comma Separated)</label>
                    <input name="matchKeys" defaultValue={editingTemplate?.matchKeys?.join(', ') || ''} placeholder="e.g. SP, S" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                    <p className="text-[10px] text-slate-400 px-2">Map labels starting with these prefixes will be auto-assigned to this category.</p>
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
                        {editingTemplate ? 'Update Template' : 'Create Template'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
