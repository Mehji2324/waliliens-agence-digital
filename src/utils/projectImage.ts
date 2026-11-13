import type { Project } from '../types';

const LOCAL_PROJECT_IMAGES: Record<string, string> = {
  'chronos-ai': '/images/project-chronos.webp',
  'aether-spatial': '/images/project-aether.webp',
  'vortex-protocol': '/images/project-vortex.webp',
  'hyperion-fleet': '/images/project-hyperion.webp',
  'bilal-bellil-topics': '/images/project-bilal.jpeg',
};

export const getProjectImage = (project: Project): string =>
  LOCAL_PROJECT_IMAGES[project.id] ?? project.image;
