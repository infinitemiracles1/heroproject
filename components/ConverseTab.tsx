
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Chat } from '@google/genai';
import { createChat, generateWithSearch, generateWithMaps, HERO_SYSTEM_INSTRUCTION } from '../services/geminiService';
import { decode, encode, decodeAudioData } from '../utils/helpers';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';
import { GroundingChunk } from '../types';

type ConversationMode = 'voice' | 'text';

const MicrophoneIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);

const StopIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);


const ConverseTab: React.FC = () => {
    const [mode, setMode] = useState<ConversationMode>('voice');
    
    // Voice state
    const [isConnecting, setIsConnecting] = useState(false);
    const [isLive, setIsLive] = useState(false);
    // FIX: Changed state to be more structured for better transcription handling.
    const [liveTranscription, setLiveTranscription] = useState<{ speaker: 'You' | 'HERO AI' | 'System', text: string }[]>([]);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    
    // Text state
    const [chat, setChat] = useState<Chat | null>(null);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', text: string, sources?: GroundingChunk[] }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [useGrounding, setUseGrounding] = useState<'none' | 'search' | 'maps'>('none');


    useEffect(() => {
        setChat(createChat());
        return () => {
            // Cleanup on tab change
            stopLiveConversation();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSendTextMessage = async () => {
        if (!userInput.trim() || isThinking) return;

        setIsThinking(true);
        const currentInput = userInput;
        setUserInput('');
        setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);

        try {
            let response;
            let sources: GroundingChunk[] = [];
            if (useGrounding === 'search') {
                response = await generateWithSearch(currentInput);
                sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            } else if (useGrounding === 'maps') {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                response = await generateWithMaps(currentInput, position.coords.latitude, position.coords.longitude);
                 sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            } else {
                if (!chat) throw new Error("Chat not initialized");
                response = await chat.sendMessage({ message: currentInput });
            }
            setChatHistory(prev => [...prev, { role: 'model', text: response.text, sources }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setChatHistory(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const startLiveConversation = async () => {
        setIsConnecting(true);
        setLiveTranscription([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            
            const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;
            let nextStartTime = 0;
            const sources = new Set<AudioBufferSourceNode>();
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsLive(true);
                        
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            // FIX: More efficient conversion from Float32Array to Int16Array.
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // FIX: Append to the last transcription message instead of creating new ones for each chunk.
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setLiveTranscription(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'You') {
                                    const newLast = {...last, text: last.text + text};
                                    return [...prev.slice(0, -1), newLast];
                                }
                                return [...prev, { speaker: 'You', text }];
                            });
                        }
                         if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent.outputTranscription.text;
                            setLiveTranscription(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.speaker === 'HERO AI') {
                                    const newLast = {...last, text: last.text + text};
                                    return [...prev.slice(0, -1), newLast];
                                }
                                return [...prev, { speaker: 'HERO AI', text }];
                            });
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const sourceNode = outputAudioContext.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(outputAudioContext.destination);
                            sourceNode.addEventListener('ended', () => sources.delete(sourceNode));
                            sourceNode.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(sourceNode);
                        }
                    },
                    onerror: (e) => {
                        console.error('Live API Error:', e);
                        // FIX: Use structured object for system messages.
                        setLiveTranscription(prev => [...prev, { speaker: "System", text: "Connection error." }]);
                        stopLiveConversation();
                    },
                    onclose: () => {
                        setIsLive(false);
                        setIsConnecting(false);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: HERO_SYSTEM_INSTRUCTION,
                },
            });
        } catch (error) {
            console.error('Failed to start live conversation:', error);
            setIsConnecting(false);
            setLiveTranscription(prev => [...prev, { speaker: "System", text: "Could not start microphone." }]);
        }
    };

    const stopLiveConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        audioContextRef.current?.close();
        audioContextRef.current = null;
        
        outputAudioContextRef.current?.close();
        outputAudioContextRef.current = null;

        setIsLive(false);
        setIsConnecting(false);
    }, []);

    return (
        <div>
            <div className="flex justify-center mb-6">
                <div className="relative flex w-36 rounded-full bg-hero-bg p-1">
                    <div className={`absolute top-0 left-0 h-full w-1/2 p-1 transition-transform duration-300 ease-in-out ${mode === 'text' ? 'translate-x-full' : ''}`}>
                        <div className="h-full w-full rounded-full bg-hero-primary"></div>
                    </div>
                    <button onClick={() => setMode('voice')} className="relative z-10 w-1/2 py-1.5 text-sm font-semibold text-white">
                        Voice
                    </button>
                    <button onClick={() => setMode('text')} className="relative z-10 w-1/2 py-1.5 text-sm font-semibold text-white">
                        Text
                    </button>
                </div>
            </div>

            {mode === 'voice' && (
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">HERO SUPPORT™</h2>
                    <p className="text-hero-text-secondary mb-6">A real-time, trauma-informed conversational AI companion.</p>
                    <div className="flex justify-center items-center mb-4">
                        {!isLive && !isConnecting && (
                            <Button onClick={startLiveConversation} className="flex items-center gap-2"><MicrophoneIcon className="w-5 h-5" /> Start Conversation</Button>
                        )}
                        {isConnecting && <Spinner text="Connecting..." />}
                        {isLive && (
                            <Button onClick={stopLiveConversation} variant="secondary" className="bg-red-600 hover:bg-red-700 flex items-center gap-2"><StopIcon className="w-5 h-5"/> Stop Conversation</Button>
                        )}
                    </div>
                     <Card className="min-h-[200px] text-left bg-hero-bg">
                        <h3 className="font-semibold mb-2">Live Transcription</h3>
                        <div className="text-sm text-hero-text-secondary space-y-1">
                            {liveTranscription.length === 0 && <p>Waiting for conversation to start...</p>}
                            {/* FIX: Render structured transcription data. */}
                            {liveTranscription.map((line, index) => <p key={index}><strong>{line.speaker}:</strong> {line.text}</p>)}
                        </div>
                    </Card>
                </div>
            )}

            {mode === 'text' && (
                 <div className="flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-2 text-center">HERO AI Chat</h2>
                    <div className="flex-grow bg-hero-bg p-4 rounded-lg mb-4 h-96 overflow-y-auto">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block p-3 rounded-lg ${msg.role === 'user' ? 'bg-hero-primary text-white' : 'bg-hero-border'}`}>
                                    <p>{msg.text}</p>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-2 border-t border-hero-text-secondary/50 pt-2 text-xs">
                                            <p className="font-bold mb-1">Sources:</p>
                                            <ul className="list-disc list-inside">
                                                {msg.sources.map((source, i) => (
                                                    <li key={i}>
                                                        {source.web && <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.web.title}</a>}
                                                        {source.maps && <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.maps.title}</a>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="text-left">
                                <div className="inline-block p-3 rounded-lg bg-hero-border">
                                    <Spinner size="sm" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendTextMessage(); }}}
                            className="flex-grow bg-hero-bg p-2 rounded-lg border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"
                            placeholder="Type your message..."
                            rows={1}
                            disabled={isThinking}
                        />
                         <select value={useGrounding} onChange={(e) => setUseGrounding(e.target.value as any)} className="bg-hero-bg border border-hero-border p-2 rounded-lg focus:ring-2 focus:ring-hero-primary focus:outline-none">
                            <option value="none">Standard</option>
                            <option value="search">Search</option>
                            <option value="maps">Maps</option>
                        </select>
                        <Button onClick={handleSendTextMessage} disabled={isThinking || !userInput.trim()}>Send</Button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ConverseTab;
