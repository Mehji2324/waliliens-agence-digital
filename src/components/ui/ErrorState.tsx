import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Content',
  description = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-obsidian-900/60 p-12 text-center backdrop-blur-xl ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyber-rose/30 bg-cyber-rose/10 text-cyber-rose">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="mt-5 font-display text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-neutral-400">{description}</p>
      {onRetry && (
        <div className="mt-6">
          <MagneticButton onClick={onRetry} variant="secondary" className="py-2.5 px-6 text-xs">
            <RefreshCw className="h-3.5 w-3.5 text-cyber-cyan" />
            <span>RETRY REQUEST</span>
          </MagneticButton>
        </div>
      )}
    </div>
  );
};
