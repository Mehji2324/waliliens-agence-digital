import React from 'react';
import { m } from 'framer-motion';
import { TEAM_MEMBERS } from '../../data/team';
import { TiltCard } from '../motion/TiltCard';
import { Users2, Sparkles, Terminal, Cpu } from 'lucide-react';

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.97 0 1.75-.79 1.75-1.76s-.78-1.75-1.75-1.75a1.75 1.75 0 0 0-1.75 1.75c0 .97.78 1.76 1.75 1.76m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const TwitterIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const TeamSection: React.FC = () => {
  return (
    <section id="team" className="relative bg-obsidian-950 px-6 py-28 sm:px-12 lg:px-24">
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-cyber-cyan/5 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-cyber-violet/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-cyber-cyan uppercase">
            <Users2 className="h-3.5 w-3.5" />
            <span>Team & Leadership</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The Minds Behind the <span className="gradient-text-accent">Engineering</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400">
            Direct senior leadership. No junior layers. Visionaries and deep-tech architects dedicated to building standout digital products.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {TEAM_MEMBERS.map((member, idx) => {
            const isCEO = member.role === 'CEO';
            const accentBadge = isCEO
              ? 'border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan'
              : idx === 1
              ? 'border-cyber-violet/40 bg-cyber-violet/10 text-cyber-violet'
              : 'border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald';

            const glowColor = isCEO
              ? 'rgba(6, 182, 212, 0.18)'
              : idx === 1
              ? 'rgba(139, 92, 246, 0.18)'
              : 'rgba(16, 185, 129, 0.18)';

            const Icon = isCEO ? Sparkles : idx === 1 ? Cpu : Terminal;

            return (
              <m.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
              >
                <TiltCard maxTilt={5} glowColor={glowColor} className="flex h-full flex-col justify-between p-8">
                  <div>
                    {/* Top Row: Role Badge & Live Status */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-5">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold tracking-wider ${accentBadge}`}>
                          {member.role}
                        </span>
                        <span className="font-mono text-xs text-neutral-400">
                          {member.focusArea}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-emerald">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-cyber-emerald" />
                        <span>ACTIVE</span>
                      </div>
                    </div>

                    {/* Member Profile Header: Monogram Emblem & Info */}
                    <div className="mt-6 flex items-center gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${accentBadge} shadow-inner`}>
                        <span className="font-mono text-lg font-extrabold tracking-wider">
                          {member.initials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg font-bold text-white tracking-wide truncate">
                          {member.name}
                        </h3>
                        <p className="font-mono text-xs text-neutral-400 mt-0.5">
                          {member.title}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="mt-5 text-sm leading-relaxed text-neutral-300">
                      {member.bio}
                    </p>

                    {/* Specialties Chips */}
                    <div className="mt-6 flex flex-wrap gap-1.5">
                      {member.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="rounded-md border border-white/5 bg-white/5 px-2 py-1 font-mono text-[11px] text-neutral-300 transition-colors hover:border-white/20 hover:text-white"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Quote & Socials */}
                  <div className="mt-8 border-t border-white/10 pt-5">
                    {member.quote && (
                      <p className="font-mono text-xs italic text-neutral-400 mb-4 leading-normal">
                        "{member.quote}"
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${isCEO ? 'text-cyber-cyan' : idx === 1 ? 'text-cyber-violet' : 'text-cyber-emerald'}`} />
                        <span className="font-mono text-xs text-neutral-500 tracking-wider">
                          WALILIENS LEADERSHIP
                        </span>
                      </div>

                      {/* Social Links */}
                      <div className="flex items-center gap-3 text-neutral-400">
                        {member.socials?.linkedin && (
                          <a
                            href={member.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-cyber-cyan"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <LinkedInIcon className="h-4 w-4" />
                          </a>
                        )}
                        {member.socials?.github && (
                          <a
                            href={member.socials.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-cyber-cyan"
                            aria-label={`${member.name} GitHub`}
                          >
                            <GithubIcon className="h-4 w-4" />
                          </a>
                        )}
                        {member.socials?.twitter && (
                          <a
                            href={member.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors hover:text-cyber-cyan"
                            aria-label={`${member.name} Twitter`}
                          >
                            <TwitterIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
