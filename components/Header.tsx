
import React from 'react';

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-hero-surface shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <StarIcon className="w-8 h-8 text-hero-gold" />
          <h1 className="text-3xl font-bold text-hero-text-primary">The HERO Project™</h1>
        </div>
        <p className="mt-2 text-md text-hero-text-secondary italic">
          "The bravest thing you can do is ask for help when you need it. The strongest thing you can do is offer it when you can."
        </p>
      </div>
    </header>
  );
};

export default Header;
