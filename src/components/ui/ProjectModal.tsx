import React, { useEffect, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import type { Project } from '../../types';
import { X, ExternalLink, Award, CheckCircle2, Cpu, Play, Globe } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { useCursor } from '../../context/CursorContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { getProjectImage } from '../../utils/projectImage';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { setCursorType, resetCursor } = useCursor();
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(Boolean(project), dialogRef, onClose);

  useEffect(() => {
    if (project) {
      soundManager.playWhoosh(300, 700, 0.15);
    }

  }, [project]);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6 lg:p-10">
        {/* Backdrop */}
        <m.div
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
        <m.div
          ref={dialogRef}
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          tabIndex={-1}
          className="relative z-10 my-auto max-h-[calc(100dvh-2rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-obsidian-900/95 p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:p-10"
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

            <h3 id="project-modal-title" className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {project.title}
            </h3>
            <p className="text-base text-neutral-300">
              {project.tagline}
            </p>
          </div>

          {/* Project Image Banner */}
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10">
            <img
              src={getProjectImage(project)}
              alt={project.title}
              width={1000}
              height={650}
              loading="lazy"
              className="h-64 w-full object-cover sm:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-60" />
          </div>

          {/* Project Video */}
          {project.videoUrl && (
            <div className="mt-8">
              <h4 className="font-display text-lg font-bold text-white">Project Showcase</h4>
              <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-obsidian-950">
                <video
                  src={project.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Video showcase of ${project.title}`}
                  className="aspect-video w-full bg-obsidian-950 object-contain"
                />
              </div>
              <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                <Play className="h-3 w-3" />
                <span>PRODUCT DEMONSTRATION // CAPTURED SESSION</span>
              </p>
            </div>
          )}
          {/* Impact Metrics Banner */}
          <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-obsidian-950/60 p-4 text-center sm:grid-cols-3 sm:gap-4 sm:p-5">
            {project.impactMetrics.map((metric, i) => (
              <div key={i}>
                <div className="break-words font-display text-xl font-black text-cyber-cyan [overflow-wrap:anywhere] sm:text-3xl">
                  {metric.metric}
                </div>
                <div className="mt-1 break-words font-mono text-[11px] text-neutral-400 [overflow-wrap:anywhere] sm:text-xs">
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
            <div className="flex flex-wrap items-center gap-3">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setCursorType('hover')}
                  onMouseLeave={resetCursor}
                  onClick={() => soundManager.playClick()}
                  className="flex items-center gap-2 rounded-full border border-cyber-violet/40 bg-cyber-violet/10 px-6 py-2.5 font-mono text-xs font-semibold text-cyber-violet transition-colors hover:bg-cyber-violet hover:text-white"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>VIEW LIVE DEMO</span>
                </a>
              )}
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
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
};
