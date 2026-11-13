import type { Project } from '../types';

export const PROJECTS: Project[] = [
  {
    id: 'bilal-bellil-topics',
    title: 'Bilal Bellil Topics',
    client: 'Serrada Community',
    category: 'Web & Digital Products',
    year: '2026',
    badge: 'Client Work',
    tagline: 'Moroccan Darija podcast platform — from story to live conversation',
    description: 'An interactive Darija-language platform where the community chooses weekly topics, registers to speak, and becomes the voice of the next episode. Features a weekly program grid, audience registration for live segments like "The Clinic of Love" and "The Court", and open mic topic submission.',
    impactMetrics: [
      { metric: 'RTL', label: 'Arabic-First UX' },
      { metric: '5', label: 'Weekly Live Segments' },
      { metric: '100%', label: 'Community-Driven' }
    ],
    technologies: ['Next.js', 'React', 'TypeScript', 'Vercel', 'RTL Layout'],
    image: '/images/project-bilal.jpeg',
    accentColor: '#10B981',
    featured: true,
    award: 'Designed & built for Serrada For Life community',
    videoUrl: '/videos/power-of-a-conversation.mp4',
    demoUrl: 'https://demo-sit-web-bilal-blil.vercel.app/',
    caseStudy: {
      overview: 'Bilal Bellil needed a home for his Darija podcast — a place where listeners become participants, choosing topics and joining live segments instead of just tuning in.',
      challenge: 'Building an Arabic RTL experience that feels natural and modern, while making community participation (topic submission, episode registration, weekly scheduling) effortless for non-technical users.',
      solution: 'Designed an RTL-first Next.js interface with a weekly program grid, topic submission flow, and live segment registration cards, deployed on Vercel with instant global delivery.',
      architectureDetails: [
        'RTL-native layout with Darija-first copywriting and visual hierarchy',
        'Weekly program grid with five themed live segments (Mon–Fri)',
        'Open topic submission with registration state and deadline handling',
        'Next.js static generation with image optimization on Vercel'
      ]
    }
  },
  {
    id: 'chronos-ai',
    title: 'Chronos Spatial OS',
    client: 'Chronos Labs',
    category: 'AI & Smart Interfaces',
    year: '2026',
    badge: 'Concept Showcase',
    tagline: 'Interactive 3D Workspace for Complex AI Workflows & Multi-Agent Swarms',
    description: 'A cognitive dashboard synthesizing real-time agent telemetry, neural graph visualizations, and sub-second workspace orchestration for deep tech teams.',
    impactMetrics: [
      { metric: '< 20ms', label: 'Streaming Latency' },
      { metric: '3.4x', label: 'Workflow Efficiency' },
      { metric: '60 FPS', label: '3D Graph Engine' }
    ],
    technologies: ['React 19', 'Three.js / WebGL', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    image: '/images/project-chronos.webp',
    accentColor: '#00F0FF',
    featured: true,
    award: 'Featured on Awwwards & Godly Design',
    videoUrl: '/videos/designing-the-intelligent-future.mp4',
    caseStudy: {
      overview: 'Chronos required an interface that makes complex multi-agent reasoning graphs visually intuitive and actionable for engineering teams.',
      challenge: 'Rendering dense network graphs and streaming agent thought processes simultaneously without browser UI lag or stutter.',
      solution: 'Constructed an optimized WebGL instance renderer with spring-based spatial transitions, achieving fluid 60 FPS performance across desktop devices.',
      architectureDetails: [
        'Custom WebGL node-clustering renderer with LOD geometry',
        'Streaming WebSocket interface with zero main-thread blocking',
        'Keyboard-driven command palette for rapid navigation'
      ]
    }
  },
  {
    id: 'aether-spatial',
    title: 'Aether Haute Horlogerie',
    client: 'Aether Luxury Maison',
    category: 'Interactive 3D & Motion',
    year: '2026',
    badge: 'Client Work',
    tagline: 'Photorealistic WebGL Digital Showroom & 3D Timepiece Configurator',
    description: 'An interactive luxury timepiece configurator featuring dynamic lighting, tactile audio feedback, and real-time material finishes for discerning collectors.',
    impactMetrics: [
      { metric: '+240%', label: 'Session Duration' },
      { metric: '4.8★', label: 'User Satisfaction' },
      { metric: '< 2.8MB', label: 'Total Asset Payload' }
    ],
    technologies: ['Three.js', 'Custom GLSL Shaders', 'Web Audio API', 'Framer Motion', 'TypeScript'],
    image: '/images/project-aether.webp',
    accentColor: '#8B5CF6',
    featured: true,
    award: 'CSS Design Awards — Site of the Day',
    caseStudy: {
      overview: 'A luxury watchmaker needed an online experience matching the prestige and tactile feel of their bespoke Geneva showroom.',
      challenge: 'Delivering photorealistic sapphire crystal and brushed titanium finishes with fast loading times on mobile devices.',
      solution: 'Developed custom micro-facet shaders with compressed KTX2 textures and subtle haptic sound synthesis on dial rotation.',
      architectureDetails: [
        'Custom PBR diamond dispersion and anti-reflective sapphire shader',
        'Procedural audio feedback synchronized to turntable rotational velocity',
        'Zero-layout-shift responsive viewport geometry'
      ]
    }
  },
  {
    id: 'vortex-protocol',
    title: 'Vortex Analytics Terminal',
    client: 'Vortex Capital',
    category: 'Web & Digital Products',
    year: '2025',
    badge: 'Client Work',
    tagline: 'High-Frequency Financial Dashboard & Predictive Market Visualizer',
    description: 'An institutional-grade web terminal rendering live order books, liquidity heatmaps, and slippage curves with zero latency.',
    impactMetrics: [
      { metric: '0.05s', label: 'Data Refresh Rate' },
      { metric: '99.99%', label: 'Platform Uptime' },
      { metric: '100/100', label: 'Lighthouse Score' }
    ],
    technologies: ['React 19', 'HTML5 Canvas', 'WebSockets', 'Tailwind CSS', 'TypeScript'],
    image: '/images/project-vortex.webp',
    accentColor: '#10B981',
    featured: true,
    caseStudy: {
      overview: 'Vortex needed a modern web interface capable of displaying massive real-time market data streams without browser freezes.',
      challenge: 'Handling rapid data updates during high volatility while preserving smooth charting and responsive user controls.',
      solution: 'Engineered an off-screen HTML5 Canvas depth map renderer with optimized state management and GPU-accelerated heatmaps.',
      architectureDetails: [
        'OffscreenCanvas rendering for chart updates without main-thread blocks',
        'Custom dark theme designed for long trading sessions with high contrast',
        'Modular grid layout with user-customizable workspace panels'
      ]
    }
  },
  {
    id: 'hyperion-fleet',
    title: 'Hyperion Command System',
    client: 'Hyperion Mobility',
    category: 'Brand Systems',
    year: '2025',
    badge: 'Concept Showcase',
    tagline: 'Fleet Management System & Topographic Telemetry Interface',
    description: 'A dark-mode mission control suite providing fleet status overviews, geospatial routing, and predictive battery diagnostics.',
    impactMetrics: [
      { metric: '50k+', label: 'Simulated Nodes' },
      { metric: '100%', label: 'Responsive Design' },
      { metric: '< 0.7s', label: 'Initial Page Load' }
    ],
    technologies: ['React 19', 'Deck.gl / Mapbox', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
    image: '/images/project-hyperion.webp',
    accentColor: '#F43F5E',
    featured: true,
    award: 'Red Dot Design Award Concept Winner',
    caseStudy: {
      overview: 'Hyperion needed a cohesive design system and mission control web portal for monitoring autonomous fleet operations.',
      challenge: 'Synthesizing complex multi-dimensional mapping data into clean, actionable dashboards accessible to operations managers.',
      solution: 'Built a component library with high-contrast typography, interactive map overlays, and smooth spring physics animations.',
      architectureDetails: [
        'Geospatial point cluster optimization with smooth zoom transitions',
        'Design token system unifying web, mobile, and in-vehicle displays',
        'Accessible color-blind safe telemetry indicators'
      ]
    }
  }
];
