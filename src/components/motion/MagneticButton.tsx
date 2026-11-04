import React, { useRef } from 'react';
import { m, useSpring } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';
import { soundManager } from '../../utils/sound';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
  href?: string;
  as?: 'button' | 'a';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  strength = 0.35,
  variant = 'primary',
  href,
  as = href ? 'a' : 'button',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { setCursorType, resetCursor } = useCursor();
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { damping: 15, stiffness: 180, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const textX = useSpring(0, springConfig);
  const textY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(middleY * strength);

    textX.set(middleX * (strength * 1.35));
    textY.set(middleY * (strength * 1.35));
  };

  const handleMouseEnter = () => {
    setCursorType('hover');
    soundManager.playHover();
  };

  const handleMouseLeave = () => {
    resetCursor();
    x.set(0);
    y.set(0);
    textX.set(0);
    textY.set(0);
  };

  const handleClick = () => {
    soundManager.playClick();
    if (onClick) onClick();
  };

  const variantStyles = {
    primary:
      'relative bg-gradient-to-r from-cyber-cyan via-cyber-violet to-cyber-purple text-obsidian-950 font-semibold shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] border border-white/30',
    secondary:
      'glass-panel text-white border-white/20 hover:border-cyber-cyan/50 hover:bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]',
    ghost:
      'bg-transparent text-neutral-300 hover:text-white border border-transparent hover:border-white/10',
    glow:
      'bg-obsidian-900 text-cyber-cyan border border-cyber-cyan/40 hover:border-cyber-cyan hover:bg-cyber-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.2)]',
  };

  const Component = as === 'a' ? m.a : m.button;

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Component
        href={href}
        onClick={handleClick}
        style={prefersReducedMotion ? {} : { x, y }}
        whileTap={{ scale: 0.96 }}
        className={`group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3.5 text-sm font-sans tracking-wide transition-all duration-300 ${variantStyles[variant]} ${className}`}
      >
        {/* Subtle dynamic sheen background layer */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

        {/* Floating text with higher parallax spring depth */}
        <m.span
          style={prefersReducedMotion ? {} : { x: textX, y: textY }}
          className="relative z-10 flex items-center gap-2"
        >
          {children}
        </m.span>
      </Component>
    </div>
  );
};
