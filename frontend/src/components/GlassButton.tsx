import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'filled' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: React.ReactNode;
}

export function GlassButton({
  variant = 'filled',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: GlassButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variantStyles = {
    filled: 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 shadow-lg hover:shadow-xl dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900',
    ghost: 'glass hover:glass-strong text-foreground',
    icon: 'glass hover:glass-strong text-foreground aspect-square',
  };

  const sizeStyles = {
    sm: variant === 'icon' ? 'h-8 w-8' : 'h-8 px-3 text-sm',
    md: variant === 'icon' ? 'h-11 w-11' : 'h-11 px-6',
    lg: variant === 'icon' ? 'h-14 w-14' : 'h-14 px-8',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
