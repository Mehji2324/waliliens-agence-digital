import React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, error, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl border bg-obsidian-950/80 px-4 py-2.5 text-sm text-white transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-cyber-rose/60 focus:border-cyber-rose focus:ring-cyber-rose'
            : 'border-white/10 focus:border-cyber-cyan focus:ring-cyber-cyan'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-obsidian-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
