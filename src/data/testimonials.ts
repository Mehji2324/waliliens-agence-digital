import type { Testimonial, TelemetryMetric } from '../types';

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: 'Waliliens delivered a web experience that set our brand apart in a crowded market. The attention to motion detail and performance was second to none.',
    author: 'Elena Rostova',
    role: 'VP of Product',
    company: 'Chronos Labs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    impact: '3.4x Engagement Lift',
    highlight: 'World-class motion design combined with disciplined engineering.'
  },
  {
    id: '2',
    quote: 'The 3D interactive showroom they built increased our average session duration significantly. Our customers constantly praise how smooth and tactile the interface feels.',
    author: 'Marcus Vance',
    role: 'Managing Director',
    company: 'Aether Maison',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    impact: '+240% Session Duration',
    highlight: 'Photorealistic WebGL fidelity without compromising mobile load times.'
  },
  {
    id: '3',
    quote: 'They turned our complex analytics feeds into an interface that is both beautiful and lightning-fast. The development velocity and communication were outstanding.',
    author: 'Siddharth Nair',
    role: 'Head of Quantitative Products',
    company: 'Vortex Capital',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    impact: 'Sub-Second Load Time',
    highlight: 'Zero latency, exceptional visual clarity and type-safe architecture.'
  }
];

export const TELEMETRY_METRICS: TelemetryMetric[] = [
  { id: '1', label: 'Custom Codebase', value: '100% Bespoke', change: 'Zero Generic Templates', status: 'optimal' },
  { id: '2', label: 'Frame Rate Target', value: '60.0 FPS', change: 'Hardware Accelerated', status: 'live' },
  { id: '3', label: 'Average Page Speed', value: '< 0.8s', change: 'Edge Optimized', status: 'scaling' },
  { id: '4', label: 'Team Structure', value: 'Senior Only', change: 'Direct Partner Access', status: 'optimal' }
];

export const STORY_STEPS = [
  {
    phase: '01',
    title: 'Discovery & Strategic Alignment',
    subtitle: 'Defining the core product value and user journeys',
    description: 'We dive deep into your business objectives, target audience, and competitive landscape to establish clear technical milestones and a distinctive creative direction.',
    stats: 'Comprehensive technical roadmap & visual moodboards',
    tag: 'STRATEGY'
  },
  {
    phase: '02',
    title: 'Interactive Design & Motion Prototyping',
    subtitle: 'Crafting spatial layouts and tangible interaction physics',
    description: 'We design high-fidelity interfaces in Figma and prototype key motion behaviors in code to validate ergonomics, micro-interactions, and visual rhythm before production.',
    stats: 'Figma design tokens & working motion sandboxes',
    tag: 'DESIGN'
  },
  {
    phase: '03',
    title: 'High-Performance Engineering',
    subtitle: 'Building resilient, type-safe web architecture',
    description: 'We engineer your digital product using modern React, TypeScript, and Tailwind CSS with strict attention to sub-second load times, SEO best practices, and responsive accessibility.',
    stats: '100% Lighthouse target & cross-device compatibility',
    tag: 'ENGINEERING'
  },
  {
    phase: '04',
    title: 'Launch, Telemetry & Growth',
    subtitle: 'Deploying to the global edge with ongoing support',
    description: 'We manage smooth production deployments, configure real-time analytics telemetry, and provide documentation and ongoing support to scale your digital presence.',
    stats: 'Global CDN deployment & performance monitoring',
    tag: 'SCALE'
  }
];
