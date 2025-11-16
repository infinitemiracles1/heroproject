
import React, { useState } from 'react';
import Button from './common/Button';
import CreateTools from './connect/CreateTools';
import PublishingTool from './connect/PublishingTool';
import FamilyHub from './connect/FamilyHub';
import VideoCourses from './connect/VideoCourses';

type ConnectView = 'create' | 'publish' | 'courses' | 'family';

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

const HeroConnectTab: React.FC = () => {
    const [view, setView] = useState<ConnectView>('create');

    const renderView = () => {
        switch (view) {
            case 'publish':
                return <PublishingTool />;
            case 'family':
                return <FamilyHub />;
            case 'courses':
                return <VideoCourses />;
            case 'create':
            default:
                return <CreateTools />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-hero-accent">HERO CONNECT™</h2>
                <p className="text-hero-text-secondary mt-2 max-w-2xl mx-auto">
                    The Purpose & Family Hub. Use these tools for storytelling, family support, and lifelong learning.
                </p>
            </div>

            <div className="flex justify-center flex-wrap gap-2 p-2 bg-hero-bg rounded-full">
                <SubNavButton label="Creative Tools" isActive={view === 'create'} onClick={() => setView('create')} />
                <SubNavButton label="Pathway to Publishing" isActive={view === 'publish'} onClick={() => setView('publish')} />
                <SubNavButton label="Family Hub" isActive={view === 'family'} onClick={() => setView('family')} />
                <SubNavButton label="Video Courses" isActive={view === 'courses'} onClick={() => setView('courses')} />
            </div>

            <div>
                {renderView()}
            </div>
        </div>
    );
};

export default HeroConnectTab;
