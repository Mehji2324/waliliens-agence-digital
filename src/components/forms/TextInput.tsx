import React from 'react';

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border bg-obsidian-950/80 px-4 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-cyber-rose/60 focus:border-cyber-rose focus:ring-cyber-rose'
            : 'border-white/10 focus:border-cyber-cyan focus:ring-cyber-cyan'
        } ${className}`}
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
