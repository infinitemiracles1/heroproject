
import React, { useState, useEffect } from 'react';
import { generateImage, editImage, generateVideoFromPrompt, generateVideoFromImage, checkVideoOperation } from '../../services/geminiService';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import Card from '../common/Card';
import { fileToBase64 } from '../../utils/helpers';
import { AspectRatio, VeoOperation } from '../../types';
import ApiKeySelector from '../common/ApiKeySelector';

type CreateMode = 'image-gen' | 'image-edit' | 'video-gen';

const CreateTools: React.FC = () => {
    const [mode, setMode] = useState<CreateMode>('image-gen');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<string | null>(null);
    const [error, setError] = useState('');

    const [isVideoProcessing, setIsVideoProcessing] = useState(false);
    const [videoOperation, setVideoOperation] = useState<VeoOperation | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    useEffect(() => {
        // Reset state when mode changes
        setPrompt('');
        setImageFile(null);
        setPreviewUrl(null);
        setOutput(null);
        setError('');
        setIsLoading(false);
        setIsVideoProcessing(false);
        setVideoOperation(null);
    }, [mode]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');
        setOutput(null);

        try {
            if (mode === 'image-gen') {
                const result = await generateImage(prompt, aspectRatio);
                setOutput(result);
            } else if (mode === 'image-edit' && imageFile) {
                const base64 = await fileToBase64(imageFile);
                const result = await editImage(prompt, base64, imageFile.type);
                setOutput(result);
            } else if (mode === 'video-gen') {
                setIsVideoProcessing(true);
                let op;
                if(imageFile) {
                    const base64 = await fileToBase64(imageFile);
                    op = await generateVideoFromImage(prompt, base64, imageFile.type, videoAspectRatio);
                } else {
                    op = await generateVideoFromPrompt(prompt, videoAspectRatio);
                }
                setVideoOperation(op);
            }
        } catch (err) {
            console.error(err);
            setError(`Failed to generate content. Please try again. Error: ${err.message}`);
            setIsVideoProcessing(false);
        } finally {
             if (mode !== 'video-gen') {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!isVideoProcessing || !videoOperation) return;

        const interval = setInterval(async () => {
            try {
                const updatedOp = await checkVideoOperation(videoOperation);
                setVideoOperation(updatedOp);

                if (updatedOp.done) {
                    clearInterval(interval);
                    setIsVideoProcessing(false);
                    setIsLoading(false);
                    if (updatedOp.error) {
                         setError(`Video generation failed: ${updatedOp.error.message}`);
                    } else if (updatedOp.response?.generatedVideos?.[0]?.video?.uri) {
                        const videoUrl = `${updatedOp.response.generatedVideos[0].video.uri}&key=${process.env.API_KEY}`;
                        setOutput(videoUrl);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to check video status.');
                setIsVideoProcessing(false);
                setIsLoading(false);
                clearInterval(interval);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isVideoProcessing, videoOperation]);

    const isVeoMode = mode === 'video-gen';
    const canSubmit = isVeoMode ? (apiKeySelected && (prompt.trim() || imageFile)) : prompt.trim();


    const renderForm = () => {
        return (
            <div className="space-y-4">
                 {isVeoMode && !apiKeySelected && <ApiKeySelector onKeySelected={() => setApiKeySelected(true)} />}

                {(mode === 'image-edit' || (mode === 'video-gen' && imageFile)) && previewUrl && (
                    <div className="flex justify-center"><img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg" /></div>
                )}
                {(mode === 'image-edit' || (mode === 'video-gen')) && (
                    <div>
                        <label className="block font-semibold mb-2">{mode === 'image-edit' ? 'Upload Image to Edit' : 'Upload Start Image (Optional)'}</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-hero-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-hero-primary file:text-white hover:file:bg-hero-primary-hover"/>
                    </div>
                )}
                <div>
                    <label className="block font-semibold mb-2">Prompt</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={mode === 'image-edit' ? "e.g., Add a retro filter" : "e.g., A robot holding a red skateboard"} className="w-full bg-hero-bg p-3 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none" rows={3} disabled={isLoading}/>
                </div>
                {mode === 'image-gen' && (
                     <div>
                        <label className="block font-semibold mb-2">Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-hero-bg p-2 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none">
                            <option value="1:1">Square (1:1)</option>
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                            <option value="4:3">Standard (4:3)</option>
                             <option value="3:4">Tall (3:4)</option>
                        </select>
                    </div>
                )}
                 {mode === 'video-gen' && (
                     <div>
                        <label className="block font-semibold mb-2">Aspect Ratio</label>
                        <select value={videoAspectRatio} onChange={(e) => setVideoAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full bg-hero-bg p-2 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none">
                            <option value="16:9">Landscape (16:9)</option>
                            <option value="9:16">Portrait (9:16)</option>
                        </select>
                    </div>
                )}
                <div className="text-right">
                    <Button onClick={handleSubmit} disabled={isLoading || !canSubmit}>
                        {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                </div>
            </div>
        )
    };
    
    return (
        <div className="space-y-6 mt-6">
            <div className="flex justify-center mb-6">
                <div className="bg-hero-border p-1 rounded-full flex space-x-1">
                    <Button variant={mode === 'image-gen' ? 'primary' : 'secondary'} onClick={() => setMode('image-gen')} className="rounded-full">Image Gen</Button>
                    <Button variant={mode === 'image-edit' ? 'primary' : 'secondary'} onClick={() => setMode('image-edit')} className="rounded-full">Image Edit</Button>
                    <Button variant={mode === 'video-gen' ? 'primary' : 'secondary'} onClick={() => setMode('video-gen')} className="rounded-full">Video Gen</Button>
                </div>
            </div>
            
            <Card>{renderForm()}</Card>

            {isLoading && (
                 <div className="flex justify-center items-center p-8 flex-col space-y-4">
                    <Spinner text={isVideoProcessing ? "Generating video... This may take a few minutes." : "Generating..."} size="lg" />
                    {isVideoProcessing && <p className="text-sm text-hero-text-secondary">You can leave this page, the process will continue.</p>}
                </div>
            )}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {output && (
                <Card>
                    <h3 className="text-xl font-bold mb-4 text-hero-accent">Result</h3>
                    <div className="flex justify-center">
                        {mode.startsWith('image') ? (
                            <img src={output} alt="Generated result" className="max-w-full h-auto max-h-96 rounded-lg" />
                        ) : (
                            <video src={output} controls className="max-w-full h-auto max-h-96 rounded-lg" />
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CreateTools;
