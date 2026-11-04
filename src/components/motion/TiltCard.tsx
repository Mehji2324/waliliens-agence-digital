import React, { useRef, useState } from 'react';
import { m, useSpring } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useCursor } from '../../context/CursorContext';
import { soundManager } from '../../utils/sound';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
  cursorLabel?: string;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 7,
  glowColor = 'rgba(139, 92, 246, 0.18)',
  cursorLabel,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { setCursorType, setCursorText, resetCursor } = useCursor();
  const prefersReducedMotion = useReducedMotion();

  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const springConfig = { damping: 20, stiffness: 200, mass: 0.2 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setMouseCoord({ x: xPercent, y: yPercent });

    // Calculate tilt
    const middleX = x - rect.width / 2;
    const middleY = y - rect.height / 2;

    const tiltX = -(middleY / (rect.height / 2)) * maxTilt;
    const tiltY = (middleX / (rect.width / 2)) * maxTilt;

    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };

  const handleMouseEnter = () => {
    if (cursorLabel) {
      setCursorType('text');
      setCursorText(cursorLabel);
    } else {
      setCursorType('hover');
    }
    soundManager.playHover();
  };

  const handleMouseLeave = () => {
    resetCursor();
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      style={{ perspective: 1200 }}
      className="h-full w-full"
    >
      <m.div
        ref={cardRef}
        onClick={onClick}
        onKeyDown={(event) => {
          if (onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onClick();
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-haspopup={onClick ? 'dialog' : undefined}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={
          prefersReducedMotion
            ? {}
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }
        }
        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-obsidian-900/80 p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] ${className}`}
      >
        {/* Dynamic Spotlight Radial Glare Layer */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(500px circle at ${mouseCoord.x}% ${mouseCoord.y}%, ${glowColor}, transparent 45%)`,
          }}
        />

        {/* Card Content with 3D Depth */}
        <div className="relative z-10 h-full w-full transform-gpu">
          {children}
        </div>
      </m.div>
    </div>
  );
};
