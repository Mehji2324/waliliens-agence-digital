import { useEffect } from 'react';
import type { SeoMeta } from '../types';

const SITE_ORIGIN = 'https://waliliens.com';

const setMeta = (selector: string, attribute: string, value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
};

export const useSeo = ({ title, description, canonical, robots = 'index, follow' }: SeoMeta) => {
  useEffect(() => {
    const fullTitle = `${title} | WALILIENS`;
    const canonicalUrl = canonical ?? `${SITE_ORIGIN}${window.location.pathname}`;
    document.title = fullTitle;

    setMeta('meta[name="description"]', 'name', 'description');
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title');
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'property', 'og:description');
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type');
    setMeta('meta[property="og:type"]', 'content', 'website');
    setMeta('meta[property="og:url"]', 'property', 'og:url');
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name');
    setMeta('meta[property="og:site_name"]', 'content', 'WALILIENS');
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card');
    setMeta('meta[name="twitter:card"]', 'content', 'summary');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description');
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="robots"]', 'name', 'robots');
    setMeta('meta[name="robots"]', 'content', robots);

    let linkCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  }, [title, description, canonical, robots]);
};
