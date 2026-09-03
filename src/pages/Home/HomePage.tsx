import React from 'react';
import { HeroSection } from '../../components/sections/HeroSection';
import { TelemetryBar } from '../../components/sections/TelemetryBar';
import { ManifestoSection } from '../../components/sections/ManifestoSection';
import { ServicesSection } from '../../components/sections/ServicesSection';
import { ScrollPinStory } from '../../components/motion/ScrollPinStory';
import { PortfolioSection } from '../../components/sections/PortfolioSection';
import { TechRadarSection } from '../../components/sections/TechRadarSection';
import { TeamSection } from '../../components/sections/TeamSection';
import { ContactSection } from '../../components/sections/ContactSection';
import { useSeo } from '../../hooks/useSeo';

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
      <ScrollPinStory />
      <PortfolioSection />
      <TechRadarSection />
      <TeamSection />
      <ContactSection />
    </>
  );
};
