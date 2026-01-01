# Performance Optimization Guide for Aceternity UI

## Bundle Size Optimization

### 1. Tree-Shakeable Imports
```typescript
// ❌ Bad - imports entire library
import * as motion from 'framer-motion';

// ✅ Good - imports only what you need
import { motion, useScroll, useTransform } from 'framer-motion';
```

### 2. Dynamic Imports for Heavy Components
```typescript
// For components not needed on initial load
import dynamic from 'next/dynamic';

const Particles = dynamic(() => import('@/components/ui/particles'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-neutral-900" />
});
```

## Animation Performance

### 1. Use Transform Properties
```tsx
// ❌ Bad - causes layout reflow
<motion.div animate={{ top: 100, left: 100 }} />

// ✅ Good - uses GPU acceleration
<motion.div animate={{ x: 100, y: 100 }} />
```

### 2. Will-Change Property
```css
/* Use sparingly - only for elements that will animate */
.animating-element {
  will-change: transform;
}

/* Remove after animation completes */
.animating-element.complete {
  will-change: auto;
}
```

### 3. Reduce Motion Queries
```typescript
const shouldReduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Disable or simplify animations
<motion.div
  animate={shouldReduceMotion ? {} : { y: [0, -20, 0] }}
/>
```

## Canvas Optimization

### 1. Particle Count Management
```typescript
// Adjust based on device capability
const getParticleCount = () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency <= 4;

  if (isMobile) return 30;
  if (isLowEnd) return 50;
  return 100;
};
```

### 2. RequestAnimationFrame Optimization
```typescript
let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;

function animate(currentTime: number) {
  const deltaTime = currentTime - lastTime;

  if (deltaTime >= interval) {
    // Your animation code here
    lastTime = currentTime - (deltaTime % interval);
  }

  requestAnimationFrame(animate);
}
```

## Memory Management

### 1. Cleanup Event Listeners
```typescript
useEffect(() => {
  const handleResize = () => {
    // handle resize
  };

  window.addEventListener('resize', handleResize);

  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

### 2. Cancel Animation Frames
```typescript
useEffect(() => {
  let animationId: number;

  const animate = () => {
    // animation code
    animationId = requestAnimationFrame(animate);
  };

  animate();

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}, []);
```

## Mobile Optimization

### 1. Touch Events
```typescript
// Use passive listeners for scroll performance
useEffect(() => {
  const handleTouch = (e: TouchEvent) => {
    // handle touch
  };

  element.addEventListener('touchstart', handleTouch, { passive: true });

  return () => {
    element.removeEventListener('touchstart', handleTouch);
  };
}, []);
```

### 2. Viewport-Based Loading
```typescript
// Only animate when in viewport
const { ref, inView } = useInView({
  threshold: 0.1,
  triggerOnce: true,
});

<motion.div
  ref={ref}
  animate={inView ? { opacity: 1 } : { opacity: 0 }}
/>
```

## Performance Monitoring

### 1. FPS Counter (Development)
```typescript
let lastFrameTime = performance.now();
let fps = 0;

function measureFPS() {
  const now = performance.now();
  fps = 1000 / (now - lastFrameTime);
  lastFrameTime = now;

  if (fps < 50) {
    console.warn('Low FPS detected:', fps);
  }

  requestAnimationFrame(measureFPS);
}
```

### 2. Performance API
```typescript
// Measure component render time
const startMark = 'component-render-start';
const endMark = 'component-render-end';

performance.mark(startMark);
// Component render
performance.mark(endMark);

performance.measure('component-render', startMark, endMark);
const measure = performance.getEntriesByName('component-render')[0];
console.log('Render time:', measure.duration);
```

## Best Practices Checklist

- [ ] Use CSS transforms instead of layout properties
- [ ] Implement `prefers-reduced-motion` support
- [ ] Lazy load heavy components
- [ ] Cleanup event listeners and animation frames
- [ ] Use passive event listeners for scrolling
- [ ] Limit particle count on mobile devices
- [ ] Test on mid-range devices
- [ ] Monitor bundle size impact
- [ ] Use `will-change` sparingly
- [ ] Debounce/throttle expensive operations

## Common Performance Issues

### Issue: Janky Scrolling
**Cause**: Heavy calculations on scroll events
**Solution**: Use `IntersectionObserver` and throttle scroll handlers

### Issue: High Memory Usage
**Cause**: Too many simultaneous animations
**Solution**: Limit concurrent animations, cleanup unused instances

### Issue: Slow Initial Load
**Cause**: Large bundle size
**Solution**: Code split heavy components, lazy load effects

### Issue: Poor Mobile Performance
**Cause**: Desktop-optimized particle counts
**Solution**: Device detection and adaptive quality settings
