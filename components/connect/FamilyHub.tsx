
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { getCommunicationAdvice } from '../../services/geminiService';

const FamilyHub: React.FC = () => {
    const [scenario, setScenario] = useState('');
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!scenario.trim()) return;
        setIsLoading(true);
        setError('');
        setAdvice('');
        try {
            const result = await getCommunicationAdvice(scenario);
            setAdvice(result);
        } catch (err) {
            console.error(err);
            setError('Failed to get advice. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-hero-accent">Family Empowerment Hub</h2>
                <p className="text-hero-text-secondary mt-1 max-w-2xl mx-auto">
                   Tools and resources to support the families and spouses of veterans.
                </p>
            </div>
            <Card>
                <h3 className="text-lg font-bold mb-2 text-hero-primary">AI Communication Coach</h3>
                <p className="text-hero-text-secondary mb-4">Describe a communication challenge you're facing, and our AI coach will provide trauma-informed advice and example scripts.</p>
                <div className="space-y-4">
                    <textarea
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        placeholder="e.g., How can I talk to my partner about their nightmares without upsetting them?"
                        className="w-full bg-hero-bg p-3 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"
                        rows={3}
                        disabled={isLoading}
                    />
                    <div className="text-right">
                        <Button onClick={handleSubmit} disabled={isLoading || !scenario.trim()}>
                            {isLoading ? 'Getting Advice...' : 'Get Communication Advice'}
                        </Button>
                    </div>
                </div>
            </Card>
            
            {(isLoading || error || advice) && (
                <Card>
                    {isLoading && <Spinner text="Generating advice..."/>}
                    {error && <p className="text-red-400">{error}</p>}
                    {advice && (
                        <div>
                             <h3 className="text-lg font-bold mb-2 text-hero-accent">Coach's Suggestion</h3>
                             <div
                                className="prose prose-invert max-w-none text-hero-text-primary"
                                dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}
                             />
                        </div>
                    )}
                </Card>
            )}

             <Card>
                <h3 className="text-lg font-bold mb-2 text-hero-primary">Resource Library</h3>
                <p className="text-hero-text-secondary">A curated list of articles, videos, and support organizations for military families. (Coming soon)</p>
            </Card>

        </div>
    );
};

export default FamilyHub;
