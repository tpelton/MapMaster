import React, { useState, useMemo, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Project, SubTask, LegendTemplate, Comment } from './types';
import { INITIAL_LEGEND_TEMPLATES } from './constants';
import { generateUUID } from './utils/helpers';
import { useProjectManager } from './hooks/useProjectManager';
import { useGlobalSearch } from './hooks/useGlobalSearch';
import { StorageService } from './services/mapStorage';

// Components
import { Toast } from './components/shared/Toast';
import { MapViewer } from './components/shared/MapViewer';
import { Sidebar } from './components/views/Sidebar';
import { Header } from './components/views/Header';
import { ProjectListView } from './components/views/ProjectListView';
import { TaskListView } from './components/views/TaskListView';
import { DashboardView } from './components/views/DashboardView';
import { ConfigView } from './components/views/ConfigView';

// Modals
import { ProjectModal } from './components/modals/ProjectModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { TemplateModal } from './components/modals/TemplateModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { BaseStepModal, InjectStepModal } from './components/modals/StepModals';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { ParentTaskModal } from './components/modals/ParentTaskModal';
import { HelpModal } from './components/modals/HelpModal';
import { GlobalTemplatesModal } from './components/modals/GlobalTemplatesModal';
import { Task } from './types';

export default function App() {
  // Hooks
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isInitialLoading,
    saveProject,
    addProject,
    updateProject,
    deleteProject,
    slackApiToken,
    slackClientId,
    slackClientSecret,
    updateSettings,
    updateSubTask,
    reorderSubTasks,
    processMapUpload,
    syncToSlack,
    addTask,
    deleteTask: deleteTaskFromHook,
    addParentTaskComment,
    addParentTaskPhoto,
    deleteParentTaskPhoto,
    globalTemplates,
    saveGlobalTemplates
  } = useProjectManager();

  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    globalSearchResults
  } = useGlobalSearch(projects);

  // UI State
  const [toast, setToast] = useState<{ message: string, type?: 'success' | 'error' } | null>(null);
  const [activeView, setActiveView] = useState<'projects' | 'tasks' | 'config' | 'dashboard'>('projects');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingSlack, setIsSyncingSlack] = useState(false);

  // Modals & Context State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LegendTemplate | null>(null);

  const [isBaseStepModalOpen, setIsBaseStepModalOpen] = useState(false);
  const [baseStepContext, setBaseStepContext] = useState<{ templateId: string, index: number | null, step: any } | null>(null);

  const [isSubTaskModalOpen, setIsSubTaskModalOpen] = useState(false);
  const [activeSubTaskContext, setActiveSubTaskContext] = useState<{ taskId: string, subTask: SubTask } | null>(null);

  const [isAddSubTaskModalOpen, setIsAddSubTaskModalOpen] = useState(false);
  const [targetTaskIdForNewSubTask, setTargetTaskIdForNewSubTask] = useState<string | null>(null);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentMapData, setCurrentMapData] = useState<string | null>(null);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Parent Task Modal State
  const [isParentTaskModalOpen, setIsParentTaskModalOpen] = useState(false);
  const [activeParentTask, setActiveParentTask] = useState<Task | null>(null);

  // Derived State
  const selectedProject = useMemo(() =>
    projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  // Handlers - Project
  const handleCreateProject = async (name: string, description: string, slackChannelId: string) => {
    await addProject(name, description, slackChannelId);
    showToast("Site Created Successfully");
  };

  const handleUpdateProject = async (project: Project) => {
    await saveProject(project);
    showToast("Site Details Updated");
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('PERMANENTLY DELETE ALL DATA FOR THIS SITE?')) {
      await deleteProject(id);
      setActiveView('projects');
      showToast("Site Erased");
    }
  };

  const handleAddTask = async (mapId: string, templateId: string) => {
    if (!selectedProject) return;
    try {
      await addTask(selectedProject.id, mapId, templateId);
      showToast("Manual Task Added");
    } catch (e: any) {
      alert(`Failed to add task: ${e.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedProject) return;
    if (window.confirm("DELETE ENTIRE TASK GROUP?\n\nThis will remove the parent item and ALL sub-tasks.")) {
      try {
        await deleteTaskFromHook(selectedProject.id, taskId);
        showToast("Task Group Deleted");
      } catch (e: any) {
        alert(`Failed to delete task: ${e.message}`);
      }
    }
  };

  // Handlers - Tasks
  const handleTaskTypeChange = async (taskId: string, newType: string) => {
    if (!selectedProject) return;
    const task = selectedProject.tasks.find(t => t.id === taskId);
    if (!task || task.type === newType) return;

    if (!window.confirm(`Switch asset class? This resets sub-tasks for this item.`)) return;

    const targetTemplate = selectedProject.templates.find(t => t.label === newType);
    if (!targetTemplate) return;

    const updatedTasks = selectedProject.tasks.map(t => {
      if (t.id !== taskId) return t;
      const freshSubTasks: SubTask[] = targetTemplate.baseSubTasks.map((bst, idx) => ({
        ...bst,
        id: generateUUID(),
        subTaskId: `${t.mapId}-${(idx + 1).toString().padStart(2, '0')}`,
        isCompleted: false,
        comments: [],
        photos: []
      }));
      return { ...t, type: newType, subTasks: freshSubTasks };
    });

    await updateProject({ ...selectedProject, tasks: updatedTasks });
  };

  const handleDeleteSubTask = async (taskId: string, subTaskId: string, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!selectedProject) return;

    if (window.confirm('PERMANENTLY REMOVE THIS WORKFLOW STEP?')) {
      try {
        const updatedTasks = selectedProject.tasks.map(task => {
          if (task.id !== taskId) return task;
          return {
            ...task,
            subTasks: task.subTasks.filter(st => String(st.id) !== String(subTaskId))
          };
        });
        await updateProject({ ...selectedProject, tasks: updatedTasks });
        showToast("Step Purged Successfully");
        if (isSubTaskModalOpen) setIsSubTaskModalOpen(false);
      } catch (err: any) {
        alert(`Failed to delete step: ${err.message}`);
        console.error("Delete SubTask Error:", err);
      }
    }
  };

  const handleInjectStep = async (taskId: string, taskType: string, details: string, productName: string) => {
    if (!selectedProject) return;
    const newTask: SubTask = {
      id: generateUUID(),
      subTaskId: `AD-HOC-${Math.floor(Math.random() * 999)}`,
      category: 'Manual',
      taskType,
      details,
      productName: productName || 'N/A',
      isCompleted: false,
      comments: [],
      photos: []
    };

    const updatedTasks = selectedProject.tasks.map(t =>
      t.id === taskId ? { ...t, subTasks: [...t.subTasks, newTask] } : t
    );

    await updateProject({ ...selectedProject, tasks: updatedTasks });
    showToast("Directive Injected Successfully");
  };

  const handleReorderSubTasks = (taskId: string, draggedId: string, targetId: string) => {
    if (selectedProjectId) reorderSubTasks(selectedProjectId, taskId, draggedId, targetId);
    showToast("Priorities Reordered");
  };

  // Handlers - Templates
  const handleSaveTemplate = async (template: LegendTemplate) => {
    if (!selectedProject) return;
    let newTemplates;
    if (selectedProject.templates.some(t => t.id === template.id)) {
      newTemplates = selectedProject.templates.map(t => t.id === template.id ? template : t);
    } else {
      newTemplates = [...selectedProject.templates, template];
    }
    await updateProject({ ...selectedProject, templates: newTemplates });
    showToast("Blueprint Saved to Project");
  };

  const handleDeleteTemplate = async (tpl: LegendTemplate) => {
    if (!selectedProject) return;
    if (window.confirm('Delete this entire category?')) {
      try {
        const newTemplates = selectedProject.templates.filter(t => t.id !== tpl.id);
        await updateProject({ ...selectedProject, templates: newTemplates });
      } catch (err: any) {
        alert(`Failed to delete category: ${err.message}`);
      }
    }
  };

  // Handlers - Base Steps
  const handleSaveBaseStep = async (templateId: string, index: number | null, taskType: string, details: string, productName: string) => {
    if (!selectedProject) return;
    const stepData = {
      category: selectedProject.templates.find(t => t.id === templateId)?.label || '',
      taskType, details, productName
    };

    const newTemplates = selectedProject.templates.map(t => {
      if (t.id !== templateId) return t;
      const newSteps = [...t.baseSubTasks];
      if (index !== null) {
        newSteps[index] = stepData;
      } else {
        newSteps.push(stepData);
      }
      return { ...t, baseSubTasks: newSteps };
    });

    await updateProject({ ...selectedProject, templates: newTemplates });
    showToast("Blueprint Updated for Project");
  };

  const handleDeleteBaseStep = async (templateId: string, index: number) => {
    if (!selectedProject) return;
    if (window.confirm('Wipe step from template?')) {
      try {
        const newTemplates = selectedProject.templates.map(t => {
          if (t.id !== templateId) return t;
          const updatedSteps = [...t.baseSubTasks];
          updatedSteps.splice(index, 1);
          return { ...t, baseSubTasks: updatedSteps };
        });
        await updateProject({ ...selectedProject, templates: newTemplates });
        showToast("Template Refined");
      } catch (err: any) {
        alert(`Failed to delete template step: ${err.message}`);
      }
    }
  };

  const handleMoveBaseStep = async (templateId: string, index: number, direction: 'up' | 'down') => {
    if (!selectedProject) return;
    const template = selectedProject.templates.find(t => t.id === templateId);
    if (!template) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.baseSubTasks.length) return;

    const newTemplates = selectedProject.templates.map(t => {
      if (t.id !== templateId) return t;
      const newSteps = [...t.baseSubTasks];
      const [movedItem] = newSteps.splice(index, 1);
      newSteps.splice(newIndex, 0, movedItem);
      return { ...t, baseSubTasks: newSteps };
    });

    await updateProject({ ...selectedProject, templates: newTemplates });
  };

  // Handlers - Global Templates (Duplicate logic but for Global State)
  const [isGlobalTemplatesModalOpen, setIsGlobalTemplatesModalOpen] = useState(false);
  const [editingGlobalTemplate, setEditingGlobalTemplate] = useState<LegendTemplate | null>(null);

  // Listen for event from Settings Modal
  useEffect(() => {
    const handleOpenGlobal = () => setIsGlobalTemplatesModalOpen(true);
    window.addEventListener('open-global-templates', handleOpenGlobal);
    return () => window.removeEventListener('open-global-templates', handleOpenGlobal);
  }, []);

  const handleSaveGlobalTemplate = async (template: LegendTemplate) => {
    let newTemplates;
    if (globalTemplates.some(t => t.id === template.id)) {
      newTemplates = globalTemplates.map(t => t.id === template.id ? template : t);
    } else {
      newTemplates = [...globalTemplates, template];
    }
    await saveGlobalTemplates(newTemplates);
    showToast("Global Defaults Updated");
  };

  const handleDeleteGlobalTemplate = async (tpl: LegendTemplate) => {
    if (window.confirm('Delete this GLOBAL Default Category? This will affect all future projects.')) {
      const newTemplates = globalTemplates.filter(t => t.id !== tpl.id);
      await saveGlobalTemplates(newTemplates);
    }
  };

  const handleSaveGlobalBaseStep = async (templateId: string, index: number | null, taskType: string, details: string, productName: string) => {
    const stepData = {
      category: globalTemplates.find(t => t.id === templateId)?.label || '',
      taskType, details, productName
    };

    const newTemplates = globalTemplates.map(t => {
      if (t.id !== templateId) return t;
      const newSteps = [...t.baseSubTasks];
      if (index !== null) {
        newSteps[index] = stepData;
      } else {
        newSteps.push(stepData);
      }
      return { ...t, baseSubTasks: newSteps };
    });

    await saveGlobalTemplates(newTemplates);
    showToast("Global Workflow Updated");
  };

  const handleDeleteGlobalBaseStep = async (templateId: string, index: number) => {
    if (window.confirm('Delete this GLOBAL Default Step?')) {
      const newTemplates = globalTemplates.map(t => {
        if (t.id !== templateId) return t;
        const updatedSteps = [...t.baseSubTasks];
        updatedSteps.splice(index, 1);
        return { ...t, baseSubTasks: updatedSteps };
      });
      await saveGlobalTemplates(newTemplates);
      showToast("Global Workflow Step Removed");
    }
  };

  const handleMoveGlobalBaseStep = async (templateId: string, index: number, direction: 'up' | 'down') => {
    const template = globalTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= template.baseSubTasks.length) return;

    const newTemplates = globalTemplates.map(t => {
      if (t.id !== templateId) return t;
      const newSteps = [...t.baseSubTasks];
      const [movedItem] = newSteps.splice(index, 1);
      newSteps.splice(newIndex, 0, movedItem);
      return { ...t, baseSubTasks: newSteps };
    });

    await saveGlobalTemplates(newTemplates);
  };

  const handleAddNewGlobalClass = () => {
    setEditingGlobalTemplate(null);
    // We repurpose the project template modal for now, or we'd need a separate context
    // Ideally, ConfigView triggers 'onEditTemplate' which opens TemplateModal.
    // But TemplateModal needs to know if it's saving to Project or Global.
    // Current TemplateModal calls 'onSave' passed prop. 
    // So distinct state is needed for "Is Active Modal Global?"
    setIsGlobalTemplateMode(true);
    setIsTemplateModalOpen(true);
  };

  const [isGlobalTemplateMode, setIsGlobalTemplateMode] = useState(false);
  const [isGlobalBaseStepMode, setIsGlobalBaseStepMode] = useState(false);

  // Wrappers to route the Generic Modals to Global Handlers
  const handleTemplateModalSave = (tpl: LegendTemplate) => {
    if (isGlobalTemplateMode) {
      handleSaveGlobalTemplate(tpl);
    } else {
      handleSaveTemplate(tpl);
    }
  };

  const handleBaseStepModalSave = (tId: string, idx: number | null, type: string, det: string, prod: string) => {
    if (isGlobalBaseStepMode) {
      handleSaveGlobalBaseStep(tId, idx, type, det, prod);
    } else {
      handleSaveBaseStep(tId, idx, type, det, prod);
    }
  };

  // Handlers - Sync & Uploads
  const handleFileUpload = async (file: File) => {
    if (!selectedProject) return;
    setIsProcessing(true);
    try {
      await processMapUpload(selectedProject.id, file, selectedProject.templates);
      showToast("AI Floorplan Extraction Complete");
    } catch (err) {
      console.error("AI Error:", err);
      showToast("Floorplan sync failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSyncToSlack = async () => {
    if (!selectedProject) return;
    if (!slackApiToken) {
      showToast("Missing Slack API Token in Global Settings", "error");
      setIsSettingsModalOpen(true);
      return;
    }
    if (!selectedProject.slackChannelId) {
      showToast("Missing Slack Channel ID in Project Settings", "error");
      setEditingProject(selectedProject);
      setIsProjectModalOpen(true);
      return;
    }

    setIsSyncingSlack(true);
    try {
      const result = await syncToSlack(selectedProject);
      if (result.failed === 0) {
        showToast(`Synced ${result.success} Canvas categories to Slack!`);
      } else {
        showToast(`Synced ${result.success}, Failed ${result.failed}`, 'error');
      }
    } catch (e: any) {
      showToast(`Sync Failed: ${e.message}`, "error");
    } finally {
      setIsSyncingSlack(false);
    }
  };

  // SubTask Details - Photos & Comments Actions
  // These return Promise<SubTask> but UI expects void mostly, 
  // since we rely on top-level update via useProjectManager.
  // We can implement them here and use updateSubTask.

  const handlePhotoUpload = async (taskId: string, subTask: SubTask, files: FileList) => {
    const newPhotos: string[] = [];
    const promises: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    }
    const loadedPhotos = await Promise.all(promises);
    const updatedST = {
      ...subTask,
      photos: [...(subTask.photos || []), ...loadedPhotos]
    };

    if (selectedProjectId) await updateSubTask(selectedProjectId, taskId, updatedST);
    if (activeSubTaskContext && activeSubTaskContext.subTask.id === subTask.id) {
      setActiveSubTaskContext({ ...activeSubTaskContext, subTask: updatedST });
    }
    showToast("Evidence Uploaded");
    return updatedST;
  };

  const handleDeletePhoto = async (taskId: string, subTask: SubTask, index: number) => {
    if (!window.confirm("Remove this photo?")) return subTask;
    const updatedPhotos = [...subTask.photos];
    updatedPhotos.splice(index, 1);
    const updatedST = { ...subTask, photos: updatedPhotos };

    if (selectedProjectId) await updateSubTask(selectedProjectId, taskId, updatedST);
    if (activeSubTaskContext && activeSubTaskContext.subTask.id === subTask.id) {
      setActiveSubTaskContext({ ...activeSubTaskContext, subTask: updatedST });
    }
    return updatedST;
  };

  const handleAddComment = async (taskId: string, subTask: SubTask, comment: Comment) => {
    const updatedST = { ...subTask, comments: [...subTask.comments, comment] };
    if (selectedProjectId) await updateSubTask(selectedProjectId, taskId, updatedST);
    if (activeSubTaskContext && activeSubTaskContext.subTask.id === subTask.id) {
      setActiveSubTaskContext({ ...activeSubTaskContext, subTask: updatedST });
    }
    return updatedST;
  };

  // Parent Task Details Handlers
  const handleParentTaskClick = (taskId: string) => {
    if (!selectedProject) return;
    const task = selectedProject.tasks.find(t => t.id === taskId);
    if (task) {
      setActiveParentTask(task);
      setIsParentTaskModalOpen(true);
    }
  };

  const handleParentTaskPhotoUpload = async (taskId: string, file: string) => {
    await addParentTaskPhoto(selectedProject!.id, taskId, file);
    // Update local state for immediate UI feedback
    if (activeParentTask && activeParentTask.id === taskId) {
      setActiveParentTask({ ...activeParentTask, photos: [...(activeParentTask.photos || []), file] });
    }
    showToast("Evidence Added to Task Group");
  };

  const handleDeleteParentTaskPhoto = async (taskId: string, index: number) => {
    if (!confirm("Delete this photo?")) return;
    await deleteParentTaskPhoto(selectedProject!.id, taskId, index);
    if (activeParentTask && activeParentTask.id === taskId) {
      const newPhotos = [...(activeParentTask.photos || [])];
      newPhotos.splice(index, 1);
      setActiveParentTask({ ...activeParentTask, photos: newPhotos });
    }
    showToast("Photo Removed");
  };

  const handleParentTaskComment = async (taskId: string, comment: string) => {
    await addParentTaskComment(selectedProject!.id, taskId, comment);
    // We'd ideally need the new comment object back from the hook to update state correctly 
    // without refetching, but for now we rely on the hook refreshing 'projects' 
    // and checking if we need to manually update activeParentTask or just close/reopen.
    // Better: Update hook to return the new comment or Task.
    // For now, let's just trigger a toast. The modal might not update immediately without proper state sync 
    // unless we rely on 'selectedProject' updating and re-finding the task.
    // Actually, since 'projects' updates, 'selectedProject' updates, and we can re-derive the task?
    // No, 'activeParentTask' is local state. We should sync it.
    // Simulating the update locally:
    const newC: Comment = { id: generateUUID(), user: 'Field Op', text: comment, timestamp: new Date().toISOString() };
    if (activeParentTask && activeParentTask.id === taskId) {
      setActiveParentTask({ ...activeParentTask, comments: [...(activeParentTask.comments || []), newC] });
    }
    showToast("Log Added");
  };

  const handleSubTaskSave = async (taskId: string, subTask: SubTask) => {
    if (selectedProjectId) {
      await updateSubTask(selectedProjectId, taskId, subTask);
      showToast("Changes Committed");
    }
  };

  const handleSearchResultClick = (result: any) => {
    setGlobalSearchQuery('');
    if (result.type === 'project') {
      setSelectedProjectId(result.projectId);
      setActiveView('tasks');
    } else {
      setSelectedProjectId(result.projectId);
      setActiveView('tasks');
      // Could scroll to task logic here if implemented
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={48} />
          <p className="font-black uppercase tracking-widest text-slate-400">Loading DB v3</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedProjectId={selectedProjectId}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      <div className="flex-1 flex flex-col h-screen relative">
        <Header
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          globalSearchResults={globalSearchResults}
          onResultClick={handleSearchResultClick}
        />

        <main className="flex-1 overflow-y-auto p-12 scroll-smooth">
          {activeView === 'projects' && (
            <ProjectListView
              projects={projects}
              onSelectProject={(id) => { setSelectedProjectId(id); setActiveView('tasks'); }}
              onEditProject={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }}
              onDeleteProject={async (id, e) => {
                if (e && e.stopPropagation) e.stopPropagation();
                try {
                  await handleDeleteProject(id, e);
                } catch (err: any) {
                  alert(`Failed to delete project: ${err.message}`);
                }
              }}
              onAddNewProject={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
            />
          )}

          {activeView === 'tasks' && selectedProject && (
            <TaskListView
              selectedProject={selectedProject}
              isProcessing={isProcessing}
              isSyncingSlack={isSyncingSlack}
              onOpenMap={(data) => {
                setCurrentMapData(data);
                setIsMapOpen(true);
              }}
              onSyncToSlack={handleSyncToSlack}
              onFileUpload={handleFileUpload}
              onTaskTypeChange={handleTaskTypeChange}
              onSubTaskClick={(taskId, st) => { setActiveSubTaskContext({ taskId, subTask: st }); setIsSubTaskModalOpen(true); }}
              onDeleteSubTask={handleDeleteSubTask}
              onInjectStep={(taskId) => {
                setTargetTaskIdForNewSubTask(taskId);
                setIsAddSubTaskModalOpen(true);
              }}
              onReorderSubTasks={handleReorderSubTasks}
              onAddTask={() => setIsAddTaskModalOpen(true)}
              onDeleteTask={handleDeleteTask}
              onTaskClick={handleParentTaskClick}
            />
          )}

          {activeView === 'config' && selectedProject && (
            <ConfigView
              selectedProject={selectedProject}
              onAddNewClass={() => {
                setIsGlobalTemplateMode(false);
                setEditingTemplate(null);
                setIsTemplateModalOpen(true);
              }}
              onEditTemplate={(tpl) => {
                setIsGlobalTemplateMode(false);
                setEditingTemplate(tpl);
                setIsTemplateModalOpen(true);
              }}
              onDeleteTemplate={handleDeleteTemplate}
              onEditBaseStep={(tId, idx, step) => {
                setIsGlobalBaseStepMode(false);
                setBaseStepContext({ templateId: tId, index: idx, step });
                setIsBaseStepModalOpen(true);
              }}
              onDeleteBaseStep={handleDeleteBaseStep}
              onAddWorkflowStep={(tId) => {
                setIsGlobalBaseStepMode(false);
                setBaseStepContext({ templateId: tId, index: null, step: null });
                setIsBaseStepModalOpen(true);
              }}
              onMoveBaseStep={handleMoveBaseStep}
            />
          )}

          {activeView === 'dashboard' && selectedProject && (
            <DashboardView selectedProject={selectedProject} />
          )}
        </main>
      </div>

      {/* Overlays */}
      {isMapOpen && currentMapData && (
        <MapViewer
          mapData={currentMapData}
          onClose={() => {
            setIsMapOpen(false);
            setCurrentMapData(null);
          }}
        />
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        editingProject={editingProject}
        onSave={handleUpdateProject}
        onCreate={handleCreateProject}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        slackApiToken={slackApiToken}
        slackClientId={slackClientId}
        slackClientSecret={slackClientSecret}
        onSave={async (token, cid, csecret) => {
          updateSettings(token, cid, csecret);
          showToast("Global Settings Saved");
        }}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        editingTemplate={editingTemplate}
        onSave={handleTemplateModalSave}
      />

      <BaseStepModal
        isOpen={isBaseStepModalOpen}
        onClose={() => setIsBaseStepModalOpen(false)}
        stepContext={baseStepContext}
        onSave={handleBaseStepModalSave}
      />

      <InjectStepModal
        isOpen={isAddSubTaskModalOpen}
        onClose={() => setIsAddSubTaskModalOpen(false)}
        targetTaskId={targetTaskIdForNewSubTask}
        onSave={handleInjectStep}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        templates={selectedProject?.templates || []}
        onSave={handleAddTask}
      />

      <TaskDetailModal
        isOpen={isSubTaskModalOpen}
        onClose={() => setIsSubTaskModalOpen(false)}
        activeContext={activeSubTaskContext}
        selectedProject={selectedProject}
        onSave={handleSubTaskSave}
        onDelete={handleDeleteSubTask}
        onPhotoUpload={handlePhotoUpload}
        onDeletePhoto={handleDeletePhoto}
        onAddComment={handleAddComment}
      />

      <ParentTaskModal
        isOpen={isParentTaskModalOpen}
        onClose={() => setIsParentTaskModalOpen(false)}
        task={activeParentTask}
        projectName={selectedProject?.name || ''}
        onPhotoUpload={handleParentTaskPhotoUpload}
        onDeletePhoto={handleDeleteParentTaskPhoto}
        onAddComment={handleParentTaskComment}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <GlobalTemplatesModal
        isOpen={isGlobalTemplatesModalOpen}
        onClose={() => setIsGlobalTemplatesModalOpen(false)}
        globalTemplates={globalTemplates}
        onAddNewClass={() => {
          setIsGlobalTemplateMode(true);
          setEditingTemplate(null);
          setIsTemplateModalOpen(true);
        }}
        onEditTemplate={(tpl) => {
          setIsGlobalTemplateMode(true);
          setEditingTemplate(tpl);
          setIsTemplateModalOpen(true);
        }}
        onDeleteTemplate={handleDeleteGlobalTemplate}
        onEditBaseStep={(tId, idx, step) => {
          setIsGlobalBaseStepMode(true);
          setBaseStepContext({ templateId: tId, index: idx, step });
          setIsBaseStepModalOpen(true);
        }}
        onDeleteBaseStep={handleDeleteGlobalBaseStep}
        onAddWorkflowStep={(tId) => {
          setIsGlobalBaseStepMode(true);
          setBaseStepContext({ templateId: tId, index: null, step: null });
          setIsBaseStepModalOpen(true);
        }}
        onMoveBaseStep={handleMoveGlobalBaseStep}
      />
    </div>
  );
}
