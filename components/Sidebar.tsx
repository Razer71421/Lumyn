
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, BookOpen, BarChart2, BookHeart, Bot, Sun, Moon, LogOut, Menu, X, Network } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { XP_THRESHOLDS } from '../constants';
import Logo from './Logo';

interface SidebarProps {
    darkMode: boolean;
    toggleTheme: () => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode, toggleTheme, isMobileOpen, setIsMobileOpen }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const nextLevelXP = XP_THRESHOLDS[user.level - 1] || 10000;
    const prevLevelXP = user.level > 1 ? XP_THRESHOLDS[user.level - 2] : 0;
    const currentLevelProgress = user.xp - prevLevelXP;
    const levelRange = nextLevelXP - prevLevelXP;
    const progressPercent = Math.min(100, Math.max(0, (currentLevelProgress / levelRange) * 100));

    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard', id: 'tour-dashboard' },
        { to: '/focus', icon: Target, label: 'Focus Mode', id: 'tour-focus' },
        { to: '/flashcards', icon: BookOpen, label: 'Flashcards', id: 'tour-flashcards' },
        { to: '/analytics', icon: BarChart2, label: 'Analytics', id: 'tour-analytics' },
        { to: '/journal', icon: BookHeart, label: 'Journal', id: 'tour-journal' },
        { to: '/mindmap', icon: Network, label: 'Mind Map', id: 'tour-mindmap' },
        { to: '/mentor', icon: Bot, label: 'AI Mentor', id: 'tour-mentor' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 glassmorphism flex flex-col border-r border-white/20`}>
                <div className="p-6 flex items-center justify-between">
                    <Logo className="h-12 w-auto" />
                    <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-1 rounded-md hover:bg-black/5">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 mb-6 text-center">
                    <div className="relative inline-block">
                        <img src={user.avatar} alt="User" className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg mx-auto mb-3" />
                        <div className="absolute bottom-0 right-0 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                            Lvl {user.level}
                        </div>
                    </div>
                    <h2 className="font-heading font-semibold text-lg">{user.name}</h2>
                    
                    {/* XP Bar */}
                    <div className="mt-3 w-full bg-black/10 h-2 rounded-full overflow-hidden relative">
                        <div className="h-full bg-accent absolute top-0 left-0 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">{user.xp} / {nextLevelXP} XP</p>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {links.map((link) => (
                        <NavLink 
                            key={link.to} 
                            to={link.to}
                            data-tour-id={link.id}
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-accent text-white shadow-md' : 'hover:bg-white/40 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'}`}
                        >
                            <link.icon size={20} />
                            <span className="font-medium">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-100 text-red-500 transition-colors">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
