import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend
} from 'recharts';
import { Project } from '../../types';

interface DashboardViewProps {
    selectedProject: Project | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ selectedProject }) => {
    if (!selectedProject) return null;

    const allSubTasks = selectedProject.tasks.flatMap(t => t.subTasks);
    const total = allSubTasks.length;
    const completed = allSubTasks.filter(st => st.isCompleted).length;
    const pending = total - completed;

    const pieData = [
        { name: 'Completed', value: completed },
        { name: 'Pending', value: pending },
    ];

    const COLORS = ['#4f46e5', '#f1f5f9'];

    const categoryStats = selectedProject.tasks.reduce((acc: any, task) => {
        const type = task.type;
        if (!acc[type]) acc[type] = { name: type, total: 0, completed: 0 };
        acc[type].total += task.subTasks.length;
        acc[type].completed += task.subTasks.filter(st => st.isCompleted).length;
        return acc;
    }, {});

    const barData = Object.values(categoryStats).map((stat: any) => ({
        name: stat.name,
        Progress: Math.round((stat.completed / stat.total) * 100) || 0,
        Count: stat.total
    }));

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">Project Analytics</h1>
                    <p className="text-slate-500 font-medium">Site: <span className="text-lat-blue-600">{selectedProject.name}</span></p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Progress</p>
                        <p className="text-3xl font-black text-lat-blue-600">{total > 0 ? Math.round((completed / total) * 100) : 0}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-lat-blue-600 animate-pulse"></div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 h-[500px] flex flex-col">
                    <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Completion Ratio</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 h-[500px] flex flex-col">
                    <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Class Readiness (%)</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="Progress" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Deliverables</p>
                    <p className="text-4xl font-black text-slate-800">{total}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verified Items</p>
                    <p className="text-4xl font-black text-green-600">{completed}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Open Actions</p>
                    <p className="text-4xl font-black text-orange-500">{pending}</p>
                </div>
            </div>
        </div>
    );
};
