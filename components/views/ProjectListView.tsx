import React from 'react';
import { FolderOpen, Edit2, Trash2, Slack, Plus } from 'lucide-react';
import { Project } from '../../types';

interface ProjectListViewProps {
    projects: Project[];
    onSelectProject: (id: string) => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (id: string, e: React.MouseEvent) => void;
    onAddNewProject: () => void;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
    projects,
    onSelectProject,
    onEditProject,
    onDeleteProject,
    onAddNewProject
}) => {
    return (
        <div className="space-y-12">
            <header className="flex items-center justify-between bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">Projects</h1>
                    <p className="text-slate-500 font-medium text-lg">Manage projects.</p>
                </div>
                <button
                    onClick={onAddNewProject}
                    className="bg-lat-blue text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-lat-blue/90 transition-all active:scale-95"
                >
                    <Plus size={24} className="inline mr-2" />Add Project
                </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map(project => (
                    <div
                        key={project.id}
                        onClick={() => onSelectProject(project.id)}
                        className="group bg-white p-10 rounded-[2.5rem] border border-slate-200 hover:border-lat-blue transition-all cursor-pointer shadow-sm relative"
                    >
                        <div className="flex justify-between mb-8">
                            <div className="p-4 bg-lat-blue/10 text-lat-blue rounded-2xl">
                                <FolderOpen size={28} />
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                                    className="p-3 text-slate-300 hover:text-lat-blue rounded-xl transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={(e) => onDeleteProject(project.id, e)}
                                    className="p-3 text-slate-300 hover:text-red-500 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{project.name}</h3>
                        <p className="text-slate-500 line-clamp-2 text-sm font-medium">{project.description}</p>
                        {project.slackChannelId && (
                            <div className="absolute top-10 right-10 text-slate-300">
                                <Slack size={18} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
