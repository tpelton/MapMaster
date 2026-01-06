import { useState, useEffect } from 'react';
import { Project, Task, SubTask, LegendTemplate } from '../types';
import { StorageService } from '../services/mapStorage';
import { SlackService } from '../services/slackService';
import { INITIAL_LEGEND_TEMPLATES } from '../constants';
import { generateUUID } from '../utils/helpers';
import { parseMapWithGemini } from '../services/geminiService';

export const useProjectManager = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Settings State
    const [slackApiToken, setSlackApiToken] = useState('');
    const [slackClientId, setSlackClientId] = useState('');
    const [slackClientSecret, setSlackClientSecret] = useState('');

    // Global Templates State
    const [globalTemplates, setGlobalTemplates] = useState<LegendTemplate[]>([]);

    // Hydration
    useEffect(() => {
        const hydrate = async () => {
            try {
                const p = await StorageService.getAllProjects();
                const s = await StorageService.getSettings();
                const t = await StorageService.getTemplates();

                if (s) {
                    if (s.slackApiToken) setSlackApiToken(s.slackApiToken);
                    if (s.slackClientId) setSlackClientId(s.slackClientId);
                    if (s.slackClientSecret) setSlackClientSecret(s.slackClientSecret);
                }

                // Load Global Templates or fallback to Initial
                if (t && t.length > 0) {
                    setGlobalTemplates(t);
                } else {
                    setGlobalTemplates([...INITIAL_LEGEND_TEMPLATES]);
                }

                // Migration logic
                const updatedProjects = p.map(proj => {
                    let newTemplates = proj.templates;
                    let newTasks = proj.tasks;

                    if (!proj.templates || proj.templates.length === 0) {
                        newTemplates = [...INITIAL_LEGEND_TEMPLATES];
                    } else {
                        // Ensure 'Custom' template exists for existing projects
                        const customTemplate = INITIAL_LEGEND_TEMPLATES.find(t => t.id === 'custom');
                        if (customTemplate && !newTemplates.find(t => t.label === 'Custom')) {
                            newTemplates = [...newTemplates, customTemplate];
                        }
                    }

                    if (proj.tasks) {
                        newTasks = proj.tasks.map((t: Task) => ({
                            ...t,
                            subTasks: t.subTasks.map((st: SubTask) => {
                                if (!st.photos) return { ...st, photos: [] };
                                return st;
                            })
                        }));
                    }

                    return { ...proj, templates: newTemplates, tasks: newTasks };
                });

                setProjects(updatedProjects);
            } catch (e) {
                console.error("Hydration Error", e);
            } finally {
                setIsInitialLoading(false);
            }
        };
        hydrate();
    }, []);

    const saveProject = async (project: Project) => {
        setProjects(prev => prev.map(p => p.id === project.id ? project : p));
        await StorageService.saveProject(project); // Simplified await
    };

    const addProject = async (name: string, description: string, slackChannelId: string) => {
        const newProject: Project = {
            id: generateUUID(),
            name,
            description,
            slackChannelId,
            tasks: [],
            templates: [...globalTemplates], // Use Global Templates
            createdAt: new Date().toISOString()
        };
        setProjects(prev => [...prev, newProject]);
        await StorageService.saveProject(newProject);
        return newProject;
    };

    const updateProject = async (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        await StorageService.saveProject(updatedProject);
    };

    const deleteProject = async (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (selectedProjectId === id) setSelectedProjectId(null);
        await StorageService.deleteProject(id);
    };

    const saveGlobalTemplates = async (templates: LegendTemplate[]) => {
        setGlobalTemplates(templates);
        await StorageService.saveTemplates(templates);
    };

    const updateSubTask = async (projectId: string, taskId: string, updatedSubTask: SubTask) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedProject = {
            ...project,
            tasks: project.tasks.map(t => t.id === taskId ? {
                ...t,
                subTasks: t.subTasks.map(st => st.id === updatedSubTask.id ? updatedSubTask : st)
            } : t)
        };
        await updateProject(updatedProject);
    };

    const reorderSubTasks = async (projectId: string, taskId: string, draggedId: string, targetId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;

        const newSubTasks = [...task.subTasks];
        const oldIndex = newSubTasks.findIndex(st => st.id === draggedId);
        const newIndex = newSubTasks.findIndex(st => st.id === targetId);

        if (oldIndex === -1 || newIndex === -1) return;

        const [movedItem] = newSubTasks.splice(oldIndex, 1);
        newSubTasks.splice(newIndex, 0, movedItem);

        const updatedProject = {
            ...project,
            tasks: project.tasks.map(t => t.id === taskId ? { ...t, subTasks: newSubTasks } : t)
        };
        await updateProject(updatedProject);
    };

    const addTask = async (projectId: string, mapId: string, templateId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const template = project.templates.find(t => t.id === templateId);
        if (!template) return;

        const newTask: Task = {
            id: generateUUID(),
            mapId: mapId,
            name: mapId,
            type: template.label,
            createdAt: new Date().toISOString(),
            subTasks: template.baseSubTasks.map((bst, idx) => ({
                ...bst,
                id: generateUUID(),
                subTaskId: `${mapId}-${(idx + 1).toString().padStart(2, '0')}`,
                isCompleted: false,
                comments: [],
                photos: []
            })),
            comments: [],
            photos: []
        };

        const updatedProject = { ...project, tasks: [...project.tasks, newTask] };
        await updateProject(updatedProject);
    };

    const deleteTask = async (projectId: string, taskId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const updatedProject = {
            ...project,
            tasks: project.tasks.filter(t => t.id !== taskId)
        };
        await updateProject(updatedProject);
    };

    // Parent Task Comment/Photo Handlers
    const addParentTaskComment = async (projectId: string, taskId: string, comment: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const newComment = {
            id: generateUUID(),
            user: 'Field Op',
            text: comment,
            timestamp: new Date().toISOString()
        };
        const updatedProject = {
            ...project,
            tasks: project.tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t)
        };
        await updateProject(updatedProject);
    };

    const addParentTaskPhoto = async (projectId: string, taskId: string, file: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updatedProject = {
            ...project,
            tasks: project.tasks.map(t => t.id === taskId ? { ...t, photos: [...(t.photos || []), file] } : t)
        };
        await updateProject(updatedProject);
    };

    const deleteParentTaskPhoto = async (projectId: string, taskId: string, photoIndex: number) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        const updatedProject = {
            ...project,
            tasks: project.tasks.map(t => t.id === taskId ? {
                ...t,
                photos: t.photos ? t.photos.filter((_, i) => i !== photoIndex) : []
            } : t)
        };
        await updateProject(updatedProject);
    };

    const processMapUpload = async (projectId: string, file: File, templates: LegendTemplate[]) => {
        // ... (rest of function)
        const reader = new FileReader();
        return new Promise<void>((resolve, reject) => {
            reader.onload = async () => {
                try {
                    const dataUrl = reader.result as string;
                    const base64 = dataUrl.split(',')[1];
                    await StorageService.saveMap(projectId, dataUrl);

                    // Use Local PDF Service instead of Gemini
                    let results: string[] = [];
                    if (file.type === 'application/pdf') {
                        const { extractTextFromPDF } = await import('../services/pdfService');
                        results = await extractTextFromPDF(file);
                        console.log("PDF Extraction Results:", results);
                    } else {
                        // Fallback/Legacy or Image handling - maybe keep Gemini for images?
                        // For now, user asked to switch methods.
                        // We will just try to parse Gemini for images if key exists, otherwise empty.
                        try {
                            const { parseMapWithGemini } = await import('../services/geminiService');
                            results = await parseMapWithGemini(base64, file.type);
                        } catch (e) {
                            console.warn("Gemini skipped/failed for image:", e);
                        }
                    }

                    if (results && results.length > 0) {
                        const project = projects.find(p => p.id === projectId);
                        if (!project) return;

                        // Check if we found ANY matches
                        const newTasks: Task[] = [];

                        results.forEach(mapId => {
                            // Find matching template based on prefix
                            // Check matchKeys first (e.g. "D" matches "D101")
                            // Fallback to label if needed, but primary logic is keys.

                            // Find matching template based on STRICT Pattern: {Key}{Numbers}
                            // Example: Key="C", ID="C01" -> Match
                            // Example: Key="C", ID="Cafe" -> No Match
                            const matchedTemplate = templates.find(t => {
                                if (t.matchKeys && t.matchKeys.length > 0) {
                                    return t.matchKeys.some(key => {
                                        const keyUpper = key.toUpperCase();
                                        const idUpper = mapId.toUpperCase();

                                        if (!idUpper.startsWith(keyUpper)) return false;

                                        // Check that the rest is digits, slashes, or dashes
                                        // Allows: "01", "1/2", "3-5", "5/6"
                                        const suffix = idUpper.slice(keyUpper.length);
                                        return suffix.length > 0 && /^[\d\/\-]+$/.test(suffix);
                                    });
                                }
                                return false;
                            });

                            if (matchedTemplate) {
                                newTasks.push({
                                    id: generateUUID(),
                                    mapId: mapId,
                                    name: mapId,
                                    type: matchedTemplate.label,
                                    createdAt: new Date().toISOString(),
                                    subTasks: matchedTemplate.baseSubTasks.map((bst, idx) => ({
                                        ...bst,
                                        id: generateUUID(),
                                        subTaskId: `${mapId}-${(idx + 1).toString().padStart(2, '0')}`,
                                        isCompleted: false,
                                        comments: [],
                                        photos: []
                                    })),
                                    comments: [],
                                    photos: []
                                });
                            }
                        });

                        if (newTasks.length === 0) {
                            alert(`Found ${results.length} text items, but none matched your Legend Keys.\n\nExample found: "${results[0]}"\nYour Keys: ${templates.flatMap(t => t.matchKeys).join(', ')}`);
                        } else {
                            const updatedProject = { ...project, tasks: [...project.tasks, ...newTasks] };
                            await updateProject(updatedProject);
                            alert(`Successfully added ${newTasks.length} tasks!`);
                        }
                        resolve();
                    } else {
                        // Results were empty - likely a scanned PDF
                        alert("No text found in PDF. This might be a scanned image.\n\nPlease use a PDF with selectable text, or enable Cloud AI extraction (if configured).");
                        resolve();
                    }
                } catch (e) {
                    console.error("Sync Error Detailed:", e);
                    reject(e);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const updateSettings = async (token: string, clientId: string, clientSecret: string) => {
        setSlackApiToken(token);
        setSlackClientId(clientId);
        setSlackClientSecret(clientSecret);
        await StorageService.saveSettings({ slackApiToken: token, slackClientId: clientId, slackClientSecret: clientSecret });
    };

    const syncToSlack = async (project: Project) => {
        return await SlackService.syncProjectToSlack(project, slackApiToken, slackClientId, slackClientSecret);
    };

    return {
        projects,
        selectedProjectId,
        setSelectedProjectId,
        isInitialLoading,
        addProject,
        updateProject,
        deleteProject,
        saveProject,
        slackApiToken,
        slackClientId,
        slackClientSecret,
        updateSettings,
        updateSubTask,
        reorderSubTasks,
        processMapUpload,
        syncToSlack,
        addTask,
        deleteTask,
        addParentTaskComment,
        addParentTaskPhoto,
        deleteParentTaskPhoto,
        globalTemplates,
        saveGlobalTemplates
    };
};
