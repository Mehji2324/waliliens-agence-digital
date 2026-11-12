import React from 'react';
import { m } from 'framer-motion';
import { TextReveal } from '../motion/TextReveal';
import { PageContainer } from './PageContainer';
import { Badge } from '../ui/Badge';
import { MOTION_TOKENS } from '../../utils/motion';

interface PageHeaderProps {
  badge: string;
  title: string;
  titleGradient?: string;
  description: string;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  title,
  titleGradient,
  description,
  children,
}) => {
  return (
    <div className="relative overflow-hidden bg-obsidian-950 pt-36 pb-16 border-b border-white/10">
      {/* Ambient background aura */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[350px] w-[600px] rounded-full bg-cyber-violet/15 blur-[120px]" />

      <PageContainer className="relative z-10">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={MOTION_TOKENS.medium}
        >
          <Badge variant="cyan">{badge}</Badge>
        </m.div>

        <div className="mt-5">
          <h1 className="font-display text-[clamp(2rem,8.5vw,4.5rem)] font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl [overflow-wrap:anywhere]">
            <TextReveal text={title} delay={0.1} />
            {titleGradient && (
              <>
                {' '}
                <span className="gradient-text-hero">
                  <TextReveal text={titleGradient} delay={0.25} />
                </span>
              </>
            )}
          </h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...MOTION_TOKENS.slow, delay: 0.4 }}
            className="mt-5 max-w-2xl text-base text-neutral-300 sm:text-lg lg:text-xl"
          >
            {description}
          </m.p>
        </div>

        {children && <div className="mt-8">{children}</div>}
      </PageContainer>
    </div>
  );
};
