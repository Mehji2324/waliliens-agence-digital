// ─── Projects ────────────────────────────────────────────────────────────────

export interface CaseStudy {
  overview: string;
  challenge: string;
  solution: string;
  architectureDetails: string[];
}

export interface ImpactMetric {
  metric: string;
  label: string;
}

export type ProjectCategory =
  | 'Web & Digital Products'
  | 'Interactive 3D & Motion'
  | 'AI & Smart Interfaces'
  | 'Brand Systems';

export type ProjectBadge = 'Client Work' | 'Concept Showcase' | 'Internal R&D';

export interface Project {
  id: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: string;
  tagline: string;
  description: string;
  badge?: ProjectBadge;
  impactMetrics: ImpactMetric[];
  technologies: string[];
  image: string;
  accentColor: string;
  featured: boolean;
  award?: string;
  caseStudy: CaseStudy;
}

// ─── Services ────────────────────────────────────────────────────────────────

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

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface ContactRequest {
  name: string;
  email: string;
  company?: string;
  budget: string;
  timeline: string;
  services: string[];
  message: string;
}

export interface ContactRecord extends ContactRequest {
  id: string;
  receivedAt: string;
  // NOTE: In production this will be stored in the database.
  // The in-memory implementation is temporary and does NOT persist data.
}

export interface ContactResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
  receivedAt: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface BookingSlot {
  id: string;
  date: string;
  time: string;
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

export interface BookingRecord extends BookingRequest {
  id: string;
  bookedAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  // NOTE: Future phases will integrate with a real booking provider.
  // This record is for internal tracking only.
}

export interface BookingResponse {
  success: boolean;
  bookingId: string;
  meetingUrl?: string;
  scheduledTime: string;
  message: string;
}
