import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'neutral';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  className = '',
  icon,
}) => {
  const variantStyles = {
    cyan: 'border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan',
    violet: 'border-cyber-violet/30 bg-cyber-violet/10 text-cyber-violet',
    emerald: 'border-cyber-emerald/30 bg-cyber-emerald/10 text-cyber-emerald',
    rose: 'border-cyber-rose/30 bg-cyber-rose/10 text-cyber-rose',
    amber: 'border-cyber-amber/30 bg-cyber-amber/10 text-cyber-amber',
    neutral: 'border-white/10 bg-white/5 text-neutral-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-medium tracking-wider uppercase ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
