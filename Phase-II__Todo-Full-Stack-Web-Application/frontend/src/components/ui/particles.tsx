// T010: Enhanced Particles with dynamic animations and mouse interaction
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  baseOpacity: number;
  hue: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface ParticlesProps {
  count?: number;
  color?: string;
  speed?: number;
  className?: string;
  connectDistance?: number;
  showConnections?: boolean;
  mouseInteraction?: boolean;
  glowEffect?: boolean;
}

export function Particles({
  count = 50,
  color,
  speed = 1.5,
  className = '',
  connectDistance = 150,
  showConnections = true,
  mouseInteraction = true,
  glowEffect = true,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  // Multiple colors for variety
  const colors = [
    { r: 168, g: 85, b: 247 },   // Purple
    { r: 20, g: 184, b: 166 },   // Teal
    { r: 99, g: 102, b: 241 },   // Indigo
    { r: 217, g: 70, b: 239 },   // Fuchsia
    { r: 34, g: 211, b: 238 },   // Cyan
  ];

  const initParticles = useCallback((canvas: HTMLCanvasElement) => {
    const isMobile = window.innerWidth < 768;
    const actualCount = prefersReducedMotion ? 0 : isMobile ? Math.floor(count / 2) : count;

    particlesRef.current = Array.from({ length: actualCount }, () => {
      const baseSize = Math.random() * 3 + 1.5;
      const baseOpacity = Math.random() * 0.6 + 0.3;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        size: baseSize,
        baseSize,
        opacity: baseOpacity,
        baseOpacity,
        hue: Math.floor(Math.random() * colors.length),
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      };
    });
  }, [count, speed, prefersReducedMotion, colors.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles(canvas);
    };

    resize();
    window.addEventListener('resize', resize);

    if (prefersReducedMotion) {
      return () => {
        window.removeEventListener('resize', resize);
        if (mouseInteraction) {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }

    // Animation loop
    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const mouse = mouseRef.current;

      particlesRef.current.forEach((particle, i) => {
        // Mouse interaction - particles attracted/repelled by mouse
        if (mouseInteraction && mouse.x > 0) {
          const dx = mouse.x - particle.x;
          const dy = mouse.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 0.5;
            // Gentle attraction
            particle.vx += (dx / dist) * force * 0.3;
            particle.vy += (dy / dist) * force * 0.3;
          }
        }

        // Add some randomness for organic movement
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;

        // Limit velocity
        const maxSpeed = speed * 3;
        const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (currentSpeed > maxSpeed) {
          particle.vx = (particle.vx / currentSpeed) * maxSpeed;
          particle.vy = (particle.vy / currentSpeed) * maxSpeed;
        }

        // Apply slight friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges with energy loss
        if (particle.x < 0) {
          particle.x = 0;
          particle.vx *= -0.8;
        }
        if (particle.x > window.innerWidth) {
          particle.x = window.innerWidth;
          particle.vx *= -0.8;
        }
        if (particle.y < 0) {
          particle.y = 0;
          particle.vy *= -0.8;
        }
        if (particle.y > window.innerHeight) {
          particle.y = window.innerHeight;
          particle.vy *= -0.8;
        }

        // Pulsing effect
        particle.pulsePhase += particle.pulseSpeed;
        const pulse = Math.sin(particle.pulsePhase);
        particle.size = particle.baseSize * (1 + pulse * 0.3);
        particle.opacity = particle.baseOpacity * (0.7 + pulse * 0.3);

        // Get color
        const colorIndex = particle.hue % colors.length;
        const col = colors[colorIndex];

        // Draw glow effect
        if (glowEffect) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
          );
          gradient.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${particle.opacity * 0.8})`);
          gradient.addColorStop(0.4, `rgba(${col.r}, ${col.g}, ${col.b}, ${particle.opacity * 0.3})`);
          gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw particle core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${particle.opacity})`;
        ctx.fill();

        // Draw bright center
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
        ctx.fill();

        // Draw connections between nearby particles
        if (showConnections) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const other = particlesRef.current[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectDistance) {
              const opacity = (1 - distance / connectDistance) * 0.4;

              // Gradient line
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y,
                other.x, other.y
              );
              const col1 = colors[particle.hue % colors.length];
              const col2 = colors[other.hue % colors.length];
              gradient.addColorStop(0, `rgba(${col1.r}, ${col1.g}, ${col1.b}, ${opacity})`);
              gradient.addColorStop(1, `rgba(${col2.r}, ${col2.g}, ${col2.b}, ${opacity})`);

              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // Draw connection to mouse
        if (mouseInteraction && mouse.x > 0) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 200) {
            const opacity = (1 - distance / 200) * 0.5;
            const col = colors[particle.hue % colors.length];

            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Visibility API
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, connectDistance, showConnections, mouseInteraction, glowEffect, initParticles, prefersReducedMotion, colors]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none fixed inset-0 z-0', className)}
      aria-hidden="true"
    />
  );
}
