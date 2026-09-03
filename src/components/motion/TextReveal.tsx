import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  type?: 'words' | 'chars' | 'lines';
  gradient?: boolean;
}

export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className = '',
  delay = 0,
  type = 'words',
  gradient = false,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={`${className} ${gradient ? 'gradient-text-hero' : ''}`}>{text}</span>;
  }

  if (type === 'words') {
    const words = text.split(' ');

    const container: Variants = {
      hidden: { opacity: 0 },
      visible: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: delay * i },
      }),
    };

    const child: Variants = {
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          type: 'spring' as const,
          damping: 24,
          stiffness: 140,
        },
      },
      hidden: {
        opacity: 0,
        y: 28,
        filter: 'blur(8px)',
        transition: {
          type: 'spring' as const,
          damping: 24,
          stiffness: 140,
        },
      },
    };

    return (
      <motion.span
        className={`inline-flex flex-wrap gap-x-[0.28em] ${className}`}
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {words.map((word, index) => (
          <span key={index} className="inline-block overflow-hidden pb-1">
            <motion.span
              variants={child}
              className={`inline-block ${gradient ? 'gradient-text-hero' : ''}`}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    );
  }

  // Character reveal
  const characters = Array.from(text);
  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: delay },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 18,
      filter: 'blur(6px)',
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={child}
          className={`inline-block ${char === ' ' ? 'w-[0.25em]' : ''} ${
            gradient ? 'gradient-text-hero' : ''
          }`}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
