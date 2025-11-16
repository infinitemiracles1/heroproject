
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-hero-bg p-4 rounded-lg border border-hero-border ${className}`}>
      {children}
    </div>
  );
};

export default Card;
