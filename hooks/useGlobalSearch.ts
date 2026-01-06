import { useState, useEffect } from 'react';
import { Project } from '../types';

export const useGlobalSearch = (projects: Project[]) => {
    const [globalSearchQuery, setGlobalSearchQuery] = useState('');
    const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);

    useEffect(() => {
        if (!globalSearchQuery.trim()) {
            setGlobalSearchResults([]);
            return;
        }
        const query = globalSearchQuery.toLowerCase();
        const results: any[] = [];

        projects.forEach(p => {
            // Search Projects
            if (p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)) {
                results.push({
                    type: 'project',
                    id: p.id,
                    title: p.name,
                    subtitle: 'Site Project',
                    projectId: p.id
                });
            }

            // Search Tasks & SubTasks
            p.tasks.forEach(t => {
                if (t.mapId.toLowerCase().includes(query)) {
                    results.push({
                        type: 'task',
                        id: t.id,
                        title: `Task: ${t.mapId}`,
                        subtitle: `In: ${p.name}`,
                        projectId: p.id
                    });
                }
                t.subTasks.forEach(st => {
                    if (st.details.toLowerCase().includes(query) || st.productName.toLowerCase().includes(query)) {
                        results.push({
                            type: 'subtask',
                            id: st.id,
                            title: st.details,
                            subtitle: `Step in ${t.mapId} (${p.name})`,
                            projectId: p.id,
                            taskId: t.id
                        });
                    }
                });
            });
        });

        setGlobalSearchResults(results.slice(0, 8)); // Limit to 8 results for cleaner UI
    }, [globalSearchQuery, projects]);

    return {
        globalSearchQuery,
        setGlobalSearchQuery,
        globalSearchResults
    };
};
