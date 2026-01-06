import React from 'react';
import { Modal } from '../shared/Modal';
import { TASK_TYPE_OPTIONS } from '../../constants';

interface BaseStepModalProps {
    isOpen: boolean;
    onClose: () => void;
    stepContext: { templateId: string, index: number | null, step: any } | null;
    onSave: (templateId: string, index: number | null, taskType: string, details: string, productName: string) => void;
}

export const BaseStepModal: React.FC<BaseStepModalProps> = ({ isOpen, onClose, stepContext, onSave }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!stepContext) return;
        const formData = new FormData(e.currentTarget);
        onSave(
            stepContext.templateId,
            stepContext.index,
            formData.get('taskType') as string,
            formData.get('details') as string,
            formData.get('productName') as string
        );
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Automation Step">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phase</label><select name="taskType" defaultValue={stepContext?.step?.taskType || 'Install'} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black">{TASK_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirements</label><textarea name="details" required defaultValue={stepContext?.step?.details || ''} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold min-h-[100px] resize-none outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Component</label><input name="productName" defaultValue={stepContext?.step?.productName} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" /></div>
                <button type="submit" className="w-full bg-lat-blue text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-lat-blue/90 transition-all text-sm mt-8">Commit to Master</button>
            </form>
        </Modal>
    );
};

interface InjectStepModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetTaskId: string | null;
    onSave: (taskId: string, taskType: string, details: string, productName: string) => void;
}

export const InjectStepModal: React.FC<InjectStepModalProps> = ({ isOpen, onClose, targetTaskId, onSave }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!targetTaskId) return;
        const formData = new FormData(e.currentTarget);
        onSave(
            targetTaskId,
            formData.get('taskType') as string,
            formData.get('details') as string,
            formData.get('productName') as string
        );
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inject Custom Directive">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phase</label><select name="taskType" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black">{TASK_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive</label><textarea name="details" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold min-h-[100px] resize-none outline-none" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Component</label><input name="productName" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" /></div>
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
                        Inject Step
                    </button>
                </div>
            </form>
        </Modal>
    );
};
