import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="block font-mono text-xs font-medium uppercase tracking-wider text-neutral-400"
        >
          {label} {required && <span className="text-cyber-rose">*</span>}
        </label>
        {hint && (
          <span className="font-mono text-[10px] text-neutral-500">{hint}</span>
        )}
      </div>

      {children}

      {error && (
        <p className="font-mono text-xs text-cyber-rose animate-fadeIn" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
