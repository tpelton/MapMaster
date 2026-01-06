import React from 'react';
import { Modal } from '../shared/Modal';
import { Project, LegendTemplate } from '../../types';
import { INITIAL_LEGEND_TEMPLATES } from '../../constants';
import { generateUUID } from '../../utils/helpers';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingProject: Project | null;
    onSave: (project: Project) => void;
    onCreate: (name: string, description: string, slackChannelId: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, editingProject, onSave, onCreate }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const slackChannelId = formData.get('slackChannelId') as string;

        if (editingProject) {
            onSave({
                ...editingProject,
                name,
                description,
                slackChannelId
            });
        } else {
            onCreate(name, description, slackChannelId);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingProject ? "Adjust Site" : "Construct Site"}>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Handle</label>
                    <input name="name" required defaultValue={editingProject?.name || ''} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</label>
                    <textarea name="description" defaultValue={editingProject?.description || ''} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold min-h-[120px] resize-none outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slack Channel ID</label>
                    <input name="slackChannelId" defaultValue={editingProject?.slackChannelId || ''} placeholder="e.g. C012345678" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-lg outline-none" />
                </div>
                <button type="submit" className="w-full bg-lat-blue text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-lat-blue/90 shadow-lat-blue/20 transition-all">Commit Environment</button>
            </form>
        </Modal>
    );
};
