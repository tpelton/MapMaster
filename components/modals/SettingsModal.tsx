import React from 'react';
import { Save, Settings } from 'lucide-react';
import { Modal } from '../shared/Modal';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    slackApiToken: string;
    slackClientId: string;
    slackClientSecret: string;
    onSave: (token: string, clientId: string, clientSecret: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    slackApiToken,
    slackClientId,
    slackClientSecret,
    onSave
}) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSave(
            formData.get('slackApiToken') as string,
            formData.get('slackClientId') as string,
            formData.get('slackClientSecret') as string
        );
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Global Configuration">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slack Bot User OAuth Token</label>
                    <input name="slackApiToken" defaultValue={slackApiToken} placeholder="xoxb-..." className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm outline-none" type="password" />
                    <p className="text-xs text-slate-400 px-2">Required scopes: <code>canvases:write</code></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client ID</label>
                        <input name="slackClientId" defaultValue={slackClientId} placeholder="Optional" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Secret</label>
                        <input name="slackClientSecret" defaultValue={slackClientSecret} placeholder="Optional" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm outline-none" type="password" />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">System Defaults</label>
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-global-templates'))}
                        className="w-full bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-xl font-bold hover:border-lat-blue hover:text-lat-blue transition-all flex items-center justify-center gap-2"
                    >
                        <Settings size={18} /> Manage Default Workflows
                    </button>
                    <p className="text-xs text-slate-400 mt-2 text-center">Configure the default Task Types and Steps for new projects.</p>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                    <Save size={18} /> Save Configuration
                </button>
            </form>
        </Modal>
    );
};
