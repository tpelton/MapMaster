import React, { useRef, useState } from 'react';
import {
    Map as MapIcon,
    Download,
    Slack,
    Search,
    FileUp,
    Loader2,
    Plus,
    GripVertical,
    Check,
    Circle,
    Trash2
} from 'lucide-react';
import { Project, SubTask } from '../../types';
import { ProgressBar } from '../shared/ProgressBar';
import { StorageService } from '../../services/mapStorage';

interface TaskListViewProps {
    selectedProject: Project;
    isProcessing: boolean;
    isSyncingSlack: boolean;
    onOpenMap: (mapData: string) => void;
    onSyncToSlack: () => void;
    onFileUpload: (file: File) => void;
    onTaskTypeChange: (taskId: string, newType: string) => void;
    onSubTaskClick: (taskId: string, subTask: SubTask) => void;
    onDeleteSubTask: (taskId: string, subTaskId: string, e: React.MouseEvent) => void;
    onInjectStep: (taskId: string) => void;
    onReorderSubTasks: (taskId: string, draggedId: string, targetId: string) => void;
    onAddTask: () => void;
    onDeleteTask: (taskId: string) => void;
    onTaskClick: (taskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
    selectedProject,
    isProcessing,
    isSyncingSlack,
    onOpenMap,
    onSyncToSlack,
    onFileUpload,
    onTaskTypeChange,
    onSubTaskClick,
    onDeleteSubTask,
    onInjectStep,
    onReorderSubTasks,
    onAddTask,
    onDeleteTask,
    onTaskClick
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedSubTaskInfo, setDraggedSubTaskInfo] = useState<{ taskId: string, subTaskId: string } | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string, subTaskId: string) => {
        setDraggedSubTaskInfo({ taskId, subTaskId });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetTaskId: string, targetSubTaskId: string) => {
        e.preventDefault();
        if (!draggedSubTaskInfo) return;
        if (draggedSubTaskInfo.taskId !== targetTaskId) return;
        if (draggedSubTaskInfo.subTaskId === targetSubTaskId) return;

        onReorderSubTasks(targetTaskId, draggedSubTaskInfo.subTaskId, targetSubTaskId);
        setDraggedSubTaskInfo(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const exportToCSV = () => {
        if (!selectedProject || selectedProject.tasks.length === 0) return alert("No deployment data to audit.");
        const headers = ["Title", "Status", "Phase", "Details", "Map ID", "Class", "Product", "Site"];
        const rows = selectedProject.tasks.flatMap(task =>
            task.subTasks.map(st => {
                return [`${task.mapId} - ${st.details}`, st.isCompleted ? "VERIFIED" : "PENDING", st.taskType, st.details, task.mapId, st.category, st.productName, selectedProject.name].map(val => `"${String(val).replace(/"/g, '""')}"`);
            })
        );
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${selectedProject.name}_Deployment_Audit.csv`;
        link.click();
    };

    const filteredTasks = selectedProject.tasks.filter(t => {
        const q = searchQuery.toLowerCase();
        return (
            t.mapId.toLowerCase().includes(q) ||
            t.type.toLowerCase().includes(q) ||
            t.subTasks.some(st => st.taskType.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-12">
            <header className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-black text-slate-800">Task Management</h1>
                    {isProcessing && <div className="flex items-center space-x-3 bg-lat-blue/10 text-lat-blue px-6 py-3 rounded-full animate-pulse"><Loader2 className="animate-spin" size={20} /><span className="text-[10px] font-black uppercase">Syncing Map...</span></div>}
                    {isSyncingSlack && <div className="flex items-center space-x-3 bg-pink-50 text-pink-600 px-6 py-3 rounded-full animate-pulse"><Slack className="animate-pulse" size={20} /><span className="text-[10px] font-black uppercase">Pushing to Canvas...</span></div>}
                </div>
                <div className="flex flex-wrap gap-4">
                    <button onClick={async () => {
                        const data = await StorageService.getMap(selectedProject.id);
                        if (data) { onOpenMap(data); } else { alert("Import floorplan first."); }
                    }} className="flex items-center space-x-3 bg-lat-blue/10 text-lat-blue px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-lat-blue/20"><MapIcon size={18} /><span>Floorplan</span></button>
                    <button onClick={exportToCSV} className="flex items-center space-x-3 bg-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-slate-200"><Download size={18} /><span>CSV Export</span></button>
                    <button onClick={onSyncToSlack} className="flex items-center space-x-3 bg-pink-50 text-pink-600 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-pink-100"><Slack size={18} /><span>Sync to Slack</span></button>
                    <button onClick={onAddTask} className="flex items-center space-x-3 bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:bg-emerald-100"><Plus size={18} /><span>Add Task</span></button>
                </div>
                <div className="flex flex-col md:flex-row items-end gap-6 pt-8 border-t border-slate-50">
                    <div className="flex-1 w-full relative"><Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} /><input type="text" placeholder="Filter ID, Type, Phase..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold outline-none" /></div>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-lat-blue text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-lat-blue/90"><FileUp size={20} className="inline mr-3" />Sync Map</button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                </div>
            </header>

            <div className="space-y-8 pb-32">
                {filteredTasks.map(task => {
                    const done = task.subTasks.filter(st => st.isCompleted).length;
                    const prog = task.subTasks.length > 0 ? (done / task.subTasks.length) * 100 : 0;
                    return (
                        <div key={task.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden border-l-8 border-l-lat-blue">
                            <div className="p-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                    <div className="flex items-center space-x-6">
                                        <div className="p-4 bg-lat-blue/10 text-lat-blue rounded-2xl font-black text-xl">{task.mapId.charAt(0)}</div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter">{task.mapId}</h3>
                                            <select value={task.type} onChange={(e) => onTaskTypeChange(task.id, e.target.value)} className="text-[10px] font-black uppercase tracking-[0.2em] text-lat-blue bg-transparent outline-none cursor-pointer">
                                                {selectedProject.templates.map(tpl => <option key={tpl.id} value={tpl.label}>{tpl.label}</option>)}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => onTaskClick(task.id)}
                                            className="p-3 text-slate-400 hover:text-lat-blue hover:bg-lat-blue/10 rounded-xl transition-all"
                                            title="Task Details (Photos & Comments)"
                                        >
                                            <FileUp size={20} />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const data = await StorageService.getMap(selectedProject.id);
                                                if (data) {
                                                    onOpenMap(data);
                                                } else {
                                                    alert("Import floorplan first.");
                                                }
                                            }}
                                            className="p-3 text-slate-400 hover:text-lat-blue hover:bg-lat-blue/10 rounded-xl transition-all"
                                            title="View Floorplan"
                                        >
                                            <MapIcon size={20} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteTask(task.id)}
                                            className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Entire Task Group"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                    <div className="w-64 space-y-2"><ProgressBar progress={prog} /><span className="text-[10px] font-black text-slate-400 uppercase">{Math.round(prog)}% Readiness</span></div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 gap-4">
                                        <div className="w-8"></div>
                                        <div className="w-24">Phase</div>
                                        <div className="flex-1">Directive</div>
                                        <div className="flex-1 hidden md:block">Product</div>
                                        <div className="w-8"></div>
                                    </div>

                                    {task.subTasks.map(st => (
                                        <div
                                            key={st.id}
                                            className="relative group/row"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id, st.id)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, task.id, st.id)}
                                        >
                                            <button
                                                onClick={() => onSubTaskClick(task.id, st)}
                                                className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${st.isCompleted ? 'bg-green-50/50 border-green-200' : 'bg-slate-50 border-slate-100 hover:border-lat-blue shadow-sm'}`}
                                            >
                                                <div className="cursor-move text-slate-300 hover:text-lat-blue transition-colors p-1" title="Drag to reorder"><GripVertical size={16} /></div>

                                                <div className={`shrink-0 p-1.5 rounded-lg ${st.isCompleted ? 'bg-green-600 text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>
                                                    {st.isCompleted ? <Check size={14} /> : <Circle size={14} />}
                                                </div>

                                                <div className="w-24 shrink-0">
                                                    <span className="text-[9px] font-black px-2 py-1 bg-white border border-slate-200 rounded-md uppercase text-slate-500">{st.taskType}</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${st.isCompleted ? 'text-green-800 opacity-60' : 'text-slate-800'}`}>{st.details}</p>
                                                </div>

                                                <div className="flex-1 hidden md:block min-w-0">
                                                    <p className="text-xs font-medium text-slate-500 truncate">{st.productName}</p>
                                                </div>

                                                <div className="w-8"></div>
                                            </button>

                                            <button
                                                onClick={(e) => onDeleteSubTask(task.id, st.id, e)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-slate-200 z-10 opacity-0 group-hover/row:opacity-100"
                                                title="Delete Task"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    <button onClick={() => onInjectStep(task.id)} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-lat-blue hover:text-lat-blue transition-all gap-2 group">
                                        <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Inject Step</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
