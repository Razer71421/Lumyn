
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, CheckCircle, Settings, Clock, Wind, CloudRain, Trees, Coffee, Waves, ChevronDown, ChevronUp } from 'lucide-react';
import { SUBJECTS, AUDIO_TRACKS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_FOCUS_TIME = 25;
const BREAK_TIME = 5 * 60;

// Breathing cycle constants (in ms)
const BREATHE_IN_TIME = 4000;
const BREATHE_OUT_TIME = 4000;

const Focus: React.FC = () => {
    const { addSession, addJournalEntry, addXP } = useAuth();
    
    // State for duration settings
    const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_TIME);
    const [customDuration, setCustomDuration] = useState(DEFAULT_FOCUS_TIME.toString());
    const [isEditingDuration, setIsEditingDuration] = useState(false);

    const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');
    const [subject, setSubject] = useState(SUBJECTS[0]);
    const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Breathing Mode State
    const [isBreathingMode, setIsBreathingMode] = useState(false);
    const [breathText, setBreathText] = useState('');
    
    // Audio State
    const [volumes, setVolumes] = useState<{ [key: string]: number }>({ Rain: 0, Forest: 0, Cafe: 0, Ocean: 0 });
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    // Modal State
    const [reflection, setReflection] = useState('');
    const [mood, setMood] = useState('🙂');

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            handleComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Breathing Logic
    useEffect(() => {
        let breathInterval: ReturnType<typeof setInterval>;
        if (isBreathingMode) {
            const cycleBreath = () => {
                setBreathText('Inhale');
                setTimeout(() => {
                    if (isBreathingMode) setBreathText('Exhale');
                }, BREATHE_IN_TIME);
            };
            
            cycleBreath(); // Initial call
            breathInterval = setInterval(cycleBreath, BREATHE_IN_TIME + BREATHE_OUT_TIME);
        } else {
            setBreathText('');
        }
        return () => clearInterval(breathInterval);
    }, [isBreathingMode]);

    useEffect(() => {
        // Initialize Audio
        AUDIO_TRACKS.forEach(track => {
            if (!audioRefs.current[track.name]) {
                const audio = new Audio(track.url);
                audio.loop = true;
                // Prevent "no supported sources" crashing the console by catching load errors
                audio.onerror = (e) => console.warn(`Could not load audio for ${track.name}`, e);
                audioRefs.current[track.name] = audio;
            }
        });

        return () => {
            // Cleanup on unmount
            Object.values(audioRefs.current).forEach((audio) => {
                const audioEl = audio as HTMLAudioElement;
                audioEl.pause();
                audioEl.src = '';
            });
            audioRefs.current = {};
        };
    }, []);

    const toggleTimer = () => setIsActive(!isActive);
    
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : BREAK_TIME);
    };

    const changeFocusDuration = (minutes: number) => {
        setFocusDuration(minutes);
        setCustomDuration(minutes.toString());
        if (mode === 'focus') {
            setIsActive(false);
            setTimeLeft(minutes * 60);
        }
    };

    const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomDuration(val);
        const num = parseInt(val);
        if (!isNaN(num) && num > 0 && num <= 180) {
            setFocusDuration(num);
            if (mode === 'focus') {
                setIsActive(false);
                setTimeLeft(num * 60);
            }
        }
    };

    const handleVolumeChange = (name: string, val: number) => {
        setVolumes(prev => ({ ...prev, [name]: val }));
        const audio = audioRefs.current[name];
        if (audio) {
            audio.volume = val;
            if (val > 0 && audio.paused) {
                audio.play().catch(e => console.warn("Audio play prevented:", e));
            }
            if (val === 0 && !audio.paused) {
                audio.pause();
            }
        }
    };

    const handleComplete = () => {
        if (mode === 'focus') {
            addXP(focusDuration); 
            setShowModal(true);
        } else {
            setMode('focus');
            setTimeLeft(focusDuration * 60);
        }
    };

    const saveSession = () => {
        const sessionId = uuidv4();
        const dateStr = new Date().toISOString();

        addSession({
            id: sessionId,
            subject,
            durationMinutes: focusDuration,
            date: dateStr,
            timestamp: Date.now()
        });

        addJournalEntry({
            id: uuidv4(),
            sessionId,
            subject,
            date: dateStr,
            durationMinutes: focusDuration,
            mood,
            reflection
        });

        setShowModal(false);
        setReflection('');
        setMode('break');
        setTimeLeft(BREAK_TIME);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getIconForTrack = (name: string, size: number = 24) => {
        switch (name) {
            case 'Rain': return <CloudRain size={size} />;
            case 'Forest': return <Trees size={size} />;
            case 'Cafe': return <Coffee size={size} />;
            case 'Ocean': return <Waves size={size} />;
            default: return <Volume2 size={size} />;
        }
    };

    const handleSubjectSelect = (s: string) => {
        setSubject(s);
        setIsSubjectMenuOpen(false);
    };

    // Progress Circle Logic
    const radius = 130;
    const circumference = 2 * Math.PI * radius;
    const totalTime = mode === 'focus' ? focusDuration * 60 : BREAK_TIME;
    const progress = ((totalTime - timeLeft) / totalTime) * circumference;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Timer Section */}
                <div className="flex flex-col items-center justify-center glassmorphism rounded-3xl p-8 md:p-10 relative min-h-[500px]">
                    
                    {/* Controls Header */}
                    <div className="w-full flex justify-between items-start mb-6 z-30">
                        {/* Beautiful Subject Selector */}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">Subject</label>
                            <button
                                onClick={() => !isActive && setIsSubjectMenuOpen(!isSubjectMenuOpen)}
                                className={`flex items-center justify-between w-48 px-4 py-3 bg-white/50 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-2xl backdrop-blur-md transition-all hover:bg-white/70 dark:hover:bg-white/10 shadow-sm group ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isActive}
                            >
                                <span className="font-semibold text-gray-800 dark:text-white truncate">{subject}</span>
                                <ChevronDown size={18} className={`text-gray-500 transition-transform duration-300 ${isSubjectMenuOpen ? 'rotate-180 text-accent' : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'}`} />
                            </button>

                            {isSubjectMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 p-2 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl shadow-2xl animate-fadeIn flex flex-col gap-1 max-h-64 overflow-y-auto z-50">
                                    {SUBJECTS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleSubjectSelect(s)}
                                            className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${subject === s ? 'bg-accent text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'}`}
                                        >
                                            {s}
                                            {subject === s && <CheckCircle size={14} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                             <button 
                                onClick={() => setIsBreathingMode(!isBreathingMode)}
                                className={`p-3 rounded-2xl transition-all shadow-sm ${isBreathingMode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 ring-2 ring-blue-400/50 shadow-blue-200/50' : 'bg-white/50 dark:bg-white/5 text-gray-500 hover:bg-white dark:hover:bg-white/10'}`}
                                title="Breathing Guide"
                            >
                                <Wind size={20} />
                            </button>
                            <button 
                                onClick={() => !isActive && setIsEditingDuration(!isEditingDuration)}
                                className={`p-3 rounded-2xl transition-all shadow-sm ${isEditingDuration ? 'bg-accent text-white ring-2 ring-accent/50' : 'bg-white/50 dark:bg-white/5 text-gray-500 hover:bg-white dark:hover:bg-white/10'}`}
                                disabled={isActive}
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Duration Presets */}
                    {isEditingDuration && (
                        <div className="w-full mb-8 bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 p-4 rounded-2xl animate-fadeIn z-20 absolute top-24 left-0 right-0 mx-auto max-w-[90%] shadow-xl">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Set Duration</label>
                                <button onClick={() => setIsEditingDuration(false)} className="text-gray-400 hover:text-gray-600"><ChevronUp size={16} /></button>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {[25, 45, 60].map(time => (
                                    <button
                                        key={time}
                                        onClick={() => changeFocusDuration(time)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${focusDuration === time ? 'bg-accent text-white shadow-md transform scale-105' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {time}m
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl px-3 py-2.5 border border-transparent focus-within:border-accent transition-colors shadow-inner">
                                <Clock size={16} className="text-gray-400" />
                                <input 
                                    type="number" 
                                    min="1" max="180"
                                    value={customDuration}
                                    onChange={handleCustomDurationChange}
                                    className="bg-transparent w-full outline-none text-sm font-medium text-gray-700 dark:text-gray-200"
                                    placeholder="Custom min"
                                />
                                <span className="text-xs text-gray-400 font-bold">MIN</span>
                            </div>
                        </div>
                    )}

                    {/* Timer Circle & Breathing Interactable */}
                    <div className="relative w-[320px] h-[320px] flex items-center justify-center z-0 my-4">
                        
                        {/* SVG Timer Ring Background */}
                        <svg className="transform -rotate-90 w-full h-full z-10 absolute inset-0 pointer-events-none">
                             <circle
                                cx="160" cy="160" r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                className="text-gray-200 dark:text-gray-700 opacity-20"
                            />
                        </svg>

                        {/* 3D Breathing Sphere - Distinct Element */}
                        {isBreathingMode && (
                            <div 
                                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer group"
                                onClick={() => setIsBreathingMode(false)}
                                title="Click to stop breathing exercise"
                            >
                                {/* Glow Background - Enhanced */}
                                <div className="w-[240px] h-[240px] bg-accent/20 rounded-full absolute animate-pulse blur-3xl transition-all duration-500 group-hover:bg-accent/30"></div>
                                
                                {/* The 3D Sphere */}
                                <div className="w-[190px] h-[190px] rounded-full sphere-3d animate-breathe3D z-10 shadow-[0_0_40px_rgba(116,198,157,0.6)]"></div>
                                
                                {/* Interaction Hint */}
                                <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 dark:bg-black/80 text-accent font-bold text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm z-30 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                    Click to Stop
                                </div>
                            </div>
                        )}

                        {/* SVG Timer Ring Progress */}
                        <svg className="transform -rotate-90 w-full h-full z-20 absolute inset-0 pointer-events-none">
                            <circle
                                cx="160" cy="160" r={radius}
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={isNaN(progress) ? 0 : -progress}
                                strokeLinecap="round"
                                className="text-accent transition-all duration-1000 ease-linear drop-shadow-lg"
                            />
                        </svg>
                        
                        {/* Central Text */}
                        <div className="absolute text-center z-30 select-none flex flex-col items-center justify-center w-full pointer-events-none">
                            {isBreathingMode ? (
                                <div className="animate-fadeIn mb-2 z-30">
                                    <p className="text-2xl font-heading font-bold text-white drop-shadow-lg tracking-widest uppercase" style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
                                        {breathText}
                                    </p>
                                </div>
                            ) : null}
                            
                            <div 
                                className={`font-bold font-heading text-gray-800 dark:text-white tabular-nums transition-all duration-500 ${isBreathingMode ? 'text-4xl text-white drop-shadow-lg opacity-90' : 'text-6xl'}`}
                                style={isBreathingMode ? {textShadow: '0 2px 10px rgba(0,0,0,0.3)'} : {}}
                            >
                                {formatTime(timeLeft)}
                            </div>
                            
                            {!isBreathingMode && (
                                <p className={`font-medium mt-2 uppercase tracking-widest text-sm transition-colors ${mode === 'focus' ? 'text-accent' : 'text-blue-400'}`}>
                                    {mode === 'focus' ? 'Focus Time' : 'Break Time'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-8 z-10">
                        <button onClick={toggleTimer} className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300 ring-4 ring-accent/20">
                            {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                        <button onClick={resetTimer} className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <RotateCcw size={20} />
                        </button>
                    </div>
                </div>

                {/* Ambient Sounds */}
                <div className="glassmorphism rounded-3xl p-6 md:p-8 h-fit transition-all duration-500">
                    <h3 className="text-xl font-heading font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
                        <div className="p-2 bg-accent/10 rounded-xl text-accent">
                             <Volume2 size={24} />
                        </div>
                        Soundscape
                    </h3>
                    <div className="space-y-4">
                        {AUDIO_TRACKS.map(track => {
                            const isPlaying = volumes[track.name] > 0;
                            return (
                                <div key={track.name} className={`group p-4 rounded-2xl transition-all duration-300 border ${isPlaying ? 'bg-white/60 dark:bg-white/10 border-accent/30 shadow-sm' : 'bg-white/30 dark:bg-white/5 border-transparent hover:bg-white/50 dark:hover:bg-white/10'}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <button 
                                            onClick={() => handleVolumeChange(track.name, isPlaying ? 0 : 0.5)}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isPlaying ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                            aria-label={isPlaying ? `Mute ${track.name}` : `Play ${track.name}`}
                                        >
                                            {getIconForTrack(track.name, 24)}
                                        </button>
                                        
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`font-bold transition-colors ${isPlaying ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {track.name}
                                                </span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md transition-colors ${isPlaying ? 'bg-accent/10 text-accent' : 'bg-black/5 dark:bg-white/5 text-gray-400'}`}>
                                                    {Math.round(volumes[track.name] * 100)}%
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {isPlaying ? 'Active' : 'Muted'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative h-6 flex items-center">
                                         <input 
                                            type="range" 
                                            min="0" max="1" step="0.01" 
                                            value={volumes[track.name]}
                                            onChange={(e) => handleVolumeChange(track.name, parseFloat(e.target.value))}
                                            className="range-slider w-full"
                                            style={{
                                                background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${volumes[track.name] * 100}%, rgba(128, 128, 128, 0.2) ${volumes[track.name] * 100}%, rgba(128, 128, 128, 0.2) 100%)`
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Completion Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-accent/20 transform scale-100 transition-all">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-tick">
                                <CheckCircle size={32} />
                            </div>
                            <h2 className="text-2xl font-heading font-bold text-gray-800 dark:text-white">Session Complete!</h2>
                            <p className="text-gray-500">+{focusDuration} XP Earned</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">How do you feel?</label>
                                <div className="flex justify-center gap-4 text-2xl">
                                    {['🤯', '😕', '😐', '🙂', '😎', '🌿'].map(emoji => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => setMood(emoji)}
                                            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-110 ${mood === emoji ? 'bg-green-100 dark:bg-green-900 scale-110 shadow-sm' : ''}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Reflection (Optional)</label>
                                <textarea 
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-accent outline-none resize-none transition-all"
                                    rows={3}
                                    placeholder="What did you learn? What was hard?"
                                />
                            </div>
                            <button 
                                onClick={saveSession}
                                className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all hover:scale-[1.02]"
                            >
                                Save to Journal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Focus;
