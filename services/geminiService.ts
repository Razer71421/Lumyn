
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, MindMapEdge } from "../types";

export const generateFlashcardsFromText = async (text: string): Promise<any[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Create 5-10 study flashcards from the following text. Return ONLY a JSON array of objects with "front" and "back" properties. Text: ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            front: { type: Type.STRING },
                            back: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Gemini Flashcard Error:", error);
        throw error;
    }
};

export const getMentorResponse = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: "You are Lumyn, a friendly, calm, and encouraging AI study mentor. Keep answers concise, motivating, and helpful for students.",
        },
        history: history // Pass previous history
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text;
};

export const analyzeDoubtsConnections = async (messages: ChatMessage[]): Promise<MindMapEdge[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Filter only user messages to find connections between doubts
    const userDoubts = messages
        .filter(m => m.role === 'user')
        .map(m => ({ id: m.id, text: m.text }));

    if (userDoubts.length < 2) return [];

    const prompt = `
        Analyze the following user study questions/doubts. 
        Identify conceptual relationships between them.
        Return a JSON array of objects where each object has "source" and "target" corresponding to the IDs of the related questions.
        Only link questions that are semantically related.
        
        Questions:
        ${JSON.stringify(userDoubts)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            source: { type: Type.STRING },
                            target: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text);
        }
        return [];
    } catch (error) {
        console.error("Gemini Mind Map Error:", error);
        return [];
    }
};
