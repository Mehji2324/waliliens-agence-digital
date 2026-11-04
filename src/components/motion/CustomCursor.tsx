import React, { useEffect, useState } from 'react';
import { m, useMotionValue, useSpring } from 'framer-motion';
import { useCursor } from '../../context/CursorContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const CustomCursor: React.FC = () => {
  const { cursorType, cursorText } = useCursor();
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Ultra-smooth spring physics for trailing cursor ring
  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (prefersReducedMotion || isTouchDevice || !isVisible) {
    return null;
  }

  // Determine dimensions and styling based on cursor state
  const isTextState = cursorType === 'text' && cursorText;
  const isHoverState = cursorType === 'hover';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden custom-cursor">
      {/* Center core pinpoint dot */}
      <m.div
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-cyber-cyan shadow-[0_0_10px_#00F0FF]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isTextState ? 0 : 1,
        }}
      />

      {/* Dynamic Trailing Spring Aura */}
      <m.div
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full border transition-colors duration-300 ${
          isTextState
            ? 'h-20 w-20 bg-cyber-violet/90 text-white backdrop-blur-md border-white/40 shadow-[0_0_30px_rgba(139,92,246,0.6)]'
            : isHoverState
            ? 'h-14 w-14 bg-white/10 backdrop-blur-sm border-cyber-cyan/60 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
            : 'h-9 w-9 bg-transparent border-white/25'
        }`}
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isTextState ? 1.1 : isHoverState ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {isTextState && (
          <m.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-mono font-bold tracking-widest uppercase text-white"
          >
            {cursorText}
          </m.span>
        )}
      </m.div>
    </div>
  );
};
