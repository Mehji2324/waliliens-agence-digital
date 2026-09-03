import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project } from '../../types';
import { X, ExternalLink, Award, CheckCircle2, Cpu } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { useCursor } from '../../context/CursorContext';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { setCursorType, resetCursor } = useCursor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (project) {
      document.body.style.overflow = 'hidden';
      soundManager.playWhoosh(300, 700, 0.15);
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6 lg:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/15 bg-obsidian-900/95 p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-10"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            onMouseEnter={() => setCursorType('hover')}
            onMouseLeave={resetCursor}
            aria-label="Close project modal"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-obsidian-800/80 text-white transition-colors hover:border-white/30 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Content Header */}
          <div className="space-y-3 pr-12">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-cyber-cyan/10 px-3 py-1 font-mono text-xs font-semibold text-cyber-cyan">
                {project.category}
              </span>
              <span className="font-mono text-xs text-neutral-400">
                CLIENT: {project.client.toUpperCase()} // {project.year}
              </span>
              {project.award && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-400">
                  <Award className="h-3.5 w-3.5" />
                  <span>{project.award}</span>
                </div>
              )}
            </div>

            <h3 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {project.title}
            </h3>
            <p className="text-base text-neutral-300">
              {project.tagline}
            </p>
          </div>

          {/* Project Image Banner */}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10">
            <img
              src={project.image}
              alt={project.title}
              className="h-64 w-full object-cover sm:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-60" />
          </div>

          {/* Impact Metrics Banner */}
          <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-obsidian-950/60 p-5 text-center">
            {project.impactMetrics.map((metric, i) => (
              <div key={i}>
                <div className="font-display text-2xl font-black text-cyber-cyan sm:text-3xl">
                  {metric.metric}
                </div>
                <div className="mt-1 font-mono text-xs text-neutral-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Case Study Details */}
          <div className="mt-10 space-y-8">
            <div>
              <h4 className="font-display text-lg font-bold text-white">Challenge</h4>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                {project.caseStudy.challenge}
              </p>
            </div>

            <div>
              <h4 className="font-display text-lg font-bold text-white">Engineering Solution</h4>
              <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                {project.caseStudy.solution}
              </p>
            </div>

            {/* Architecture Highlights */}
            <div>
              <h4 className="font-display text-lg font-bold text-white">Architecture & Pipeline</h4>
              <div className="mt-3 space-y-2.5">
                {project.caseStudy.architectureDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyber-cyan" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h4 className="font-display text-lg font-bold text-white">Technologies Deployed</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-obsidian-800/60 px-3 py-1 font-mono text-xs text-neutral-300"
                  >
                    <Cpu className="h-3 w-3 text-cyber-violet" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Action Footer */}
          <div className="mt-10 flex flex-wrap items-center justify-between border-t border-white/10 pt-6">
            <span className="font-mono text-xs text-neutral-500">
              SYS_ID: WALILIENS-{project.id.toUpperCase()}
            </span>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={resetCursor}
              className="flex items-center gap-2 rounded-full border border-cyber-cyan/40 bg-cyber-cyan/10 px-6 py-2.5 font-mono text-xs font-semibold text-cyber-cyan transition-colors hover:bg-cyber-cyan hover:text-obsidian-950"
            >
              <span>DISMISS DOSSIER</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
