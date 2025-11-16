
import React, { useState } from 'react';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Card from '../common/Card';
import { analyzeImage } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/helpers';

const ContentAnalysis: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                setError('File size should be less than 4MB.');
                return;
            }
            setError('');
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async () => {
        if (!prompt.trim() || !imageFile) {
            setError('Please provide an image and a prompt.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');

        try {
            const base64 = await fileToBase64(imageFile);
            const analysisResult = await analyzeImage(prompt, base64, imageFile.type);
            setResult(analysisResult);
        } catch (err) {
            console.error(err);
            setError('Failed to analyze the image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-hero-accent">Analyze Content</h2>
                <p className="text-hero-text-secondary mt-1 max-w-2xl mx-auto">
                    Upload an image and ask Gemini to analyze it, describe it, or answer questions about its content.
                </p>
            </div>

            <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-2">1. Upload an Image</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-hero-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-hero-primary file:text-white hover:file:bg-hero-primary-hover"/>
                    </div>
                    {previewUrl && (
                        <div className="flex justify-center p-2 bg-hero-bg rounded">
                            <img src={previewUrl} alt="Upload preview" className="max-h-48 rounded-lg" />
                        </div>
                    )}
                    <div>
                        <label className="block font-semibold mb-2">2. Ask a Question</label>
                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., What is happening in this image? or Is there a dog in this photo?" className="w-full bg-hero-bg p-3 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none" rows={3} disabled={isLoading}/>
                    </div>
                    <div className="text-right">
                        <Button onClick={handleSubmit} disabled={isLoading || !imageFile || !prompt}>
                            {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </Button>
                    </div>
                </div>
                <div className="bg-hero-bg p-4 rounded-lg min-h-[200px]">
                    <h3 className="text-xl font-bold mb-4 text-hero-accent">Analysis Result</h3>
                    {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                    {error && <p className="text-red-400">{error}</p>}
                    {result && <p className="text-hero-text-primary whitespace-pre-wrap">{result}</p>}
                    {!isLoading && !result && !error && <p className="text-hero-text-secondary">Your analysis will appear here.</p>}
                </div>
            </Card>
        </div>
    );
};

export default ContentAnalysis;
