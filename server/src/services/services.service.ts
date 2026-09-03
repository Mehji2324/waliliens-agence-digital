import type { Service } from '../types/domain';
import { servicesRepository } from '../repositories/services.repository';

export const SERVICES_DATA: Service[] = [
  {
    id: 'custom-web',
    num: '01',
    title: 'Custom Web & Digital Products',
    subtitle: 'High-Converting Web Experiences Engineered to Scale',
    description: 'We design and build bespoke marketing websites, SaaS platforms, and enterprise web applications that combine award-winning visual craftsmanship with sub-second performance.',
    whoFor: 'Growth-stage startups, tech companies, and forward-thinking enterprises seeking a market-leading digital presence.',
    problemSolved: 'Replaces slow, generic templates with high-converting, lightning-fast digital architecture that drives revenue.',
    capabilities: [
      'Bespoke Next.js & React 19 Architectures',
      'Conversion-Optimized Landing Pages',
      'Type-Safe Component Systems & CMS Integration',
      'Sub-Second Global Edge Latency & SEO Excellence'
    ],
    deliverables: [
      'Production-Ready Web Application',
      'Design System & Component Library',
      'Lighthouse 95+ Performance Guarantee'
    ],
    icon: 'Zap',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    accentColor: '#00F0FF'
  },
  {
    id: 'motion-3d',
    num: '02',
    title: 'Motion Design & Interactive 3D',
    subtitle: 'Cinematic Visual Experiences That Command Attention',
    description: 'Elevate your brand beyond standard layouts with physics-based micro-interactions, scroll-driven storytelling, and interactive 3D product visualizers rendered smoothly in the browser.',
    whoFor: 'Brands launching flagship products, luxury goods, and hardware companies needing tactile digital presentations.',
    problemSolved: 'Transforms complex or static product features into engaging, visceral visual stories that users can interact with.',
    capabilities: [
      'Real-Time 3D WebGL Product Visualizers',
      'Scroll-Driven Narrative Choreography',
      'Custom Particle & Lighting Shaders',
      'Spring-Physics Micro-Interactions & Gestures'
    ],
    deliverables: [
      'Interactive 3D Scene Graphs',
      'Reusable Motion Token Library',
      '60 FPS Desktop & Mobile Optimization'
    ],
    icon: 'Layers',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    accentColor: '#8B5CF6'
  },
  {
    id: 'ai-interfaces',
    num: '03',
    title: 'AI Integration & Smart Interfaces',
    subtitle: 'Human-Centric Interfaces for Intelligent Systems',
    description: 'We turn complex machine learning pipelines and autonomous agent capabilities into intuitive, elegant user interfaces that non-technical users can command instantly.',
    whoFor: 'AI-first startups, data-heavy platforms, and enterprises deploying copilots and neural automation workflows.',
    problemSolved: 'Bridges the gap between backend AI capability and end-user clarity, eliminating cognitive overwhelm.',
    capabilities: [
      'Real-Time Streaming AI Chat & Copilot UIs',
      'Dynamic Generative UI & Contextual Widgets',
      'Visual Knowledge Graphs & Node Editors',
      'Sub-20ms Telemetry & Output Streaming'
    ],
    deliverables: [
      'Full Copilot Frontend Integration',
      'Telemetry & Analytics Dashboards',
      'Evaluation & User Feedback Flows'
    ],
    icon: 'Cpu',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    accentColor: '#10B981'
  },
  {
    id: 'brand-systems',
    num: '04',
    title: 'Brand Systems & Design Architecture',
    subtitle: 'End-to-End Design Systems Engineered for Velocity',
    description: 'We build comprehensive, multi-platform design systems with defined typography, color theory, motion guidelines, and tokenized components that empower internal teams to ship fast.',
    whoFor: 'Companies experiencing rapid scale who need visual consistency across marketing, mobile, and web products.',
    problemSolved: 'Eliminates design debt, inconsistent UI, and developer-designer handoff friction.',
    capabilities: [
      'Figma-to-Code Tokenized Design Systems',
      'Custom Typography & Color Accessibility Audits',
      'Cross-Platform UI Component Libraries',
      'Brand Identity & Motion Language Guidelines'
    ],
    deliverables: [
      'Living Storybook / Component Documentation',
      'Figma Master System File',
      'Comprehensive Brand Guidelines'
    ],
    icon: 'Activity',
    gradient: 'from-rose-500/20 via-orange-500/10 to-transparent',
    accentColor: '#F43F5E'
  }
];

export class ServicesService {
  public async getAll(): Promise<Service[]> {
    try {
      const dbServices = await servicesRepository.findAll();
      if (dbServices.length > 0) {
        return dbServices;
      }
    } catch {
      // Fallback to static data if DB is unavailable or unseeded
    }
    return SERVICES_DATA;
  }

  public async getById(id: string): Promise<Service | null> {
    try {
      const dbService = await servicesRepository.findById(id);
      if (dbService) {
        return dbService;
      }
    } catch {
      // Fallback to static data
    }
    const service = SERVICES_DATA.find((s) => s.id === id);
    return service || null;
  }
}

export const servicesService = new ServicesService();
