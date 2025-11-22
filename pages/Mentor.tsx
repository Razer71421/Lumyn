
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { getMentorResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';

const Mentor: React.FC = () => {
    const { user, chatHistory, addChatMessage } = useAuth();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = {
            id: uuidv4(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        addChatMessage(userMsg);
        setInput('');
        setIsTyping(true);

        try {
            // Prepare history for API
            const history = chatHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const responseText = await getMentorResponse(history, userMsg.text);
            
            const aiMsg: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                text: responseText || "I'm thinking...",
                timestamp: Date.now()
            };
            addChatMessage(aiMsg);
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: uuidv4(),
                role: 'model',
                text: "I'm having trouble connecting right now. Please check your API Key.",
                timestamp: Date.now()
            };
            addChatMessage(errorMsg);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="h-[calc(100vh-2rem)] p-4 md:p-8 max-w-6xl mx-auto flex flex-col animate-fadeIn">
            <div className="flex-1 glassmorphism rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/20 relative">
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/10 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 z-20">
                    <div className="flex items-center gap-3 self-start md:self-auto">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-gray-800 dark:text-white">Lumyn Mentor</h2>
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area - Chat */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/40 dark:bg-black/10">
                    {chatHistory.map((msg) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-accent text-white'}`}>
                                        {isUser ? (user?.avatar ? <img src={user.avatar} className="rounded-full" alt="me"/> : <UserIcon size={16} />) : <Bot size={16} />}
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm text-sm md:text-base ${isUser ? 'bg-accent text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <span className={`text-[10px] mt-2 block opacity-70 ${isUser ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isTyping && (
                        <div className="flex justify-start animate-pulse">
                            <div className="flex gap-3 items-center">
                                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/30 dark:bg-black/20 backdrop-blur-md z-30 border-t border-white/20">
                    <form onSubmit={handleSend} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a study question..."
                            className="w-full p-4 pr-12 rounded-2xl bg-white dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-accent shadow-inner text-gray-800 dark:text-white placeholder-gray-400"
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-accent text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:hover:bg-accent"
                        >
                            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Mentor;
