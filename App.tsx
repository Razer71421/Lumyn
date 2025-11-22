
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Focus from './pages/Focus';
import Flashcards from './pages/Flashcards';
import Analytics from './pages/Analytics';
import Journal from './pages/Journal';
import Mentor from './pages/Mentor';
import MindMapPage from './pages/MindMapPage';
import TourGuide from './components/TourGuide';
import Logo from './components/Logo';
import { useAuth } from './context/AuthContext';
import { Menu } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const App: React.FC = () => {
    const { user, login, loginDemo, loginWithGoogle } = useAuth();
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('lumyn_theme');
        // Default to dark mode if no preference is saved, otherwise respect the saved value
        return savedTheme ? savedTheme === 'dark' : true;
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [guestName, setGuestName] = useState('');

    const googleLogin = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            // We need to request the user info using the access token
            // Or better, use the 'id_token' flow if we configured it that way.
            // Actually, useGoogleLogin by default gives an access token.
            // Let's fetch the user info or switch to 'id_token' flow.
            // For simplicity with jwt-decode, let's use the 'credential' flow or just fetch user info.
            // Wait, useGoogleLogin is for OAuth flow. <GoogleLogin> component is for ID token.
            // But we want a custom button.
            // Let's fetch the user profile with the access token.
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
                .then(res => res.json())
                .then(userInfo => {
                    // We can construct a "token-like" object or just pass the user info directly.
                    // Let's modify loginWithGoogle to accept the user info directly or just mock a token.
                    // Actually, let's just pass the userInfo to a new function or modify loginWithGoogle.
                    // To keep it simple with the previous AuthContext change (which expects a JWT), 
                    // we should probably use the <GoogleLogin> component OR change AuthContext to accept a user object.
                    // Let's change AuthContext to accept a User object or just the raw data.
                    // BUT, I already updated AuthContext to expect a token and decode it.
                    // Let's stick to the plan: useGoogleLogin gives an access token.
                    // I will revert the AuthContext change to accept a User object instead of a token, 
                    // OR I will just fetch the user info here and pass it.
                    // Let's assume I'll update AuthContext to accept the profile directly.
                    loginWithGoogle(userInfo);
                });
        },
        onError: error => console.log('Login Failed:', error)
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('lumyn_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('lumyn_theme', 'light');
        }
    }, [darkMode]);

    // Auth Screen
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="glassmorphism p-8 md:p-12 rounded-3xl max-w-md w-full shadow-2xl animate-fadeIn border border-white/20 relative overflow-hidden">
                    {/* Background ambient blob for auth card */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

                    <div className="text-center mb-10 flex flex-col items-center relative z-10">
                        {/* Logo Glow Effect */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10"></div>

                        {/* Animated Floating Logo */}
                        <Logo className="h-32 mb-4 animate-float drop-shadow-2xl" />

                        <p className="text-gray-500 dark:text-gray-400 font-medium">Your minimalist study companion.</p>
                    </div>

                    <div className="space-y-4 relative z-10">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-accent outline-none text-gray-800 dark:text-white placeholder-gray-400 transition-all"
                        />
                        <button
                            onClick={() => { if (guestName) login(guestName) }}
                            disabled={!guestName}
                            className="w-full py-4 bg-accent text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition disabled:opacity-50 hover:shadow-green-500/20 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get Started
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-700"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-gray-500 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-full">Or</span></div>
                        </div>

                        <button
                            onClick={() => googleLogin()}
                            className="w-full py-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-700 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition hover:-translate-y-0.5 flex items-center justify-center gap-3 mb-4"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Sign in with Google
                        </button>

                        <button
                            onClick={loginDemo}
                            className="w-full py-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition hover:-translate-y-0.5"
                        >
                            Wanna Try Before You Signup ?
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <Sidebar
                darkMode={darkMode}
                toggleTheme={() => setDarkMode(!darkMode)}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <main className="flex-1 relative overflow-hidden flex flex-col min-h-screen">
                {/* Mobile Header */}
                <div className="md:hidden p-4 flex items-center justify-between">
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-lg bg-white/50 dark:bg-black/20 shadow-sm text-gray-700 dark:text-gray-200">
                        <Menu size={24} />
                    </button>
                    <Logo className="h-8" />
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="flex-1 overflow-y-auto scroll-smooth">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/focus" element={<Focus />} />
                        <Route path="/flashcards" element={<Flashcards />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/mindmap" element={<MindMapPage />} />
                        <Route path="/mentor" element={<Mentor />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </main>

            <TourGuide />
        </div>
    );
};

export default App;
