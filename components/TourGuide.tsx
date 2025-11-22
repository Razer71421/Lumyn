
import React, { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface Step {
    targetId: string;
    title: string;
    content: string;
}

const steps: Step[] = [
    { targetId: 'tour-dashboard', title: 'Welcome to Lumyn', content: 'Your personal study sanctuary. Track your progress and stay motivated.' },
    { targetId: 'tour-focus', title: 'Focus Timer', content: 'Use the Pomodoro technique with ambient sounds to stay in the zone.' },
    { targetId: 'tour-flashcards', title: 'AI Flashcards', content: 'Upload your notes and let AI generate study materials for you.' },
    { targetId: 'tour-analytics', title: 'Analytics', content: 'Visualize your grades and identify areas for improvement.' },
    { targetId: 'tour-journal', title: 'Study Journal', content: 'Reflect on your sessions and track your mood.' },
    { targetId: 'tour-mindmap', title: 'Mind Map', content: 'Visualize connections between your study questions and concepts.' },
    { targetId: 'tour-mentor', title: 'AI Mentor', content: 'Chat with Lumyn anytime you need study advice or encouragement.' },
];

const TourGuide: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        // Check if user has seen tour
        const seenTour = localStorage.getItem('lumyn_tour_seen');
        if (!seenTour) {
            setIsVisible(true);
        }
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const target = document.querySelector(`[data-tour-id="${steps[currentStep].targetId}"]`);
            if (target) {
                const rect = target.getBoundingClientRect();
                // Position to the right of the element if desktop, or below if mobile
                if (window.innerWidth > 768) {
                    setPosition({
                        top: rect.top + window.scrollY,
                        left: rect.right + 20
                    });
                } else {
                     setPosition({
                        top: rect.bottom + window.scrollY + 20,
                        left: 20 // fixed left padding on mobile
                    });
                }
            }
        };

        // Add slight delay to allow DOM to settle
        const timer = setTimeout(updatePosition, 300);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
            clearTimeout(timer);
        };
    }, [currentStep, isVisible]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('lumyn_tour_seen', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
             {/* Backdrop with cutout logic is complex, using simple overlay for now */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/20 pointer-events-auto" onClick={handleClose}></div>

            <div 
                className="absolute pointer-events-auto bg-white dark:bg-gray-800 p-5 rounded-xl shadow-2xl w-72 border border-accent/30 animate-fadeIn"
                style={{ top: position.top, left: position.left }}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-bold text-lg text-accent">{steps[currentStep].title}</h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {steps[currentStep].content}
                </p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">{currentStep + 1} / {steps.length}</span>
                    <button 
                        onClick={handleNext}
                        className="bg-accent hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        <ChevronRight size={14} />
                    </button>
                </div>
                
                {/* Arrow Indicator */}
                <div className={`absolute w-3 h-3 bg-white dark:bg-gray-800 border-l border-b border-accent/30 transform rotate-45 ${window.innerWidth > 768 ? '-left-1.5 top-6' : '-top-1.5 left-8'}`}></div>
            </div>
        </div>
    );
};

export default TourGuide;
