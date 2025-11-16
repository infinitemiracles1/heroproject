
import React from 'react';

export type Tab = 'converse' | 'fitness' | 'create' | 'analyze';

interface NavItem {
  id: Tab;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'converse', label: 'Converse' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'create', label: 'Create' },
  { id: 'analyze', label: 'Analyze' },
];

interface NavigationProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="flex space-x-2 sm:space-x-4 border-b-2 border-hero-border pb-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`px-3 py-2 font-medium text-sm sm:text-base rounded-md transition-colors duration-200
            ${
              activeTab === item.id
                ? 'bg-hero-primary text-white'
                : 'text-hero-text-secondary hover:bg-hero-border hover:text-hero-text-primary'
            }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
