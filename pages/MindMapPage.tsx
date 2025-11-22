
import React from 'react';
import MindMap from '../components/MindMap';
import { useAuth } from '../context/AuthContext';
import { Network } from 'lucide-react';

const MindMapPage: React.FC = () => {
    const { chatHistory } = useAuth();

    return (
        <div className="h-[calc(100vh-2rem)] p-4 md:p-8 max-w-7xl mx-auto flex flex-col animate-fadeIn">
            <div className="flex-1 glassmorphism rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/20 relative">
                <div className="p-4 border-b border-white/10 bg-white/10 backdrop-blur-md flex justify-between items-center z-20 relative">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 rounded-full flex items-center justify-center shadow-lg">
                            <Network size={24} />
                        </div>
                        <div>
                            <h2 className="font-heading font-bold text-gray-800 dark:text-white">Knowledge Graph</h2>
                             <p className="text-xs text-gray-500 dark:text-gray-400">Visualizing your study session concepts</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-gray-50/50 dark:bg-black/20 relative overflow-hidden">
                    <MindMap messages={chatHistory} />
                </div>
            </div>
        </div>
    );
};

export default MindMapPage;
