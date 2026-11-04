export interface Project {
  id: string;
  title: string;
  client: string;
  category: 'Web & Digital Products' | 'Interactive 3D & Motion' | 'AI & Smart Interfaces' | 'Brand Systems';
  year: string;
  tagline: string;
  description: string;
  badge?: 'Client Work' | 'Concept Showcase' | 'Internal R&D';
  impactMetrics: {
    metric: string;
    label: string;
  }[];
  technologies: string[];
  image: string;
  accentColor: string;
  featured: boolean;
  award?: string;
  caseStudy: {
    overview: string;
    challenge: string;
    solution: string;
    architectureDetails: string[];
  };
}

export interface Service {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  whoFor: string;
  problemSolved: string;
  capabilities: string[];
  deliverables: string[];
  icon: string;
  gradient: string;
  accentColor: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  impact: string;
  highlight: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  avatar?: string;
  initials?: string;
  specialties: string[];
  socials?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  quote?: string;
  focusArea: string;
}

export interface TelemetryMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  status: 'optimal' | 'live' | 'scaling';
}

export interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  budget: string;
  timeline: string;
  services: string[];
  message: string;
}

export interface ContactResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
  receivedAt: string;
}

export interface BookingSlot {
  id: string;
  time: string;
  date: string;
  available: boolean;
}

export interface BookingRequest {
  slotId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  company?: string;
  projectScope: string;
  timezone: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId: string;
  meetingUrl?: string;
  scheduledTime: string;
  message: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  status: number;
  message?: string;
  isMock?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type CursorType = 'default' | 'hover' | 'text' | 'drag' | 'hidden';

export interface CursorContextType {
  cursorType: CursorType;
  cursorText: string;
  setCursorType: (type: CursorType) => void;
  setCursorText: (text: string) => void;
  resetCursor: () => void;
}

export interface NavigationItem {
  name: string;
  path: string;
  description?: string;
  isExternal?: boolean;
  highlight?: boolean;
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
  robots?: string;
}
