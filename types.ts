
export interface User {
    name: string;
    avatar: string;
    xp: number;
    level: number;
    isDemo: boolean;
}

export interface Grade {
    id: string;
    subject: string;
    score: number;
    maxScore: number;
    type: 'Exam' | 'Quiz' | 'Assignment' | 'Project';
    date: string;
}

export interface StudySession {
    id: string;
    subject: string;
    durationMinutes: number;
    date: string; // ISO string
    timestamp: number;
}

export interface JournalEntry {
    id: string;
    sessionId: string;
    subject: string;
    date: string;
    durationMinutes: number;
    mood: string;
    reflection: string;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface MindMapEdge {
    source: string; // ID of the source message
    target: string; // ID of the target message
}

export type Theme = 'light' | 'dark';
