import React from 'react';
import { Modal } from '../shared/Modal';
import {
    Book, Map, CheckSquare, Settings, Upload, MonitorPlay,
    MessageSquare, Camera, LayoutDashboard, Search, Download,
    Mic, Plus, Edit2, Trash2, Command
} from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="LAT Engine User Manual">
            <div className="space-y-16 max-h-[75vh] overflow-y-auto pr-6">

                {/* Introduction */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 text-lat-blue">
                        <MonitorPlay size={40} className="shrink-0" />
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Welcome to LAT Engine</h2>
                            <p className="text-slate-400 font-bold">Comprehensive Field Management System</p>
                        </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        This application is designed to bridge the gap between architectural floorplans and field operations.
                        It parses PDF maps to automatically generate task lists, tracks installation progress in real-time,
                        and synchronizes every update with your team via Slack.
                    </p>
                </section>

                <hr className="border-slate-100 border-2 rounded-full" />

                {/* 1. Dashboard & Analytics */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg">1</span>
                        Dashboard & Analytics
                    </h3>
                    <div className="pl-14 space-y-6">
                        <p className="text-slate-600">
                            The <strong>Analytics Dashboard</strong> provides a high-level view of project health.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><LayoutDashboard size={18} /> Project Health</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li>• <strong>Completion Rate:</strong> Overall percentage of finished sub-tasks.</li>
                                    <li>• <strong>Asset Breakdown:</strong> Distribution of tasks by category (e.g., Data vs. AV).</li>
                                    <li>• <strong>Recent Activity:</strong> Timeline of latest comments and photo uploads.</li>
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><Download size={18} /> Data Export</h4>
                                <p className="text-sm text-slate-600 mb-2">
                                    Need meaningful data? Use the <strong>CSV Export</strong> feature in the Task List view.
                                </p>
                                <p className="text-xs text-slate-400">
                                    Exports include: Task Name, Category, Sub-task Status, Completion Time, and Who performed the action.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Configuration Deep Dive */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg">2</span>
                        Project Configuration
                    </h3>
                    <div className="pl-14">
                        <p className="text-slate-600 mb-6">
                            The "Brain" of the system. Configure how the AI reads your maps and what tasks are generated.
                        </p>

                        <div className="space-y-8">
                            <div>
                                <h4 className="font-black text-lg text-slate-800 mb-3 flex items-center gap-2"><Settings size={20} className="text-lat-blue" /> Legend Templates</h4>
                                <p className="text-slate-600 mb-4 text-sm">Create a template for every device type on your map (e.g., "Data Jack", "Thermostat").</p>
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <strong className="block text-slate-800 mb-2">Key Settings:</strong>
                                    <ul className="space-y-3 text-sm text-slate-600">
                                        <li className="flex gap-3">
                                            <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs font-bold text-slate-700">Label</span>
                                            <span>The display name for the group (e.g., "Wireless Access Point").</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs font-bold text-slate-700">Match Keys</span>
                                            <span>
                                                <strong>CRITICAL:</strong> These short codes tell the system what to look for on the PDF.
                                                <br />Example: If your map labels WAPs as "WAP-01", "WAP-02", add <code>WAP</code> as a match key.
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-black text-lg text-slate-800 mb-3 flex items-center gap-2"><CheckSquare size={20} className="text-lat-blue" /> Workflow Definitions</h4>
                                <p className="text-slate-600 mb-4 text-sm">Define the "Standard Operating Procedure" for each device type.</p>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                                    <p className="text-sm text-slate-600 italic mb-4">
                                        "When a Data Jack is found, what needs to happen?"
                                    </p>
                                    <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 font-medium">
                                        <li>Pre-Wire (Pull Cable)</li>
                                        <li>Trim (Install Jack)</li>
                                        <li>Test (Certify Line)</li>
                                    </ol>
                                    <p className="text-xs text-slate-400 mt-4">
                                        You can edit these steps, add product names, or reorder them at any time. Changes affect future tasks.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Map Import & AI Processing */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg">3</span>
                        Map Intelligence
                    </h3>
                    <div className="pl-14 space-y-6">
                        <div className="bg-lat-blue/5 p-8 rounded-3xl border border-lat-blue/10">
                            <h4 className="font-black text-lat-blue mb-4 uppercase tracking-widest text-sm flex items-center gap-3">
                                <Upload size={18} />
                                The Sync Process
                            </h4>
                            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                                <p>
                                    1. <strong>Upload PDF:</strong> Go to Task Lists &rarr; Click "Sync Map" &rarr; Select your architectural floorplan PDF.
                                </p>
                                <p>
                                    2. <strong>AI Scanning:</strong> The system analyzes the text layer of the PDF. It looks for text that starts with your <strong>Match Keys</strong> followed by numbers (e.g., "D-101", "C22", "AV-1").
                                </p>
                                <p>
                                    3. <strong>Auto-Generation:</strong> For every match found, a specific Task Group is created, populated with the workflow steps defined in your Configuration.
                                </p>
                                <p>
                                    4. <strong>Location Pinning:</strong> The exact X/Y coordinates on the page are saved, allowing you to "zoom to task" later.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <span className="text-2xl">⚠️</span>
                            <p className="text-xs text-yellow-800 leading-relaxed">
                                <strong>Troubleshooting:</strong> If no tasks appear, your PDF might be a "Raster Scan" (an image).
                                The system requires "Vector PDFs" (selectable text) to read labels.
                                Alternatively, check your Match Keys in Configuration.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. Task Management */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg">4</span>
                        Field Operations
                    </h3>
                    <div className="pl-14 grid grid-cols-1 gap-8">
                        <div>
                            <h4 className="font-bold text-slate-800 mb-3">Task Interaction</h4>
                            <p className="text-sm text-slate-600 mb-4">The Task List is your daily driver. It behaves like a physical clipboard but smarter.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border border-slate-100 rounded-xl hover:border-lat-blue/30 transition-colors">
                                    <strong className="text-slate-800 text-sm flex items-center gap-2 mb-2"><Map size={14} /> Map Zoom</strong>
                                    <p className="text-xs text-slate-500">Click the map icon on a task row to open the floorplan and auto-focus on that device.</p>
                                </div>
                                <div className="p-4 border border-slate-100 rounded-xl hover:border-lat-blue/30 transition-colors">
                                    <strong className="text-slate-800 text-sm flex items-center gap-2 mb-2"><Mic size={14} /> Voice Notes</strong>
                                    <p className="text-xs text-slate-500">Tap the Mic icon in comments to dictate notes. Perfect for busy hands on a ladder.</p>
                                </div>
                                <div className="p-4 border border-slate-100 rounded-xl hover:border-lat-blue/30 transition-colors">
                                    <strong className="text-slate-800 text-sm flex items-center gap-2 mb-2"><Camera size={14} /> Evidence</strong>
                                    <p className="text-xs text-slate-500">Upload photos to specific sub-tasks to prove "Pre-Wire" or "Trim" was done correctly.</p>
                                </div>
                                <div className="p-4 border border-slate-100 rounded-xl hover:border-lat-blue/30 transition-colors">
                                    <strong className="text-slate-800 text-sm flex items-center gap-2 mb-2"><Edit2 size={14} /> Live Status</strong>
                                    <p className="text-xs text-slate-500">Clicking a sub-task bubble toggles it between "Pending" (Grey) and "Complete" (Blue).</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-800 mb-3">Manual Control</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li className="flex gap-3">
                                    <Plus className="shrink-0 text-lat-blue" size={18} />
                                    <div>
                                        <strong className="text-slate-800">Custom Tasks:</strong>
                                        <span> Use the "Add Task" button for items not on the map. Select the "Custom" legend to create an empty container you can fill with ad-hoc steps.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <Command className="shrink-0 text-lat-blue" size={18} />
                                    <div>
                                        <strong className="text-slate-800">Inject Step:</strong>
                                        <span> Forgot a step? Open a task and click "Inject Step" to add a one-off requirement directly into that specific unit's workflow.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 5. Global Settings & Integrations */}
                <section className="space-y-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                        <span className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-lg">5</span>
                        Global Settings
                    </h3>
                    <div className="pl-14 space-y-4">
                        <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl">
                            <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Settings size={18} /> System Level Configuration</h4>
                            <p className="text-sm mb-4">
                                Access via the <strong>Global Settings</strong> button in the sidebar footer.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <strong className="text-white block text-xs uppercase tracking-widest mb-1">Slack Integration</strong>
                                    <p className="text-xs leading-relaxed">
                                        Enter your <strong>Slack Bot User OAuth Token</strong> (starts with <code>xoxb-</code>).
                                        This token is stored locally on your device for security.
                                        Once verified, use "Sync Project" in the project list to push updates to a specific channel.
                                    </p>
                                </div>
                                <div className="border-t border-slate-700 pt-4">
                                    <strong className="text-white block text-xs uppercase tracking-widest mb-1">Data Privacy</strong>
                                    <p className="text-xs leading-relaxed">
                                        All project data is stored locally in your browser (IndexedDB).
                                        Clearing your browser cache <strong>WILL ERASE</strong> your projects unless you have synced them externally.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="pt-12 pb-4 text-center">
                    <p className="text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                        LAT Engine v1.0 &mdash; Build 2024.1 &mdash; Authorized Personnel Only
                    </p>
                </div>
            </div>
        </Modal>
    );
};
