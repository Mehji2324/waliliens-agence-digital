import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Section } from '../../components/layout/Section';
import { MagneticButton } from '../../components/motion/MagneticButton';
import { ArrowLeft, Compass } from 'lucide-react';
import { useSeo } from '../../hooks/useSeo';

export const NotFoundPage: React.FC = () => {
  useSeo({
    title: '404 - Page Not Found',
    description: 'The requested route does not exist within the Waliliens digital matrix.',
    robots: 'noindex, nofollow',
  });

  return (
    <div className="bg-obsidian-950">
      <PageHeader
        badge="ERROR 404 // UNKNOWN PROTOCOL"
        title="COORDINATES"
        titleGradient="OUT OF BOUNDS."
        description="The requested page has been relocated, archived, or never existed in this dimension."
      />

      <Section className="text-center py-20">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan">
            <Compass className="h-8 w-8" />
          </div>
          <p className="text-sm text-neutral-400">
            Return to known territory or explore our capabilities and case studies.
          </p>
          <div className="pt-2">
            <MagneticButton href="/" variant="primary" className="py-3.5 px-8 text-sm font-bold">
              <ArrowLeft className="h-4 w-4" />
              <span>RETURN TO HOME</span>
            </MagneticButton>
          </div>
        </div>
      </Section>
    </div>
  );
};
