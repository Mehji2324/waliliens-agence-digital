import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading content...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-16 text-center ${className}`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-cyber-cyan" />
      <span className="mt-4 font-mono text-xs text-neutral-400 uppercase tracking-widest">
        {message}
      </span>
    </div>
  );
};
