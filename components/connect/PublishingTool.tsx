
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { getWritingAssistance } from '../../services/geminiService';

const PublishingTool: React.FC = () => {
    const [storyText, setStoryText] = useState('');
    const [instruction, setInstruction] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!storyText.trim() || !instruction.trim()) {
            setError('Please provide some text and an instruction for the assistant.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestion('');
        try {
            const result = await getWritingAssistance(storyText, instruction);
            setSuggestion(result);
        } catch (err) {
            console.error(err);
            setError('Failed to get assistance. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-hero-accent">Pathway to Publishing</h2>
                <p className="text-hero-text-secondary mt-1 max-w-2xl mx-auto">
                   Use this space to write your story and get help from an AI assistant to refine your work.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                    <h3 className="text-lg font-bold mb-2 text-hero-primary">Your Story</h3>
                    <textarea
                        value={storyText}
                        onChange={(e) => setStoryText(e.target.value)}
                        placeholder="Start writing here..."
                        className="w-full flex-grow bg-hero-bg p-3 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"
                    />
                </Card>
                <div className="space-y-4">
                    <Card>
                         <h3 className="text-lg font-bold mb-2 text-hero-primary">AI Writing Assistant</h3>
                         <div className="space-y-3">
                            <label className="block text-sm font-medium text-hero-text-secondary">What would you like help with?</label>
                             <textarea
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                placeholder="e.g., 'Refine this paragraph for clarity', 'Suggest a stronger opening sentence', or 'Check for consistent tone'."
                                className="w-full bg-hero-bg p-2 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"
                                rows={3}
                            />
                            <div className="text-right">
                                <Button onClick={handleSubmit} disabled={isLoading || !storyText.trim()}>
                                    {isLoading ? 'Thinking...' : 'Get Suggestion'}
                                </Button>
                            </div>
                         </div>
                    </Card>
                     {(isLoading || error || suggestion) && (
                        <Card>
                            {isLoading && <Spinner />}
                            {error && <p className="text-red-400">{error}</p>}
                            {suggestion && (
                                <div>
                                     <h3 className="text-lg font-bold mb-2 text-hero-accent">Suggestion</h3>
                                     <p className="text-hero-text-primary whitespace-pre-wrap">{suggestion}</p>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublishingTool;
