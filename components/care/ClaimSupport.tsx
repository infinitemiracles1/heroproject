import React from 'react';
import Card from '../common/Card';

const ChecklistItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center space-x-3">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-hero-primary focus:ring-hero-primary" />
        <label className="text-hero-text-secondary">{children}</label>
    </li>
);

const ClaimSupport: React.FC = () => {
    return (
        <div className="space-y-6 mt-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-hero-accent">Disability Claim Support</h2>
                <p className="text-hero-text-secondary mt-1 max-w-2xl mx-auto">
                    Organizational tools to help you prepare and manage your disability claim. This is an organizational tool, not legal or medical advice.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-bold mb-4 text-hero-primary">Common Claim Checklist</h3>
                    <p className="text-sm text-hero-text-secondary mb-4">Keep track of essential documents as you gather them.</p>
                    <ul className="space-y-3">
                        <ChecklistItem>DD214 (Certificate of Release or Discharge)</ChecklistItem>
                        <ChecklistItem>Service Treatment Records (STRs)</ChecklistItem>
                        <ChecklistItem>Private Medical Records (related to claim)</ChecklistItem>
                        <ChecklistItem>Buddy Letters / Lay Statements</ChecklistItem>
                        <ChecklistItem>Nexus Letter (from a medical professional)</ChecklistItem>
                        <ChecklistItem>Personal Statement in Support of Claim</ChecklistItem>
                    </ul>
                </Card>
                <Card>
                    <h3 className="text-lg font-bold mb-4 text-hero-primary">Appointment Reminders</h3>
                     <p className="text-sm text-hero-text-secondary mb-4">Keep track of important dates for C&P exams, VHA appointments, and deadlines.</p>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-hero-text-primary">Appointment</label>
                            <input type="text" placeholder="e.g., C&P Exam for Back" className="mt-1 w-full bg-hero-bg p-2 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-hero-text-primary">Date & Time</label>
                            <input type="datetime-local" className="mt-1 w-full bg-hero-bg p-2 rounded-md border border-hero-border focus:ring-2 focus:ring-hero-primary focus:outline-none"/>
                        </div>
                        <div className="text-right">
                             <button className="px-3 py-1 text-sm rounded-md font-semibold bg-hero-border text-hero-text-primary cursor-not-allowed opacity-50">
                                Add Reminder (Coming Soon)
                            </button>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default ClaimSupport;
