
import { GoogleGenAI, GenerateContentResponse, Chat, Modality } from '@google/genai';
import { AspectRatio, VeoOperation } from '../types';

const getAiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const HERO_SYSTEM_INSTRUCTION = `You are the system brain for The HERO Project™, a national, trauma-informed, AI-powered ecosystem designed to prevent veteran suicide, support recovery, and activate lifelong leadership.
Your role is to be calm, steady, validating, trauma-informed, choice-based, non-judgmental, supportive, and safety-oriented.
You never use forceful, shaming, or high-pressure language. You always give options, never commands.`;

export const createChat = (): Chat => {
    const ai = getAiClient();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: HERO_SYSTEM_INSTRUCTION,
        },
    });
};

export const generateWithSearch = async (prompt: string): Promise<GenerateContentResponse> => {
    const ai = getAiClient();
    return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: HERO_SYSTEM_INSTRUCTION
        },
    });
};

export const generateWithMaps = async (prompt: string, latitude: number, longitude: number): Promise<GenerateContentResponse> => {
    const ai = getAiClient();
    return await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude,
                        longitude,
                    },
                },
            },
            systemInstruction: HERO_SYSTEM_INSTRUCTION
        },
    });
};

export const generateRegulationToolGuide = async (toolName: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Provide a simple, step-by-step guide for a veteran to perform a self-guided "${toolName}" exercise. The tone should be calm, supportive, and trauma-informed. Keep it concise and easy to follow in a moment of stress. Format the response with markdown for readability.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: HERO_SYSTEM_INSTRUCTION
        }
    });
    return response.text;
};

export const generateFitnessPlan = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 32768 },
            systemInstruction: `${HERO_SYSTEM_INSTRUCTION} You are in HERO CARE FIT™ mode. Generate an adaptive, trauma-informed workout plan based on the user's input. Structure it with a warm-up, main exercises (with modifications), and a cooldown. Emphasize breath-paced movement and self-compassion.`
        },
    });
    return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated in response");
};

export const generateVideoFromPrompt = async (prompt: string, aspectRatio: '16:9' | '9:16'): Promise<VeoOperation> => {
    const ai = getAiClient();
    return await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });
};

export const generateVideoFromImage = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: '16:9' | '9:16'): Promise<VeoOperation> => {
    const ai = getAiClient();
    return await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });
};

export const checkVideoOperation = async (operation: VeoOperation): Promise<VeoOperation> => {
    const ai = getAiClient();
    return await ai.operations.getVideosOperation({ operation: operation });
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAiClient();
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType
                    }
                }
            ]
        },
        config: {
            systemInstruction: HERO_SYSTEM_INSTRUCTION,
        }
     });
     return response.text;
};

// New services for expanded features

export const generateMeditationText = async (theme: string, duration: number): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Generate a ${duration}-minute guided meditation script about "${theme}". The tone must be exceptionally calm, gentle, and trauma-informed. Use simple language. Focus on grounding and safety. Structure it with a brief intro, the main body focusing on the theme, and a gentle conclusion to bring the user back to the present.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: HERO_SYSTEM_INSTRUCTION
        }
    });
    return response.text;
};

export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A calm, steady voice
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Failed to generate audio from text.");
    }
    return base64Audio;
};


export const getWritingAssistance = async (text: string, instruction: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `The user is writing a personal story. Here is a piece of their writing:\n\n---\n${text}\n---\n\nTheir instruction is: "${instruction}".\nPlease fulfill this instruction while maintaining the user's authentic voice. Be supportive and constructive.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using Pro for more nuanced writing tasks
        contents: prompt,
        config: {
            systemInstruction: `${HERO_SYSTEM_INSTRUCTION} You are a supportive writing assistant for a veteran. Your goal is to help them tell their story in their own voice.`
        }
    });
    return response.text;
};

export const getCommunicationAdvice = async (scenario: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `A veteran's family member is asking for advice on the following scenario: "${scenario}". Please provide supportive, practical communication advice. Offer a few example phrases or scripts they could use. The advice should be based on non-violent communication principles and be trauma-informed.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: `${HERO_SYSTEM_INSTRUCTION} You are a family communication coach specializing in supporting veterans' families.`
        }
    });
    return response.text;
}


export { GoogleGenAI, HERO_SYSTEM_INSTRUCTION };
