
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Clock, Zap, BookOpen, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveOrb from '../components/InteractiveOrb';

const Dashboard: React.FC = () => {
    const { user, sessions, grades } = useAuth();

    if (!user) return null;

    // Calculate Stats
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const uniqueSubjects = new Set(sessions.map(s => s.subject)).size;
    
    // Calculate Weekly Data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const weeklyData = last7Days.map(date => {
        const dayMinutes = sessions
            .filter(s => s.date.startsWith(date))
            .reduce((acc, s) => acc + s.durationMinutes, 0);
        return {
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            minutes: dayMinutes
        };
    });

    const recentSessions = sessions.slice(0, 3);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-6">
                <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-white">
                        Hello, {user.name} <span className="text-3xl animate-bounce inline-block" style={{ animationDuration: '2s' }}>🌿</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Ready to grow your mind today?</p>
                    
                    <div className="mt-6 flex gap-4">
                         <Link to="/focus" className="bg-accent text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 flex items-center gap-2 w-fit">
                            <Zap size={20} />
                            Start Focus Session
                        </Link>
                    </div>
                </div>
                
                {/* Interactive Element Container */}
                <div className="hidden md:block w-64 h-48 glassmorphism rounded-2xl relative">
                    <div className="absolute top-3 left-4 text-xs font-bold text-accent uppercase tracking-widest z-10">Lumyn Core</div>
                    <InteractiveOrb />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glassmorphism p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Clock size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Focus Time</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalHours}h</p>
                    </div>
                </div>
                <div className="glassmorphism p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Zap size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total XP</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{user.xp}</p>
                    </div>
                </div>
                <div className="glassmorphism p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><BookOpen size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sessions</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{sessions.length}</p>
                    </div>
                </div>
                <div className="glassmorphism p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Calendar size={24} /></div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subjects</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{uniqueSubjects}</p>
                    </div>
                </div>
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Progress */}
                <div className="glassmorphism p-6 rounded-2xl lg:col-span-2 min-h-[350px]">
                    <h2 className="font-heading font-bold text-lg mb-6 text-gray-800 dark:text-white">Weekly Activity</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="minutes" fill="var(--color-accent)" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glassmorphism p-6 rounded-2xl">
                    <h2 className="font-heading font-bold text-lg mb-6 text-gray-800 dark:text-white">Recent Sessions</h2>
                    <div className="space-y-4">
                        {recentSessions.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No recent activity.</p>
                        ) : (
                            recentSessions.map(session => (
                                <div key={session.id} className="flex items-center justify-between p-3 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center text-accent">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{session.subject}</p>
                                            <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-accent">+{session.durationMinutes}m</span>
                                </div>
                            ))
                        )}
                        {recentSessions.length > 0 && (
                            <Link to="/journal" className="block text-center text-sm text-accent font-medium mt-4 hover:underline">View all in Journal</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
