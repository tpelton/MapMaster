import React from 'react';
import { Modal } from '../shared/Modal';
import { ConfigView } from '../views/ConfigView';
import { Project, LegendTemplate } from '../../types';

interface GlobalTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    globalTemplates: LegendTemplate[];
    onAddNewClass: () => void;
    onEditTemplate: (tpl: LegendTemplate) => void;
    onDeleteTemplate: (tpl: LegendTemplate) => void;
    onEditBaseStep: (templateId: string, index: number, step: any) => void;
    onDeleteBaseStep: (templateId: string, index: number) => void;
    onAddWorkflowStep: (templateId: string) => void;
    onMoveBaseStep: (templateId: string, index: number, direction: 'up' | 'down') => void;
}

export const GlobalTemplatesModal: React.FC<GlobalTemplatesModalProps> = ({
    isOpen,
    onClose,
    globalTemplates,
    onAddNewClass,
    onEditTemplate,
    onDeleteTemplate,
    onEditBaseStep,
    onDeleteBaseStep,
    onAddWorkflowStep,
    onMoveBaseStep
}) => {
    // Create a "Mock Project" to satisfy ConfigView's props interface
    // ConfigView only uses selectedProject.templates, so we mock the rest.
    const mockProject: Project = {
        id: 'global-defaults',
        name: 'Global Defaults',
        description: 'System Config',
        createdAt: new Date().toISOString(),
        tasks: [],
        templates: globalTemplates
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Global Workflow Defaults" fullScreen>
            <div className="bg-slate-50 min-h-screen p-8">
                <div className="max-w-7xl mx-auto pb-24">
                    <div className="mb-8 bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">System-Wide Configuration</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Changes made here will apply to <strong>ALL NEW PROJECTS</strong> created in the future.
                                Existing projects will not be affected.
                                Use this to set your company's standard operating procedures and device types.
                            </p>
                        </div>
                    </div>

                    <ConfigView
                        selectedProject={mockProject}
                        onAddNewClass={onAddNewClass}
                        onEditTemplate={onEditTemplate}
                        onDeleteTemplate={onDeleteTemplate}
                        onEditBaseStep={onEditBaseStep}
                        onDeleteBaseStep={onDeleteBaseStep}
                        onAddWorkflowStep={onAddWorkflowStep}
                        layoutMode="list"
                    />
                </div>
            </div>
        </Modal>
    );
};
