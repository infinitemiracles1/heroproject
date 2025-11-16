
import React, { useState } from 'react';
import Header from './components/Header';
import ConverseTab from './components/ConverseTab';
import FitnessTab from './components/FitnessTab';
import HeroConnectTab from './components/HeroConnectTab';
import HeroCareTab from './components/HeroCareTab';
import Card from './components/common/Card';
import Button from './components/common/Button';

type Page = 'dashboard' | 'fitness' | 'connect' | 'care';

// Widget component defined locally for dashboard navigation
interface WidgetProps {
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Widget: React.FC<WidgetProps> = ({ title, children, onClick, className }) => {
  const isClickable = !!onClick;

  const cardContent = (
    <Card className={`flex flex-col text-left md:aspect-square ${isClickable ? 'hover:bg-hero-surface hover:border-hero-accent transition-colors duration-200 cursor-pointer' : ''} ${className}`}>
        <h3 className="text-xl font-bold text-hero-primary mb-2">{title}</h3>
        <p className="text-hero-text-secondary">{children}</p>
    </Card>
  );
  
  if (isClickable && onClick) {
    return (
        <button onClick={onClick} className="w-full h-full p-0 bg-transparent border-none text-left">
            {cardContent}
        </button>
    );
  }
  
  return cardContent;
};


const App: React.FC = () => {
  const [page, setPage] = useState<Page>('dashboard');

  const renderPageContent = () => {
    switch (page) {
      case 'fitness':
        return <FitnessTab />;
      case 'connect':
        return <HeroConnectTab />;
      case 'care':
        return <HeroCareTab />;
      case 'dashboard':
      default:
        return (
          <>
            <Card className="mb-6 bg-hero-surface p-4 sm:p-6">
               <ConverseTab />
            </Card>

            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-hero-accent tracking-wider">HERO VETS™</h2>
                 <p className="mt-2 text-hero-text-secondary">
                  An ecosystem of tools for healing, wellness, and purpose-driven reintegration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Widget title="HERO CHECK™">
                  Crisis identification & real-time suicide risk triage. Provides immediate, calming support. For immediate help, contact the Veterans Crisis Line: <strong>Call or text 988, then press 1.</strong>
                </Widget>
                <Widget title="HERO CARE™" onClick={() => setPage('care')}>
                  Healing, wellness & life admin. Access the Meditation Library, content analysis tools, and claims support resources.
                </Widget>
                <Widget title="HERO CARE FIT™" onClick={() => setPage('fitness')}>
                  Trauma-informed fitness & somatic recovery. Get adaptive movement plans that honor your body's readiness.
                </Widget>
                <Widget title="HERO CONNECT™" onClick={() => setPage('connect')}>
                  Purpose, family & storytelling. Explore the Pathway to Publishing, Family Hub, and creative tools.
                </Widget>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-hero-bg text-hero-text-primary font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {page !== 'dashboard' && (
            <div className="mb-4">
              <Button variant="secondary" onClick={() => setPage('dashboard')}>
                &larr; Back to Dashboard
              </Button>
            </div>
          )}
          <div className={`${page !== 'dashboard' ? 'bg-hero-surface rounded-lg shadow-xl p-4 sm:p-6 min-h-[60vh]' : ''}`}>
             {renderPageContent()}
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-hero-text-secondary text-sm">
        <p>THE HERO PROJECT™ — From Crisis to Contribution™</p>
      </footer>
    </div>
  );
};

export default App;
