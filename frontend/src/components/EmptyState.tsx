import React from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <GlassCard elevation="medium" className="text-center py-12">
      <Icon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <GlassButton variant="filled" onClick={onAction}>
          {actionLabel}
        </GlassButton>
      )}
    </GlassCard>
  );
}
