
import React from 'react';
import Card from '../common/Card';

const VideoCourses: React.FC = () => {
    return (
        <div className="space-y-6 mt-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-hero-accent">Video Courses</h2>
                <p className="text-hero-text-secondary mt-1 max-w-2xl mx-auto">
                    Engage with video-based learning on topics from resilience to leadership. (Feature in Development)
                </p>
            </div>
            <Card>
                <h3 className="text-lg font-bold text-hero-primary">Course Library</h3>
                <div className="mt-4 p-8 text-center border-2 border-dashed border-hero-border rounded-lg">
                    <p className="text-hero-text-secondary">
                        Our full library of interactive video courses will be available here soon.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default VideoCourses;
