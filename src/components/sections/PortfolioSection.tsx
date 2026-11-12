import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import type { Project } from '../../types';
import { TiltCard } from '../motion/TiltCard';
import { ProjectModal } from '../ui/ProjectModal';
import { Sparkles, ArrowUpRight, Award } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { soundManager } from '../../utils/sound';
import { getProjectImage } from '../../utils/projectImage';
import { useProjects } from '../../hooks/useCatalogData';

export const PortfolioSection: React.FC = () => {
  const { items: projects, isLoading, error } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { setCursorType, resetCursor } = useCursor();

  const categories = [
    'ALL',
    'Web & Digital Products',
    'Interactive 3D & Motion',
    'AI & Smart Interfaces',
    'Brand Systems',
  ];

  const filteredProjects =
    selectedCategory === 'ALL'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="portfolio" className="relative overflow-x-clip bg-obsidian-950 px-6 py-24 sm:px-12 lg:px-24">
      {/* Background Ambient Aura */}
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-cyber-violet/15 blur-[140px]" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-cyan uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Selected Work</span>
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Featured <span className="gradient-text-hero">Case Studies</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-neutral-400">
            A curated index of production deployments and concept showcases setting benchmarks in motion and performance.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(cat);
              }}
              onMouseEnter={() => setCursorType('hover')}
              onMouseLeave={resetCursor}
              className={`rounded-full px-4 py-1.5 font-mono text-xs font-medium tracking-wider transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyber-cyan ${
                selectedCategory === cat
                  ? 'bg-white text-obsidian-950 font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                  : 'border border-white/10 bg-obsidian-900/60 text-neutral-400 hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading && <p className="mt-10 text-sm text-neutral-400" role="status">Loading selected work…</p>}
        {error && <p className="mt-10 text-sm text-rose-300" role="alert">{error}</p>}
        {!isLoading && !error && projects.length === 0 && (
          <p className="mt-10 text-sm text-neutral-400">No projects are currently published.</p>
        )}

        {/* Projects Grid */}
        <m.div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <m.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
              >
                <TiltCard
                  maxTilt={4}
                  cursorLabel="VIEW"
                  onClick={() => setSelectedProject(project)}
                  className="cursor-pointer p-0"
                >
                  <div className="group relative overflow-hidden rounded-2xl">
                    {/* Media Thumbnail */}
                    <div className="relative h-72 w-full overflow-hidden bg-obsidian-950 sm:h-80">
                      <img
                        src={getProjectImage(project)}
                        alt={project.title}
                        width={1000}
                        height={650}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />

                      {/* Badges */}
                      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                        <span className="rounded-full bg-obsidian-950/80 px-3 py-1 font-mono text-xs text-cyber-cyan backdrop-blur-md border border-white/10">
                          {project.badge || project.category}
                        </span>

                        {project.award && (
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 font-mono text-xs text-amber-300 backdrop-blur-md border border-amber-500/30">
                            <Award className="h-3 w-3" />
                            <span>{project.award.split('—')[0]}</span>
                          </span>
                        )}
                      </div>

                      {/* Action Icon */}
                      <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-obsidian-950 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-cyber-cyan">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Information Strip */}
                    <div className="p-6 sm:p-7">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span>CLIENT: {project.client.toUpperCase()}</span>
                        <span>{project.year}</span>
                      </div>

                      <h3 className="mt-2 font-display text-2xl font-bold text-white transition-colors group-hover:text-cyber-cyan sm:text-3xl">
                        {project.title}
                      </h3>

                      <p className="mt-2 text-sm text-neutral-300 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Key Impact Metrics */}
                      <div className="mt-5 flex flex-wrap gap-4 border-t border-white/10 pt-4">
                        {project.impactMetrics.map((metric, i) => (
                          <div key={i} className="flex items-baseline gap-1.5">
                            <span className="font-display font-bold text-white">
                              {metric.metric}
                            </span>
                            <span className="font-mono text-[11px] text-neutral-400">
                              {metric.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>
      </div>

      {/* Case Study Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
};
