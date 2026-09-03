import React from 'react';
import { Loader2 } from 'lucide-react';
import { MagneticButton } from '../motion/MagneticButton';

interface SubmitButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading = false,
  loadingText = 'PROCESSING...',
  children,
  className = '',
  disabled = false,
}) => {
  return (
    <MagneticButton
      as="button"
      variant="primary"
      className={`w-full sm:w-auto py-3.5 px-8 text-sm font-bold ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-obsidian-950" />
          <span>{loadingText}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">{children}</span>
      )}
    </MagneticButton>
  );
};
