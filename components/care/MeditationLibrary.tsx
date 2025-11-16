
import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { generateMeditationText, generateSpeech } from '../../services/geminiService';
import { decode, decodeAudioData } from '../../utils/helpers';

interface Meditation {
    theme: string;
    duration: number; // in minutes
    description: string;
    icon: string;
}

const meditations: Meditation[] = [
    { theme: 'Mindfulness', duration: 5, description: 'Focus on your breath and find presence.', icon: '🧠' },
    { theme: 'Sleep', duration: 10, description: 'Prepare your mind and body for restful sleep.', icon: '😴' },
    { theme: 'Stress Reduction', duration: 7, description: 'Release tension and calm your nervous system.', icon: '🌬️' },
];

const MeditationLibrary: React.FC = () => {
    const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [meditationText, setMeditationText] = useState('');
    const [error, setError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const handleSelectMeditation = async (meditation: Meditation) => {
        setSelectedMeditation(meditation);
        setIsLoading(true);
        setError('');
        setMeditationText('');
        setIsPlaying(false);
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }

        try {
            const text = await generateMeditationText(meditation.theme, meditation.duration);
            setMeditationText(text);
            const audioBase64 = await generateSpeech(text);
            
            // Play audio
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioCtx = audioContextRef.current;
            const audioBuffer = await decodeAudioData(decode(audioBase64), audioCtx, 24000, 1);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.onended = () => setIsPlaying(false);
            source.start();
            audioSourceRef.current = source;
            setIsPlaying(true);

        } catch (err) {
            console.error(err);
            setError('Failed to generate meditation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const stopPlayback = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            setIsPlaying(false);
        }
    }

    if (selectedMeditation) {
        return (
            <Card className="mt-6">
                <Button variant="secondary" onClick={() => { stopPlayback(); setSelectedMeditation(null); }} className="mb-4">&larr; Back to Library</Button>
                <h3 className="text-2xl font-bold text-hero-accent mb-2">{selectedMeditation.theme} Meditation</h3>
                <p className="text-hero-text-secondary mb-4">{selectedMeditation.duration} minutes</p>
                {isLoading && <Spinner text="Preparing your personalized meditation..." />}
                {error && <p className="text-red-400">{error}</p>}
                {!isLoading && meditationText && (
                    <div>
                         {isPlaying ? (
                            <Button onClick={stopPlayback} variant="primary" className="bg-red-600 hover:bg-red-700">Stop</Button>
                         ) : <p className="text-hero-accent">[Meditation Finished]</p>}
                        <div className="mt-4 p-4 bg-hero-bg rounded-lg max-h-96 overflow-y-auto">
                            <p className="whitespace-pre-wrap text-hero-text-secondary">{meditationText}</p>
                        </div>
                    </div>
                )}
            </Card>
        );
    }

    return (
        <div className="space-y-6 mt-6">
             <div className="text-center">
                <h2 className="text-xl font-bold text-hero-accent">Meditation Library</h2>
                <p className="text-hero-text-secondary mt-1 max-w-2xl mx-auto">
                   Select a theme to begin a unique, AI-guided meditation session.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {meditations.map(med => (
                    <button key={med.theme} onClick={() => handleSelectMeditation(med)} className="text-left">
                        <Card className="h-full hover:border-hero-primary transition-colors">
                            <p className="text-3xl mb-2">{med.icon}</p>
                            <h3 className="text-lg font-bold text-hero-primary">{med.theme}</h3>
                            <p className="text-sm text-hero-text-secondary">{med.duration} min &bull; {med.description}</p>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MeditationLibrary;
