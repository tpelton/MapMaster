import React, { useRef } from 'react';
import { Camera, Trash2, Send, ImageIcon } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { SubTask, Project, Comment } from '../../types';
import { generateUUID } from '../../utils/helpers';
import { TASK_TYPE_OPTIONS } from '../../constants';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeContext: { taskId: string, subTask: SubTask } | null;
    selectedProject: Project | null;
    onSave: (taskId: string, subTask: SubTask) => void;
    onDelete: (taskId: string, subTaskId: string) => void;
    // This component will handle photo/comment updates nicely if we pass specialized handlers, 
    // or we can just pass the updated subtask back to onSave which is simpler for now.
    // Actually, photo upload needs async processing possibly. 
    // Let's pass handlers for granular actions to match the hook capabilities if possible, 
    // or just handle state locally and save on submit.
    // Original app handled photo upload immediately.
    onPhotoUpload: (taskId: string, subTask: SubTask, files: FileList) => Promise<SubTask>;
    onDeletePhoto: (taskId: string, subTask: SubTask, index: number) => Promise<SubTask>;
    onAddComment: (taskId: string, subTask: SubTask, comment: Comment) => Promise<SubTask>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    isOpen,
    onClose,
    activeContext,
    selectedProject,
    onSave,
    onDelete,
    onPhotoUpload,
    onDeletePhoto,
    onAddComment
}) => {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const commentInputRef = useRef<HTMLInputElement>(null);

    // We need local state if we want optimistic UI updates inside the modal,
    // but for now relying on parent re-render via props (subTask) is the original pattern.
    // We just need to make sure the handlers passed in update the central state which trickles down.

    const subTask = activeContext?.subTask;

    if (!subTask || !selectedProject) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeContext) return;
        const formData = new FormData(e.currentTarget);
        const updatedST: SubTask = {
            ...subTask,
            category: formData.get('category') as string,
            taskType: formData.get('taskType') as string,
            details: formData.get('details') as string,
            productName: formData.get('productName') as string,
            isCompleted: formData.get('isCompleted') === 'on'
        };
        onSave(activeContext.taskId, updatedST);
        onClose();
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && activeContext) {
            await onPhotoUpload(activeContext.taskId, subTask, e.target.files);
        }
    };

    const handleDeletePhoto = async (index: number) => {
        if (activeContext) {
            await onDeletePhoto(activeContext.taskId, subTask, index);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = commentInputRef.current?.value;
        if (text && activeContext) {
            const newComment: Comment = {
                id: generateUUID(),
                user: 'Field Op',
                text,
                timestamp: new Date().toISOString()
            };
            await onAddComment(activeContext.taskId, subTask, newComment);
            if (commentInputRef.current) commentInputRef.current.value = '';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Operational Workflow" maxWidth="max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label><select name="category" defaultValue={subTask.category} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black outline-none">{selectedProject?.templates.map(t => <option key={t.id} value={t.label}>{t.label}</option>)}</select></div>
                            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phase</label><select name="taskType" defaultValue={subTask.taskType} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black outline-none">{TASK_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                        </div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive</label><textarea name="details" required defaultValue={subTask.details} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold min-h-[120px] resize-none outline-none" /></div>
                        <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product</label><input name="productName" defaultValue={subTask.productName} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none" /></div>

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field Evidence</label>
                                <button type="button" onClick={() => photoInputRef.current?.click()} className="text-lat-blue font-bold text-xs flex items-center hover:underline"><Camera size={14} className="mr-1" /> Add Photo</button>
                                <input ref={photoInputRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                            </div>
                            {subTask.photos && subTask.photos.length > 0 ? (
                                <div className="grid grid-cols-4 gap-4">
                                    {subTask.photos.map((photo, idx) => (
                                        <div key={idx} className="relative group/photo aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                            <img src={photo} alt="evidence" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => handleDeletePhoto(idx)} className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover/photo:opacity-100 transition-all"><Trash2 size={20} /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div onClick={() => photoInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-300 hover:border-lat-blue hover:text-lat-blue transition-all cursor-pointer">
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-[10px] font-black uppercase">No Images Uploaded</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <input type="checkbox" name="isCompleted" defaultChecked={subTask.isCompleted} className="w-8 h-8 rounded-xl cursor-pointer" />
                            <label className="text-lg font-black text-slate-800 uppercase tracking-tight">Deployment Verified</label>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" className="flex-1 bg-lat-blue text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl">Apply Changes</button>
                            <button type="button" onClick={() => { if (activeContext) onDelete(activeContext.taskId, subTask.id); }} className="px-8 py-6 bg-red-50 text-red-600 rounded-2xl transition-all hover:bg-red-100"><Trash2 size={24} /></button>
                        </div>
                    </form>
                </div>
                <div className="lg:w-80 flex flex-col space-y-6">
                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Interaction Log</h4>
                    <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 overflow-y-auto max-h-[400px] space-y-4">
                        {subTask.comments.map(c => (
                            <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50"><span className="text-[8px] font-black text-lat-blue block mb-1 uppercase tracking-widest">{c.user}</span><p className="text-[11px] font-medium leading-relaxed text-slate-600">{c.text}</p></div>
                        ))}
                        {!subTask.comments.length && <div className="text-center py-10 opacity-30 text-[10px] font-black uppercase tracking-widest">No entries</div>}
                    </div>
                    <form onSubmit={handleAddComment} className="relative"><input ref={commentInputRef} placeholder="Add log..." className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold outline-none text-xs" /><button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-lat-blue text-white rounded-xl"><Send size={12} /></button></form>
                </div>
            </div>
        </Modal>
    );
};
