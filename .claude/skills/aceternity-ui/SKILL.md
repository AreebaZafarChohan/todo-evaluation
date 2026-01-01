# aceternity-ui

## Description
Lightweight 3D and animated UI components inspired by Aceternity/Three.js including 3D cards, animations, and visual effects optimized for performance.

## Use Cases
- Create 3D card hover effects
- Implement parallax scrolling animations
- Build particle effect backgrounds
- Create animated hero sections
- Add floating UI elements with 3D transforms
- Implement smooth scroll-triggered animations
- Create lightweight alternative to heavy Three.js scenes

## Prerequisites
- React/Next.js knowledge
- Basic CSS 3D transforms understanding
- Framer Motion basics
- Performance optimization awareness

## Core Principles
1. **Performance First**: Keep bundle size minimal, avoid heavy dependencies
2. **Lightweight 3D**: Use CSS transforms instead of WebGL when possible
3. **Progressive Enhancement**: Graceful degradation for older browsers
4. **Accessibility**: Respect `prefers-reduced-motion`
5. **Reusability**: Component-based architecture

## Implementation Patterns

### 1. 3D Card Component
```tsx
// components/ui/3d-card.tsx
'use client';

import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Card3D({ children, className, containerClassName }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={containerClassName}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={className}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Inner element with depth
export function Card3DBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={{ transform: 'translateZ(50px)' }}>
      {children}
    </div>
  );
}
```

### 2. Particle Background
```tsx
// components/ui/particles.tsx
'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface ParticlesProps {
  count?: number;
  color?: string;
  speed?: number;
  className?: string;
}

export function Particles({
  count = 50,
  color = '#ffffff',
  speed = 0.5,
  className = ''
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 2 + 1,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [count, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ zIndex: -1 }}
    />
  );
}
```

### 3. Parallax Scroll Component
```tsx
// components/ui/parallax-scroll.tsx
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  className = ''
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
```

### 4. Floating Elements
```tsx
// components/ui/floating-element.tsx
'use client';

import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  yOffset?: number;
  className?: string;
}

export function FloatingElement({
  children,
  duration = 3,
  delay = 0,
  yOffset = 20,
  className = '',
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 5. Animated Hero Section
```tsx
// components/ui/animated-hero.tsx
'use client';

import { motion } from 'framer-motion';
import { Particles } from './particles';
import { FloatingElement } from './floating-element';

export function AnimatedHero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background particles */}
      <Particles count={100} color="#3b82f6" speed={0.3} />

      {/* Hero content */}
      <div className="relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-bold text-white mb-4"
        >
          Welcome to the Future
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-neutral-300 mb-8"
        >
          Experience the next generation of web design
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-primary-500 text-white rounded-lg"
        >
          Get Started
        </motion.button>
      </div>

      {/* Floating decorative elements */}
      <FloatingElement duration={4} yOffset={30} className="absolute top-20 left-20">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full blur-xl" />
      </FloatingElement>

      <FloatingElement duration={5} delay={1} yOffset={40} className="absolute bottom-20 right-20">
        <div className="w-32 h-32 bg-secondary-500/20 rounded-full blur-xl" />
      </FloatingElement>
    </div>
  );
}
```

### 6. Scroll-Triggered Animation
```tsx
// components/ui/reveal-on-scroll.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function RevealOnScroll({
  children,
  className = '',
  delay = 0
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

## Best Practices

1. **Performance Optimization**
   - Use `will-change` CSS property sparingly
   - Implement intersection observer for scroll animations
   - Debounce/throttle mouse events
   - Use CSS transforms over layout properties

2. **Accessibility**
   ```tsx
   // Respect user motion preferences
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   <motion.div
     animate={prefersReducedMotion ? {} : { y: [0, -20, 0] }}
   >
     {children}
   </motion.div>
   ```

3. **Bundle Size**
   - Import only needed Framer Motion features
   - Use dynamic imports for heavy components
   - Avoid Three.js unless absolutely necessary

4. **Browser Support**
   - Provide fallbacks for older browsers
   - Test transform performance on mobile
   - Use feature detection

## Anti-Patterns to Avoid

❌ Using WebGL/Three.js for simple effects
❌ Animating layout properties (width, height, top, left)
❌ Not respecting `prefers-reduced-motion`
❌ Too many simultaneous animations
❌ Heavy particle counts on mobile
❌ Blocking the main thread with calculations

## Testing Checklist

- [ ] Animations run at 60fps on target devices
- [ ] Respects `prefers-reduced-motion` setting
- [ ] Works on mobile devices without lag
- [ ] Graceful degradation on older browsers
- [ ] No layout shift during animations
- [ ] Accessible keyboard navigation maintained
- [ ] Bundle size impact is acceptable (<20kb)

## Performance Benchmarks

- Target: 60fps on mid-range devices
- Budget: <20kb additional bundle size
- Mobile: Smooth on iPhone 12/Samsung S21 equivalent
- Desktop: Smooth on 3-year-old laptops

## Related Skills
- framer-motion
- tailwind-css
- frontend-component
- color-theme

## Tools & Libraries
- `framer-motion` (v11+) - Animation library
- `react-intersection-observer` - Scroll triggers
- CSS 3D transforms - Native browser features
- Canvas API - Lightweight particle effects

## References
- [Framer Motion Docs](https://www.framer.com/motion/)
- [CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [Web Animations Performance](https://web.dev/animations/)
- [Aceternity UI Inspiration](https://ui.aceternity.com/)
