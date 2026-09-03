import React from 'react';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', error, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full rounded-xl border bg-obsidian-950/80 p-3.5 text-sm text-white placeholder-neutral-600 transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-cyber-rose/60 focus:border-cyber-rose focus:ring-cyber-rose'
            : 'border-white/10 focus:border-cyber-cyan focus:ring-cyber-cyan'
        } ${className}`}
        {...props}
      />
    );
  }
);

TextArea.displayName = 'TextArea';
