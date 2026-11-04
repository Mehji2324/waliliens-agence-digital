import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  color: string;
  pulseSpeed: number;
  pulseAngle: number;
}

export const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const isMobile = window.matchMedia('(max-width: 1023px), (any-pointer: coarse)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    };

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const colors = ['#00F0FF', '#8B5CF6', '#A855F7', '#38BDF8', '#FFFFFF'];
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      // Adjust density based on screen size (mobile friendly)
      const count = isMobile
        ? Math.min(Math.floor((width * height) / 60000), 12)
        : Math.min(Math.floor((width * height) / 16000), 65);

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.8 + 1,
          baseAlpha: Math.random() * 0.5 + 0.2,
          color,
          pulseSpeed: Math.random() * 0.015 + 0.008,
          pulseAngle: Math.random() * Math.PI * 2,
        });
      }
    };

    resizeCanvas();

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient background gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        80,
        width * 0.5,
        height * 0.4,
        width * 0.65
      );
      bgGrad.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      bgGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.02)');
      bgGrad.addColorStop(1, 'rgba(4, 4, 6, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Connection lines
      const maxDist = isMobile ? 65 : 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      // Update & Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Soft mouse repulsion
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.x -= Math.cos(angle) * force * 3;
          p.y -= Math.sin(angle) * force * 3;
        }

        p.pulseAngle += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(0.9, currentAlpha));
        ctx.shadowBlur = isMobile ? 0 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-65"
    />
  );
};
