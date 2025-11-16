
import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import Spinner from './Spinner';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkKey = useCallback(async () => {
    setIsLoading(true);
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const keyStatus = await window.aistudio.hasSelectedApiKey();
        setHasKey(keyStatus);
        if (keyStatus) {
            onKeySelected();
        }
      } else {
        // Fallback for environments where aistudio is not available
        setHasKey(true); 
        onKeySelected();
      }
    } catch (error) {
      console.error("Error checking for API key:", error);
      setHasKey(false); // Assume no key on error
    } finally {
      setIsLoading(false);
    }
  }, [onKeySelected]);

  useEffect(() => {
    checkKey();
  }, [checkKey]);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Assume success and optimistically update UI
        setHasKey(true);
        onKeySelected();
      }
    } catch (error) {
      console.error("Error opening API key selection:", error);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-6"><Spinner text="Verifying setup..." /></div>;
  }

  if (hasKey) {
    return null; // Key is selected, render nothing
  }

  return (
    <div className="bg-blue-900/50 border border-hero-primary p-6 rounded-lg text-center">
      <h3 className="text-xl font-bold mb-2 text-hero-accent">Veo Video Generation</h3>
      <p className="text-hero-text-secondary mb-4">
        This feature requires an API key with access to Veo. Please select a key to proceed.
        Video generation may incur costs.
      </p>
       <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-sm text-hero-primary hover:underline mb-4 block">
        Learn more about billing
      </a>
      <Button onClick={handleSelectKey}>Select API Key</Button>
    </div>
  );
};

export default ApiKeySelector;
