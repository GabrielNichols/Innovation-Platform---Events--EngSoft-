import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function GlassInput({ label, error, helperText, className = '', ...props }: GlassInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-foreground/80">
          {label}
        </label>
      )}
      <input
        className={`w-full h-11 px-4 glass rounded-[var(--radius-md)] transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground ${
          error ? 'border-red-500 focus:ring-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <small>{error}</small>
        </div>
      )}
      {helperText && !error && (
        <small className="block mt-1 text-muted-foreground">{helperText}</small>
      )}
    </div>
  );
}

interface GlassTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function GlassTextArea({ label, error, helperText, className = '', ...props }: GlassTextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-foreground/80">
          {label}
        </label>
      )}
      <textarea
        className={`w-full min-h-[100px] p-4 glass rounded-[var(--radius-md)] transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground resize-vertical ${
          error ? 'border-red-500 focus:ring-red-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <small>{error}</small>
        </div>
      )}
      {helperText && !error && (
        <small className="block mt-1 text-muted-foreground">{helperText}</small>
      )}
    </div>
  );
}
