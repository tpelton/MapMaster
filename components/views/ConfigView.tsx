import React from 'react';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { Project, LegendTemplate, SubTask } from '../../types';

interface ConfigViewProps {
    selectedProject: Project;
    onAddNewClass: () => void;
    onEditTemplate: (tpl: LegendTemplate) => void;
    onDeleteTemplate: (tpl: LegendTemplate) => void;
    onEditBaseStep: (templateId: string, index: number, step: any) => void;
    onDeleteBaseStep: (templateId: string, index: number) => void;
    onAddWorkflowStep: (templateId: string) => void;
    onMoveBaseStep?: (templateId: string, index: number, direction: 'up' | 'down') => void;
    layoutMode?: 'grid' | 'list';
}

export const ConfigView: React.FC<ConfigViewProps> = ({
    selectedProject,
    onAddNewClass,
    onEditTemplate,
    onDeleteTemplate,
    onEditBaseStep,
    onDeleteBaseStep,
    onAddWorkflowStep,
    onMoveBaseStep,
    layoutMode = 'grid'
}) => {
    const isList = layoutMode === 'list';

    return (
        <div className="space-y-12 animate-in slide-in-from-left-4 duration-500">
            <header className={`flex flex-col ${isList ? 'items-start gap-4 p-8' : 'md:flex-row md:items-center justify-between gap-6 p-12'} bg-white rounded-[3rem] shadow-sm border border-slate-100`}>
                <div className={`flex items-center ${isList ? 'space-x-4' : 'space-x-6'}`}>
                    <div className={`bg-lat-blue/10 ${isList ? 'p-3 rounded-2xl' : 'p-5 rounded-[1.5rem]'} text-lat-blue shadow-lg`}>
                        <Settings size={isList ? 24 : 32} />
                    </div>
                    <div>
                        <h1 className={`${isList ? 'text-2xl' : 'text-4xl'} font-black text-slate-800`}>Legend Configuration</h1>
                        <p className="text-slate-400 font-bold mt-1">Manage Templates & Patterns</p>
                    </div>
                </div>
                <button
                    onClick={onAddNewClass}
                    className={`flex items-center space-x-3 bg-lat-blue text-white ${isList ? 'px-6 py-4 w-full justify-center' : 'px-8 py-5 max-w-xs'} rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-lat-blue/90`}
                >
                    <Plus size={20} />
                    <span>New Legend</span>
                </button>
            </header>
            <div className={`grid ${layoutMode === 'list' ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 lg:grid-cols-2'} gap-10`}>
                {selectedProject.templates.map(tpl => (
                    <div key={tpl.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-6">
                                <div className="w-16 h-16 bg-lat-blue text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl">{tpl.label.charAt(0)}</div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{tpl.label}</h3>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onEditTemplate(tpl)}
                                    className="p-3 text-slate-300 hover:text-lat-blue transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => onDeleteTemplate(tpl)}
                                    className="p-3 text-slate-300 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {tpl.baseSubTasks.map((bst, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        {onMoveBaseStep && (
                                            <div className="flex flex-col gap-1 mr-2 opacity-30 hover:opacity-100 transition-opacity">
                                                <button
                                                    disabled={idx === 0}
                                                    onClick={() => onMoveBaseStep(tpl.id, idx, 'up')}
                                                    className="p-1 hover:text-lat-blue disabled:opacity-0"
                                                >
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5L5 1L9 5" /></svg>
                                                </button>
                                                <button
                                                    disabled={idx === tpl.baseSubTasks.length - 1}
                                                    onClick={() => onMoveBaseStep(tpl.id, idx, 'down')}
                                                    className="p-1 hover:text-lat-blue disabled:opacity-0"
                                                >
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1" /></svg>
                                                </button>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{bst.details}</p>
                                            <span className="text-[8px] font-black text-lat-blue uppercase">{bst.taskType}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onEditBaseStep(tpl.id, idx, bst)}
                                            className="p-2 text-slate-400 hover:text-lat-blue"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteBaseStep(tpl.id, idx)}
                                            className="p-2 text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => onAddWorkflowStep(tpl.id)}
                                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 font-black uppercase text-[10px] tracking-widest hover:border-lat-blue hover:text-lat-blue transition-all"
                            >
                                Add Workflow Step
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
