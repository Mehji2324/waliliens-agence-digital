import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { TiltCard } from '../../components/motion/TiltCard';
import { ProjectModal } from '../../components/ui/ProjectModal';
import type { Project } from '../../types';
import { useSeo } from '../../hooks/useSeo';
import { ArrowUpRight, Award } from 'lucide-react';
import { MagneticButton } from '../../components/motion/MagneticButton';
import { soundManager } from '../../utils/sound';
import { getProjectImage } from '../../utils/projectImage';
import { useCursor } from '../../context/CursorContext';
import { useProjects } from '../../hooks/useCatalogData';

export const WorkPage: React.FC = () => {
  useSeo({
    title: 'Selected Work & Case Studies',
    description: 'Explore featured client deployments and technical concept showcases engineered by Waliliens.',
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { items: projects, isLoading, error } = useProjects();
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
    <div className="bg-obsidian-950">
      <PageHeader
        badge="SHOWCASE CATALOG"
        title="SELECTED WORK &"
        titleGradient="CASE STUDIES."
        description="A curated index of production deployments and technical showcases setting benchmarks in motion quality, conversion, and performance."
      />

      <Section id="work-grid">
        {isLoading && <p className="mb-8 text-sm text-neutral-400" role="status">Loading projects…</p>}
        {error && <p className="mb-8 text-sm text-rose-300" role="alert">{error}</p>}
        {!isLoading && !error && projects.length === 0 && (
          <p className="mb-8 text-sm text-neutral-400">No projects are currently published.</p>
        )}

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
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

        {/* Project Cards Grid */}
        <m.div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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

                      <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-obsidian-950 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-cyber-cyan">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>

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

        {/* Bottom Kickoff Banner */}
        <div className="mt-20 rounded-3xl border border-white/10 bg-obsidian-900/60 p-8 sm:p-12 text-center backdrop-blur-xl">
          <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Have a project in mind?
          </h3>
          <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
            Let's discuss how our motion and engineering capabilities can elevate your brand's digital presence.
          </p>
          <div className="mt-6">
            <MagneticButton href="/contact" variant="primary" className="py-3.5 px-8 text-sm font-bold">
              <span>START A PROJECT BRIEF</span>
              <ArrowUpRight className="h-4 w-4" />
            </MagneticButton>
          </div>
        </div>
      </Section>

      {/* Case Study Deep Dive Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};
