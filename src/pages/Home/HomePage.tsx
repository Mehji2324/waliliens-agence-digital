import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { HeroSection } from '../../components/sections/HeroSection';
import { TelemetryBar } from '../../components/sections/TelemetryBar';
import { ManifestoSection } from '../../components/sections/ManifestoSection';
import { ServicesSection } from '../../components/sections/ServicesSection';
import { PortfolioSection } from '../../components/sections/PortfolioSection';
import { TechRadarSection } from '../../components/sections/TechRadarSection';
import { TeamSection } from '../../components/sections/TeamSection';
import { ContactSection } from '../../components/sections/ContactSection';
import { useSeo } from '../../hooks/useSeo';

const ScrollPinStory = lazy(() =>
  import('../../components/motion/ScrollPinStory').then((module) => ({ default: module.ScrollPinStory })),
);

const DeferredScrollPinStory: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className={shouldLoad ? '' : 'min-h-[100vh] lg:min-h-[260vh]'}
    >
      {shouldLoad && (
        <Suspense fallback={<div className="min-h-[100vh] lg:min-h-[260vh]" />}>
          <ScrollPinStory />
        </Suspense>
      )}
    </div>
  );
};

export const HomePage: React.FC = () => {
  useSeo({
    title: 'Kinetic AI & High-Converting Digital Engineering',
    description: 'Waliliens is a creative digital & AI studio designing bespoke marketing websites, SaaS platforms, and immersive 3D interfaces designed to turn traffic into revenue.',
  });

  return (
    <>
      <HeroSection />
      <TelemetryBar />
      <ManifestoSection />
      <ServicesSection />
      <DeferredScrollPinStory />
      <PortfolioSection />
      <TechRadarSection />
      <TeamSection />
      <ContactSection />
    </>
  );
};
