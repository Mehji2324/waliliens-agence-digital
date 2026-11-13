import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { getProjectImage } from '../../utils/projectImage';
import type { Project } from '../../types';

interface ProjectCardMediaProps {
  project: Project;
  className?: string;
}

/**
 * Card thumbnail with an autoplaying muted looping video preview.
 *
 * - Desktop: preview starts on card hover (cheap, on-demand).
 * - Touch/mobile: preview starts when the card is scrolled into view
 *   (IntersectionObserver), since there is no hover.
 * - Honors prefers-reduced-motion: the static poster stays.
 * - A user pause (pause button) is respected and never auto-restarted.
 */
export const ProjectCardMedia: React.FC<ProjectCardMediaProps> = ({ project, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const [userPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const hasVideo = Boolean(project.videoUrl) && !reducedMotion;

  const startPreview = () => {
    if (!hasVideo || userPaused) return;
    setPreviewActive(true);
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {
        // Autoplay blocked — fall back to the static poster.
        setPreviewActive(false);
      });
    }
  };

  const stopPreview = () => {
    if (!hasVideo) return;
    const v = videoRef.current;
    if (v && !v.paused) {
      v.pause();
      v.currentTime = 0;
    }
    setPreviewActive(false);
  };

  // In-view detection for touch devices (no hover available).
  const isTouch =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none)').matches;

  React.useEffect(() => {
    if (!hasVideo || !isTouch || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!userPaused) startPreview();
          } else {
            stopPreview();
          }
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, isTouch, userPaused, project.videoUrl]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-obsidian-950 ${className}`}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      {/* Poster image — always rendered as the base layer */}
      <img
        src={getProjectImage(project)}
        alt={project.title}
        width={1000}
        height={650}
        loading="lazy"
        className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
          previewActive && videoReady ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video preview layer */}
      {hasVideo && (
        <video
          ref={videoRef}
          src={project.videoUrl}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onEnded={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            previewActive && videoReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Play affordance — shown while the static poster is visible */}
      {hasVideo && !previewActive && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-obsidian-950/70 text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-cyber-cyan/60 group-hover:text-cyber-cyan">
          <Play className="ml-0.5 h-5 w-5" />
        </div>
      )}
    </div>
  );
};
