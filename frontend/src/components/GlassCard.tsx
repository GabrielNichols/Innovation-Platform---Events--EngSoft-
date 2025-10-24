import React from 'react';

export type CardElevation = 'flat' | 'low' | 'medium' | 'high';

interface GlassCardProps {
  elevation?: CardElevation;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ elevation = 'low', children, className = '', onClick }: GlassCardProps) {
  const elevationStyles = {
    flat: 'glass-subtle',
    low: 'glass',
    medium: 'glass shadow-lg',
    high: 'glass-strong shadow-xl',
  };

  const interactiveStyles = onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform' : '';

  return (
    <div
      className={`${elevationStyles[elevation]} rounded-[var(--radius-lg)] p-6 ${interactiveStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
