import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, Save } from 'lucide-react';
import { SUBJECTS } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { Grade } from '../types';

const Analytics: React.FC = () => {
    const { grades, addGrade, deleteGrade } = useAuth();
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [newGrade, setNewGrade] = useState<Partial<Grade>>({
        subject: SUBJECTS[0],
        score: 0,
        maxScore: 100,
        type: 'Exam',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGrade.score !== undefined && newGrade.maxScore && newGrade.subject && newGrade.date && newGrade.type) {
            addGrade({
                id: uuidv4(),
                subject: newGrade.subject,
                score: Number(newGrade.score),
                maxScore: Number(newGrade.maxScore),
                type: newGrade.type as any,
                date: newGrade.date
            });
            setShowForm(false);
            setNewGrade({ ...newGrade, score: 0 });
        }
    };

    // Data Processing for Charts
    // 1. Performance Over Time (Line Chart) - Sorted by Date
    const sortedGrades = [...grades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const lineData = sortedGrades.map(g => ({
        date: new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        percentage: Math.round((g.score / g.maxScore) * 100),
        subject: g.subject
    }));

    // 2. Average by Subject (Bar Chart)
    const subjectMap: { [key: string]: { total: number, count: number } } = {};
    grades.forEach(g => {
        if (!subjectMap[g.subject]) subjectMap[g.subject] = { total: 0, count: 0 };
        subjectMap[g.subject].total += (g.score / g.maxScore) * 100;
        subjectMap[g.subject].count += 1;
    });
    const barData = Object.keys(subjectMap).map(subj => ({
        subject: subj,
        average: Math.round(subjectMap[subj].total / subjectMap[subj].count)
    }));

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fadeIn space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-white">Academic Analytics</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-accent text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:bg-green-600 transition"
                >
                    <Plus size={18} /> Add Grade
                </button>
            </div>

            {/* Add Grade Form */}
            {showForm && (
                <div className="glassmorphism p-6 rounded-2xl animate-fadeIn">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Subject</label>
                            <select 
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                value={newGrade.subject}
                                onChange={e => setNewGrade({...newGrade, subject: e.target.value})}
                            >
                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select 
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                value={newGrade.type}
                                onChange={e => setNewGrade({...newGrade, type: e.target.value as any})}
                            >
                                <option>Exam</option><option>Quiz</option><option>Assignment</option><option>Project</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Score</label>
                            <input type="number" className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" value={newGrade.score} onChange={e => setNewGrade({...newGrade, score: Number(e.target.value)})} />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Max Score</label>
                            <input type="number" className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" value={newGrade.maxScore} onChange={e => setNewGrade({...newGrade, maxScore: Number(e.target.value)})} />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <input type="date" className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" value={newGrade.date} onChange={e => setNewGrade({...newGrade, date: e.target.value})} />
                        </div>
                        <button type="submit" className="bg-accent text-white p-2.5 rounded-lg flex justify-center items-center hover:bg-green-600">
                            <Save size={20} />
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Line Chart */}
                <div className="glassmorphism p-6 rounded-2xl h-[400px]">
                    <h3 className="font-heading font-bold mb-4">Progress Over Time</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="percentage" stroke="var(--color-accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-accent)' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="glassmorphism p-6 rounded-2xl h-[400px]">
                    <h3 className="font-heading font-bold mb-4">Subject Averages</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="average" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Grades Table */}
            <div className="glassmorphism p-6 rounded-2xl overflow-hidden">
                <h3 className="font-heading font-bold mb-4">Grade History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-sm border-b border-gray-200 dark:border-gray-700">
                                <th className="pb-3 pl-2">Date</th>
                                <th className="pb-3">Subject</th>
                                <th className="pb-3">Type</th>
                                <th className="pb-3">Score</th>
                                <th className="pb-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {sortedGrades.reverse().map(g => (
                                <tr key={g.id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                                    <td className="py-3 pl-2">{g.date}</td>
                                    <td className="py-3 font-medium">{g.subject}</td>
                                    <td className="py-3"><span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs">{g.type}</span></td>
                                    <td className="py-3 font-bold text-accent">{g.score}/{g.maxScore}</td>
                                    <td className="py-3">
                                        <button onClick={() => deleteGrade(g.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
