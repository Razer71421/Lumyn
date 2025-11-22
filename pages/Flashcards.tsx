import React, { useState } from 'react';
import { Upload, Sparkles, ChevronLeft, ChevronRight, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { generateFlashcardsFromText } from '../services/geminiService';
import { extractTextFromPdf } from '../services/pdfService';
import { Flashcard } from '../types';
import { v4 as uuidv4 } from 'uuid';

const Flashcards: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;
        setIsLoading(true);
        setError(null);
        
        try {
            let text = '';
            if (file.type === 'application/pdf') {
                text = await extractTextFromPdf(file);
            } else {
                text = await file.text();
            }

            if (text.length < 50) {
                throw new Error("Text content is too short to generate flashcards.");
            }

            const generatedCards = await generateFlashcardsFromText(text);
            const formattedCards = generatedCards.map((c: any) => ({
                id: uuidv4(),
                front: c.front,
                back: c.back
            }));

            setCards(formattedCards);
            setCurrentIndex(0);
            setIsFlipped(false);
        } catch (err) {
            console.error(err);
            setError("Failed to generate flashcards. Ensure your API Key is set and the file is valid text/pdf.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 200);
    };

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto animate-fadeIn h-full flex flex-col">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-heading font-bold text-gray-800 dark:text-white mb-2">AI Flashcards</h1>
                <p className="text-gray-500">Upload notes or PDFs to instantly generate study cards.</p>
            </div>

            {/* Upload Section */}
            {cards.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="glassmorphism p-10 rounded-3xl w-full max-w-lg text-center border-2 border-dashed border-accent/30 hover:border-accent transition-colors">
                        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Upload Study Material</h3>
                        <p className="text-gray-500 mb-6 text-sm">Supported formats: .txt, .pdf</p>
                        
                        <input 
                            type="file" 
                            accept=".txt,.pdf" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer inline-block px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition mb-4">
                            {file ? file.name : "Select File"}
                        </label>

                        {file && (
                            <button 
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full py-3 bg-accent text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                                {isLoading ? 'Generating...' : 'Generate Cards'}
                            </button>
                        )}
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-6">
                        <button onClick={() => setCards([])} className="text-gray-500 hover:text-accent flex items-center gap-1">
                            <RefreshCw size={16} /> Reset
                        </button>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Card {currentIndex + 1} / {cards.length}</span>
                    </div>

                    {/* 3D Flip Card */}
                    <div 
                        className="relative w-full max-w-xl aspect-[3/2] cursor-pointer perspective-1000 group"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                            {/* Front */}
                            <div className="absolute w-full h-full backface-hidden glassmorphism rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-t border-white/50">
                                <span className="absolute top-6 left-6 text-xs font-bold text-accent uppercase tracking-wider">Question</span>
                                <p className="text-xl md:text-2xl font-medium text-gray-800 dark:text-white">{cards[currentIndex].front}</p>
                                <p className="absolute bottom-6 text-xs text-gray-400">Click to flip</p>
                            </div>

                            {/* Back */}
                            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border border-accent/20">
                                <span className="absolute top-6 left-6 text-xs font-bold text-accent uppercase tracking-wider">Answer</span>
                                <p className="text-xl md:text-2xl font-medium text-gray-800 dark:text-white">{cards[currentIndex].back}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button onClick={prevCard} className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-white">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextCard} className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-600 dark:text-white">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Flashcards;
