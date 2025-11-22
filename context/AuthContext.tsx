
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from "jwt-decode";
import { User, Grade, StudySession, JournalEntry, ChatMessage, MindMapEdge } from '../types';
import { DEMO_USER_PROFILE, DEMO_GRADES, DEMO_SESSIONS, DEMO_JOURNAL, XP_THRESHOLDS, DEMO_CHAT_HISTORY, DEMO_MINDMAP_EDGES } from '../constants';

interface AuthContextType {
    user: User | null;
    grades: Grade[];
    sessions: StudySession[];
    journal: JournalEntry[];
    chatHistory: ChatMessage[];
    mindMapEdges: MindMapEdge[];
    login: (name: string) => void;
    loginDemo: () => void;
    loginWithGoogle: (userInfo: any) => void;
    logout: () => void;
    addSession: (session: StudySession) => void;
    addGrade: (grade: Grade) => void;
    deleteGrade: (id: string) => void;
    addJournalEntry: (entry: JournalEntry) => void;
    addXP: (amount: number) => void;
    addChatMessage: (msg: ChatMessage) => void;
    setMindMapEdges: (edges: MindMapEdge[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [journal, setJournal] = useState<JournalEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [mindMapEdges, setMindMapEdgesState] = useState<MindMapEdge[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('lumyn_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            if (!parsedUser.isDemo) {
                setGrades(JSON.parse(localStorage.getItem('lumyn_grades') || '[]'));
                setSessions(JSON.parse(localStorage.getItem('lumyn_sessions') || '[]'));
                setJournal(JSON.parse(localStorage.getItem('lumyn_journal') || '[]'));
                setChatHistory(JSON.parse(localStorage.getItem('lumyn_chat_history') || '[]'));
                setMindMapEdgesState(JSON.parse(localStorage.getItem('lumyn_mindmap_edges') || '[]'));
            } else {
                // Restore demo defaults
                setGrades(DEMO_GRADES);
                setSessions(DEMO_SESSIONS);
                setJournal(DEMO_JOURNAL);
                setChatHistory(DEMO_CHAT_HISTORY);
                setMindMapEdgesState(DEMO_MINDMAP_EDGES);
            }
        }
    }, []);

    const persistData = (
        u: User,
        g: Grade[],
        s: StudySession[],
        j: JournalEntry[],
        c: ChatMessage[],
        e: MindMapEdge[]
    ) => {
        if (!u.isDemo) {
            localStorage.setItem('lumyn_user', JSON.stringify(u));
            localStorage.setItem('lumyn_grades', JSON.stringify(g));
            localStorage.setItem('lumyn_sessions', JSON.stringify(s));
            localStorage.setItem('lumyn_journal', JSON.stringify(j));
            localStorage.setItem('lumyn_chat_history', JSON.stringify(c));
            localStorage.setItem('lumyn_mindmap_edges', JSON.stringify(e));
        }
    };

    const login = (name: string) => {
        const newUser: User = {
            name,
            avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
            xp: 0,
            level: 1,
            isDemo: false
        };
        const initialChat: ChatMessage[] = [{ id: '1', role: 'model', text: "Hi there! I'm Lumyn. How can I help you with your studies today?", timestamp: Date.now() }];

        setUser(newUser);
        setGrades([]);
        setSessions([]);
        setJournal([]);
        setChatHistory(initialChat);
        setMindMapEdgesState([]);

        persistData(newUser, [], [], [], initialChat, []);
    };

    const loginDemo = () => {
        setUser(DEMO_USER_PROFILE);
        setGrades(DEMO_GRADES);
        setSessions(DEMO_SESSIONS);
        setJournal(DEMO_JOURNAL);
        setChatHistory(DEMO_CHAT_HISTORY);
        setMindMapEdgesState(DEMO_MINDMAP_EDGES);
    };

    const loginWithGoogle = (userInfo: any) => {
        try {
            // userInfo is the response from https://www.googleapis.com/oauth2/v3/userinfo

            const googleUser: User = {
                name: userInfo.name || "Google User",
                avatar: userInfo.picture || "https://lh3.googleusercontent.com/a/default-user=s96-c",
                xp: 0,
                level: 1,
                isDemo: false
            };

            setUser(googleUser);
            // Initialize empty state for new user
            setGrades([]);
            setSessions([]);
            setJournal([]);
            setChatHistory([{ id: '1', role: 'model', text: `Hi ${userInfo.given_name || 'there'}! I'm Lumyn. How can I help you today?`, timestamp: Date.now() }]);
            setMindMapEdgesState([]);

            persistData(googleUser, [], [], [], [], []);
        } catch (error) {
            console.error("Failed to process Google user info", error);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lumyn_user');
        localStorage.removeItem('lumyn_grades');
        localStorage.removeItem('lumyn_sessions');
        localStorage.removeItem('lumyn_journal');
        localStorage.removeItem('lumyn_chat_history');
        localStorage.removeItem('lumyn_mindmap_edges');
    };

    const addXP = (amount: number) => {
        if (!user) return;
        const newXP = user.xp + amount;
        let newLevel = user.level;
        while (newLevel < 15 && newXP >= XP_THRESHOLDS[newLevel - 1]) {
            newLevel++;
        }
        const updatedUser = { ...user, xp: newXP, level: newLevel };
        setUser(updatedUser);
        persistData(updatedUser, grades, sessions, journal, chatHistory, mindMapEdges);
    };

    const addSession = (session: StudySession) => {
        const newSessions = [session, ...sessions];
        setSessions(newSessions);
        if (user) persistData(user, grades, newSessions, journal, chatHistory, mindMapEdges);
    };

    const addGrade = (grade: Grade) => {
        const newGrades = [...grades, grade];
        setGrades(newGrades);
        if (user) persistData(user, newGrades, sessions, journal, chatHistory, mindMapEdges);
    };

    const deleteGrade = (id: string) => {
        const newGrades = grades.filter(g => g.id !== id);
        setGrades(newGrades);
        if (user) persistData(user, newGrades, sessions, journal, chatHistory, mindMapEdges);
    };

    const addJournalEntry = (entry: JournalEntry) => {
        const newJournal = [entry, ...journal];
        setJournal(newJournal);
        if (user) persistData(user, grades, sessions, newJournal, chatHistory, mindMapEdges);
    };

    const addChatMessage = (msg: ChatMessage) => {
        const newHistory = [...chatHistory, msg];
        setChatHistory(newHistory);
        if (user) persistData(user, grades, sessions, journal, newHistory, mindMapEdges);
    };

    const setMindMapEdges = (edges: MindMapEdge[]) => {
        setMindMapEdgesState(edges);
        if (user) persistData(user, grades, sessions, journal, chatHistory, edges);
    };

    return (
        <AuthContext.Provider value={{
            user, grades, sessions, journal, chatHistory, mindMapEdges,
            login, loginDemo, loginWithGoogle, logout,
            addSession, addGrade, deleteGrade, addJournalEntry, addXP,
            addChatMessage, setMindMapEdges
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
