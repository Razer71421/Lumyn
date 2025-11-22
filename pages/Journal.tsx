
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Plus, X, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { SUBJECTS } from '../constants';

const Journal: React.FC = () => {
    const { journal, addJournalEntry } = useAuth();
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [newEntry, setNewEntry] = useState({
        subject: SUBJECTS[0],
        duration: 30,
        mood: '🙂',
        reflection: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.subject) return;

        const entry = {
            id: uuidv4(),
            sessionId: uuidv4(), // Virtual session ID for manual entries
            subject: newEntry.subject,
            date: new Date(newEntry.date).toISOString(),
            durationMinutes: Number(newEntry.duration),
            mood: newEntry.mood,
            reflection: newEntry.reflection || "No reflection written."
        };

        addJournalEntry(entry);
        setShowModal(false);
        // Reset form
        setNewEntry({
            subject: SUBJECTS[0],
            duration: 30,
            mood: '🙂',
            reflection: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-white">Study Journal</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-accent text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-md hover:bg-green-600 transition transform hover:scale-105"
                >
                    <Plus size={20} />
                    <span className="hidden md:inline">Add Entry</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {journal.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p>No journal entries yet. Complete a focus session or add one manually!</p>
                    </div>
                ) : (
                    journal.map((entry) => (
                        <div key={entry.id} className="glassmorphism p-6 rounded-2xl relative overflow-hidden group transition-all hover:shadow-lg">
                            <div className="absolute top-0 left-0 w-2 h-full bg-accent"></div>
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 ml-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        {entry.subject}
                                        <span className="text-2xl" role="img" aria-label="mood">{entry.mood}</span>
                                    </h3>
                                    <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()} • {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-black/20 px-3 py-1 rounded-lg">
                                    <Clock size={16} />
                                    <span className="font-medium">{entry.durationMinutes} mins</span>
                                </div>
                            </div>
                            <div className="ml-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                                <p className="text-gray-700 dark:text-gray-300 italic">"{entry.reflection || "No reflection written."}"</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-accent/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-heading font-bold text-gray-800 dark:text-white">New Journal Entry</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500 transition bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                                <X size={18} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Subject</label>
                                <select 
                                    value={newEntry.subject}
                                    onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent transition-all"
                                >
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Date</label>
                                    <input 
                                        type="date" 
                                        value={newEntry.date}
                                        onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Duration (min)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={newEntry.duration}
                                        onChange={(e) => setNewEntry({...newEntry, duration: Number(e.target.value)})}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Mood</label>
                                <div className="flex justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                                    {['🤯', '😕', '😐', '🙂', '😎', '🌿'].map(emoji => (
                                        <button 
                                            type="button"
                                            key={emoji} 
                                            onClick={() => setNewEntry({...newEntry, mood: emoji})}
                                            className={`p-2 rounded-lg transition transform hover:scale-110 ${newEntry.mood === emoji ? 'bg-white dark:bg-gray-600 shadow-md scale-110' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Reflection</label>
                                <textarea 
                                    value={newEntry.reflection}
                                    onChange={(e) => setNewEntry({...newEntry, reflection: e.target.value})}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent resize-none h-24 transition-all"
                                    placeholder="What did you learn?"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all flex justify-center items-center gap-2 mt-2"
                            >
                                <Save size={20} /> Save Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Journal;
