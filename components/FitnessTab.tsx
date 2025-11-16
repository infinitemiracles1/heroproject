
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateFitnessPlan, generateRegulationToolGuide } from '../services/geminiService';
import Button from './common/Button';
import Spinner from './common/Spinner';
import Card from './common/Card';

// Add SpeechRecognition to window type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const MicrophoneIcon = ({ className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.75 6.75 0 11-13.5 0v-1.5A.75.75 0 016 10.5z" />
    </svg>
);

const ReadinessInput: React.FC<{label: string, value: number, onChange: (value: number) => void, min?: number, max?: number, description: string}> = ({ label, value, onChange, min = 0, max = 10, description }) => (
    <div>
        <label className="block font-semibold text-hero-text-primary">{label}</label>
        <p className="text-sm text-hero-text-secondary mb-2">{description}</p>
        <div className="flex items-center gap-4">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-2 bg-hero-border rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-bold text-hero-accent w-8 text-center">{value}</span>
        </div>
    </div>
);


const FitnessTab: React.FC = () => {
    // Readiness State
    const [mood, setMood] = useState(5);
    const [pain, setPain] = useState(0);
    const [stress, setStress] = useState(5);
    const [sleep, setSleep] = useState(5);
    const [hrv, setHrv] = useState<number | null>(null);

    // Tool State
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [toolContent, setToolContent] = useState('');
    const [isToolLoading, setIsToolLoading] = useState(false);

    // Voice Input State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Main Form State
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fitnessPlan, setFitnessPlan] = useState('');
    const [error, setError] = useState('');

    // Derived readiness score
    const readinessScore = useMemo(() => {
        // A weighted score where higher is better. Pain and stress have a larger negative impact.
        let score = 10 - (pain * 0.3) - (stress * 0.25) + (sleep * 0.2) + (mood * 0.25);
        // Add a small bonus/penalty for HRV if provided.
        if (hrv !== null && hrv > 0) {
            // Simple normalization: assume avg is 40. Every 20ms above/below adds/subtracts a point, max of +/- 2 points.
            const hrvBonus = Math.min(2, Math.max(-2, (hrv - 40) / 20));
            score += hrvBonus;
        }
        return Math.max(0, Math.min(10, Math.round(score * 10) / 10)); // Clamp between 0-10 and round to 1 decimal
    }, [mood, pain, stress, sleep, hrv]);

    // Setup speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Stop after a pause
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (isListening) setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [isListening]);
    
    const handleToggleListening = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
        setIsListening(!isListening);
    };


    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        setFitnessPlan('');
        
        const readinessData = `Readiness Score: ${readinessScore}/10 (Mood: ${mood}, Pain: ${pain}, Stress: ${stress}, Sleep: ${sleep}${hrv !== null ? `, HRV: ${hrv}ms` : ''}).`;
        const fullPrompt = `${readinessData}\n\nUser's notes: "${prompt.trim() || 'No specific notes.'}"`;

        try {
            const plan = await generateFitnessPlan(fullPrompt);
            setFitnessPlan(plan);
        } catch (err) {
            console.error(err);
            setError('Failed to generate fitness plan. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToolClick = async (tool: string) => {
        if (selectedTool === tool) {
            setSelectedTool(null); // Toggle off if already selected
            setToolContent('');
            return;
        }
        setSelectedTool(tool);
        setIsToolLoading(true);
        setToolContent('');
        try {
            const content = await generateRegulationToolGuide(tool);
            setToolContent(content);
        } catch (err) {
            console.error(err);
            setToolContent('Failed to load guide. Please try again.');
        } finally {
            setIsToolLoading(false);
        }
    };
    
    const regulationTools = ["EFT Tapping", "Sensory Scan", "Box Breathing"];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-hero-accent">HERO CARE FIT™</h2>
                <p className="text-hero-text-secondary mt-2 max-w-2xl mx-auto">
                    "Healing through movement. Strength through compassion." Use the tools below to check in with your body and generate a workout that meets you where you are today.
                </p>
            </div>

            <Card>
                <h3 className="text-xl font-bold mb-4 text-hero-primary">1. Daily Recovery Check-in</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-4">
                        <ReadinessInput label="Mood" value={mood} onChange={setMood} description="How are you feeling emotionally? (0=Low, 10=Great)" />
                        <ReadinessInput label="Pain" value={pain} onChange={setPain} description="Any physical pain? (0=None, 10=Severe)" />
                        <ReadinessInput label="Stress" value={stress} onChange={setStress} description="Current stress level? (0=Calm, 10=High)" />
                        <ReadinessInput label="Sleep Quality" value={sleep} onChange={setSleep} description="How did you sleep? (0=Poorly, 10=Perfectly)" />
                         <div>
                            <label className="block font-semibold text-hero-text-primary">Heart Rate Variability (HRV) (Optional)</label>
                            <p className="text-sm text-hero-text-secondary mb-2">If you track HRV (ms), enter it. Higher is often better.</p>
                            <input
                                type="number"
                                value={hrv === null ? '' : hrv}
                                onChange={(e) => setHrv(e.target.value === '' ? null : Number(e.target.value))}
                                placeholder="e.g., 45"
                                className="w-full bg-hero-bg p-2 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-hero-bg p-4 rounded-lg border border-hero-border">
                        <p className="text-hero-text-secondary text-lg">Recovery Readiness Score</p>
                        <p className="text-5xl font-bold text-hero-accent my-2">{readinessScore}</p>
                        <p className="text-center text-sm text-hero-text-secondary">This score helps adapt your workout. Higher is better.</p>
                    </div>
                </div>
            </Card>

            <Card>
                 <h3 className="text-xl font-bold mb-4 text-hero-primary">2. Describe Your State & Goals</h3>
                <div className="space-y-4">
                    <label htmlFor="fitness-prompt" className="block font-semibold text-hero-text-primary">
                        Add any specific notes, goals, or limitations for today. (Optional)
                    </label>
                     <div className="relative">
                        <textarea
                            id="fitness-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'I want to focus on mobility', 'My left knee is sore', 'I only have 20 minutes.'"
                            className="w-full bg-hero-bg p-3 pr-12 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"
                            rows={3}
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleToggleListening}
                            className={`absolute top-3 right-3 p-1 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'bg-hero-primary text-white hover:bg-hero-primary-hover'}`}
                            title="Use Voice Input"
                        >
                            <MicrophoneIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <div className="text-right">
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? 'Generating Plan...' : 'Create My Movement Plan'}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold mb-4 text-hero-primary">3. Quick Regulation Tools</h3>
                <p className="text-hero-text-secondary mb-4">Use these short exercises to ground yourself before, during, or after movement.</p>
                <div className="flex flex-wrap gap-2">
                    {regulationTools.map(tool => (
                        <Button 
                            key={tool}
                            variant={selectedTool === tool ? 'primary' : 'secondary'}
                            onClick={() => handleToolClick(tool)}
                        >
                            {tool}
                        </Button>
                    ))}
                </div>
                {selectedTool && (
                    <div className="mt-4 p-4 bg-hero-bg rounded-lg border border-hero-border">
                        {isToolLoading ? <Spinner /> : (
                             <div
                                className="prose prose-invert max-w-none text-hero-text-primary"
                                dangerouslySetInnerHTML={{ __html: toolContent.replace(/\n/g, '<br />') }}
                             />
                        )}
                    </div>
                )}
            </Card>

            {isLoading && (
                <div className="flex justify-center p-8">
                    <Spinner text="Building your adaptive workout..." size="lg" />
                </div>
            )}
            
            {error && <p className="text-red-400 text-center">{error}</p>}

            {fitnessPlan && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-hero-accent">Your Adaptive Movement Pathway</h3>
                    <div
                        className="prose prose-invert max-w-none text-hero-text-primary"
                        dangerouslySetInnerHTML={{ __html: fitnessPlan.replace(/\n/g, '<br />') }}
                    />
                    <div className="text-center mt-6 border-t border-hero-border pt-4">
                        <Button variant="secondary" disabled>
                            View Movement History
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default FitnessTab;