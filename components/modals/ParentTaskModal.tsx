import React, { useRef } from 'react';
import { Camera, Trash2, Send, ImageIcon, X, Mic } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { Task, Comment } from '../../types';
import { generateUUID } from '../../utils/helpers';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface ParentTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    projectName: string;
    onPhotoUpload: (taskId: string, file: string) => Promise<void>;
    onDeletePhoto: (taskId: string, index: number) => Promise<void>;
    onAddComment: (taskId: string, comment: string) => Promise<void>;
}

export const ParentTaskModal: React.FC<ParentTaskModalProps> = ({
    isOpen,
    onClose,
    task,
    projectName,
    onPhotoUpload,
    onDeletePhoto,
    onAddComment
}) => {
    const photoInputRef = useRef<HTMLInputElement>(null);
    const commentInputRef = useRef<HTMLInputElement>(null); // Keep ref for direct focus/manipulation, but we might need state for controlled input now?
    // Actually, to append text easily, state is better.
    const [commentText, setCommentText] = React.useState('');

    const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechRecognition();

    // Effect to append transcript to comment text when listening ends or updates
    // Actually, simpler: when transcript updates, we likely want to show it.
    // Issue: transcript resets on every new session. 
    // Let's just create a combined effect:
    // When isListening is true, show transcript?
    // User might want to type AND speak.

    // Better pattern:
    // When transcript changes, update text?
    // But transcript replaces itself.

    // Actually, let's keep it simple: 
    // We bind local state 'commentText' to input.
    // When transcript updates (and isListening), we display (currentText + transcript).
    // Wait, transcript is "hello world" from start of session.
    // So if I typed "Hi", then speak "there", transcript is "there".
    // Result should be "Hi there".

    const [baseText, setBaseText] = React.useState(''); // Text before current speech session

    React.useEffect(() => {
        if (isListening) {
            // While listening, show base + transcript
            setCommentText(baseText + (baseText && transcript ? ' ' : '') + transcript);
        } else {
            // When stopped, the final transcript is already in commentText?
            // Yes, but we should update baseText for next time.
            if (transcript) {
                setBaseText(prev => prev + (prev ? ' ' : '') + transcript);
            }
        }
    }, [transcript, isListening]);

    // Update baseText if user types manually
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommentText(e.target.value);
        if (!isListening) {
            setBaseText(e.target.value);
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            // Prepare for new speech
            setBaseText(commentText); // Capture what's already there
            startListening();
        }
    };

    // Filter valid photos (ensure they are strings)
    const validPhotos = (task?.photos || []).filter(p => typeof p === 'string');

    if (!task) return null;

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const result = ev.target?.result as string;
                if (result) {
                    await onPhotoUpload(task.id, result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (commentText.trim()) {
            await onAddComment(task.id, commentText);
            setCommentText('');
            setBaseText('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${task.mapId} - Task Details`} maxWidth="max-w-4xl">
            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left Side: Photos */}
                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Field Evidence</h3>
                        <button onClick={() => photoInputRef.current?.click()} className="text-lat-blue font-bold text-xs flex items-center hover:bg-lat-blue/10 px-3 py-2 rounded-lg transition-colors">
                            <Camera size={16} className="mr-2" /> Add Photo
                        </button>
                        <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </div>

                    {validPhotos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {validPhotos.map((photo, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                    <img src={photo} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <button
                                        onClick={() => onDeletePhoto(task.id, idx)}
                                        className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg scale-90 group-hover:scale-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            onClick={() => photoInputRef.current?.click()}
                            className="aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 hover:border-lat-blue hover:text-lat-blue transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
                        >
                            <ImageIcon size={48} className="mb-4 opacity-50" />
                            <span className="text-xs font-black uppercase tracking-widest">No Photos Uploaded</span>
                            <span className="text-[10px] font-medium mt-2">Click to upload evidence</span>
                        </div>
                    )}
                </div>

                {/* Right Side: Comments */}
                <div className="lg:w-96 flex flex-col h-[500px] bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity Log</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {(task.comments || []).map((c) => (
                            <div key={c.id} className="group">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[9px] font-black text-lat-blue uppercase tracking-widest">{c.user}</span>
                                    <span className="text-[9px] font-bold text-slate-300">{new Date(c.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm text-sm text-slate-600 leading-relaxed group-hover:border-lat-blue/20 transition-colors">
                                    {c.text}
                                </div>
                            </div>
                        ))}
                        {(!task.comments || task.comments.length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                                <span className="text-xs font-black uppercase tracking-widest">No Comments</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-slate-100">
                        <form onSubmit={handleAddComment} className="relative flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    value={commentText}
                                    onChange={handleTextChange}
                                    placeholder={isListening ? "Listening..." : "Add a comment..."}
                                    className={`w-full pl-5 pr-12 py-4 bg-slate-50 border rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-slate-400 ${isListening ? 'border-lat-blue bg-lat-blue/10' : 'border-slate-200 focus:border-lat-blue focus:bg-white'}`}
                                />
                                {hasSupport && (
                                    <button
                                        type="button"
                                        onClick={handleMicClick}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-lat-blue hover:bg-slate-100'}`}
                                        title="Voice to Text"
                                    >
                                        <Mic size={18} />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!commentText.trim() && !isListening}
                                className="p-4 bg-lat-blue text-white rounded-2xl hover:bg-lat-blue/90 transition-all shadow-lg hover:shadow-lat-blue/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
