
import { User, Grade, StudySession, JournalEntry, ChatMessage, MindMapEdge } from './types';

export const APP_NAME = "Lumyn";

export const XP_THRESHOLDS = Array.from({ length: 15 }, (_, i) => (i + 1) * 500); // Level 1 = 500xp, Level 2 = 1000xp...

export const DEMO_USER_PROFILE: User = {
    name: "Ann",
    avatar: "https://picsum.photos/200/200",
    xp: 3250,
    level: 7,
    isDemo: true
};

export const DEMO_GRADES: Grade[] = [
    { id: '1', subject: 'Mathematics', score: 85, maxScore: 100, type: 'Exam', date: '2023-10-01' },
    { id: '2', subject: 'History', score: 92, maxScore: 100, type: 'Quiz', date: '2023-10-05' },
    { id: '3', subject: 'Physics', score: 78, maxScore: 100, type: 'Assignment', date: '2023-10-10' },
    { id: '4', subject: 'Mathematics', score: 88, maxScore: 100, type: 'Quiz', date: '2023-10-15' },
    { id: '5', subject: 'Literature', score: 95, maxScore: 100, type: 'Project', date: '2023-10-20' },
];

export const DEMO_SESSIONS: StudySession[] = [
    { id: 's1', subject: 'Mathematics', durationMinutes: 45, date: new Date(Date.now() - 86400000 * 2).toISOString(), timestamp: Date.now() - 86400000 * 2 },
    { id: 's2', subject: 'History', durationMinutes: 30, date: new Date(Date.now() - 86400000).toISOString(), timestamp: Date.now() - 86400000 },
    { id: 's3', subject: 'Physics', durationMinutes: 60, date: new Date().toISOString(), timestamp: Date.now() },
];

export const DEMO_JOURNAL: JournalEntry[] = [
    { id: 'j1', sessionId: 's1', subject: 'Mathematics', date: new Date(Date.now() - 86400000 * 2).toISOString(), durationMinutes: 45, mood: '🤯', reflection: 'Calculus is tough, but I finally understood derivatives.' },
    { id: 'j2', sessionId: 's2', subject: 'History', date: new Date(Date.now() - 86400000).toISOString(), durationMinutes: 30, mood: '🌿', reflection: 'Reviewing the industrial revolution. Felt productive.' },
];

export const DEMO_CHAT_HISTORY: ChatMessage[] = [
    { id: 'msg1', role: 'user', text: "What is the relationship between displacement and velocity?", timestamp: Date.now() - 1000000 },
    { id: 'msg1a', role: 'model', text: "Velocity is the rate of change of displacement with respect to time.", timestamp: Date.now() - 990000 },
    { id: 'msg2', role: 'user', text: "How do I calculate acceleration from velocity?", timestamp: Date.now() - 800000 },
    { id: 'msg2a', role: 'model', text: "Acceleration is the derivative of velocity with respect to time.", timestamp: Date.now() - 790000 },
    { id: 'msg3', role: 'user', text: "Explain Newton's Second Law.", timestamp: Date.now() - 600000 },
    { id: 'msg3a', role: 'model', text: "Newton's Second Law states that Force equals mass times acceleration (F=ma).", timestamp: Date.now() - 590000 },
    { id: 'msg4', role: 'user', text: "What is the difference between speed and velocity?", timestamp: Date.now() - 400000 },
    { id: 'msg4a', role: 'model', text: "Speed is a scalar quantity (magnitude only), while velocity is a vector (magnitude and direction).", timestamp: Date.now() - 390000 },
    { id: 'msg5', role: 'user', text: "Can you explain integrals in calculus?", timestamp: Date.now() - 200000 },
    { id: 'msg5a', role: 'model', text: "An integral assigns numbers to functions in a way that describes displacement, area, volume, and other concepts that arise by combining infinitesimal data.", timestamp: Date.now() - 190000 },
];

export const DEMO_MINDMAP_EDGES: MindMapEdge[] = [
    { source: 'msg1', target: 'msg2' }, // Velocity -> Acceleration
    { source: 'msg1', target: 'msg4' }, // Velocity -> Speed
    { source: 'msg2', target: 'msg3' }, // Acceleration -> Newton's Law
    { source: 'msg2', target: 'msg5' }, // Acceleration (Derivative) -> Integrals
];

export const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Art'];

export const AUDIO_TRACKS = [
    { name: 'Rain', url: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3' },
    { name: 'Forest', url: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-loop-1210.mp3' },
    { name: 'Cafe', url: 'https://assets.mixkit.co/sfx/preview/mixkit-small-group-talking-in-a-room-2266.mp3' },
    { name: 'Ocean', url: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1196.mp3' },
];
