import type { NavigationItem } from '../types';

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  { name: 'Services', path: '/services', description: 'Core capabilities, deliverables, and engineering disciplines' },
  { name: 'Work', path: '/work', description: 'Selected production case studies and concept showcases' },
  { name: 'About', path: '/about', description: 'Agency philosophy, studio manifesto, and production stack' },
  { name: 'Contact', path: '/contact', description: 'Start a project or submit a technical brief' },
];

export const FOOTER_NAV_ITEMS: NavigationItem[] = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Work', path: '/work' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Book a Call', path: '/book', highlight: true },
];

export const CTA_NAV_ITEM: NavigationItem = {
  name: 'Book a 30-Min Call',
  path: '/book',
  highlight: true,
};
