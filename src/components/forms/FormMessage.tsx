import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FormMessageProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({
  type,
  title,
  message,
  className = '',
}) => {
  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-5 ${
        isSuccess
          ? 'border-cyber-emerald/40 bg-cyber-emerald/10 text-neutral-200'
          : 'border-cyber-rose/40 bg-cyber-rose/10 text-neutral-200'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyber-emerald" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyber-rose" />
        )}
        <div>
          <h4 className="font-display text-sm font-bold text-white">{title}</h4>
          <p className="mt-1 text-xs text-neutral-300">{message}</p>
        </div>
      </div>
    </div>
  );
};
