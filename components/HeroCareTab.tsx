import React, { useState } from 'react';
import Button from './common/Button';
import ContentAnalysis from './care/ContentAnalysis';
import MeditationLibrary from './care/MeditationLibrary';
import ClaimSupport from './care/ClaimSupport';

type CareView = 'analyze' | 'meditate' | 'claim';

interface SubNavButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SubNavButton: React.FC<SubNavButtonProps> = ({ label, isActive, onClick }) => (
    <Button
        variant={isActive ? 'primary' : 'secondary'}
        onClick={onClick}
        className="rounded-full text-sm"
    >
        {label}
    </Button>
);


const HeroCareTab: React.FC = () => {
    const [view, setView] = useState<CareView>('meditate');
    
    const renderView = () => {
        switch (view) {
            case 'analyze':
                return <ContentAnalysis />;
            case 'claim':
                return <ClaimSupport />;
            case 'meditate':
            default:
                return <MeditationLibrary />;
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-hero-accent">HERO CARE™</h2>
                <p className="text-hero-text-secondary mt-2 max-w-2xl mx-auto">
                   The Healing & Wellness Hub. Access tools for mindfulness, healing, and life administration.
                </p>
            </div>

            <div className="flex justify-center flex-wrap gap-2 p-2 bg-hero-bg rounded-full">
                <SubNavButton label="Meditation Library" isActive={view === 'meditate'} onClick={() => setView('meditate')} />
                <SubNavButton label="Claim Support" isActive={view === 'claim'} onClick={() => setView('claim')} />
                <SubNavButton label="Content Analysis" isActive={view === 'analyze'} onClick={() => setView('analyze')} />
            </div>

            <div>
                {renderView()}
            </div>
        </div>
    );
};

export default HeroCareTab;