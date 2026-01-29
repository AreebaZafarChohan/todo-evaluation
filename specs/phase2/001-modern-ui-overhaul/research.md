# Research: Modern UI/UX Overhaul

**Feature**: 001-modern-ui-overhaul
**Date**: 2026-01-21
**Status**: Complete

## Research Tasks Completed

### 1. Framer Motion Best Practices for React 19 + Next.js 16

**Decision**: Use Framer Motion 11.x with 'use client' directive for all animated components

**Rationale**:
- Framer Motion 11 has full React 19 support with improved concurrent rendering
- Next.js 16 App Router requires 'use client' for any component using hooks or browser APIs
- AnimatePresence works correctly with Next.js route transitions

**Alternatives Considered**:
- CSS-only animations: Rejected due to lack of spring physics and gesture support
- React Spring: Less ecosystem support, similar bundle size
- GSAP: Overkill for UI animations, larger bundle

### 2. Tailwind CSS 4 Integration Patterns

**Decision**: Use Tailwind 4 with CSS variables for theming

**Rationale**:
- Tailwind 4 natively supports CSS variables and `@theme` directive
- CSS variables enable instant theme switching without class regeneration
- Compatible with existing @tailwindcss/postcss setup

**Alternatives Considered**:
- Tailwind plugin system: More complex, requires rebuild on theme change
- Styled-components: Additional dependency, SSR complexity
- CSS Modules: Less flexible for dynamic theming

### 3. React Icons Tree-Shaking Strategy

**Decision**: Import specific icons from react-icons subpackages

**Rationale**:
- Direct imports like `import { FiSun } from 'react-icons/fi'` enable tree-shaking
- Avoids importing entire icon packs
- Supports all major icon sets (Feather, Hero, Material, etc.)

**Example**:
```tsx
// Good - tree-shakeable
import { FiSun, FiMoon } from 'react-icons/fi';
import { HiCheckCircle } from 'react-icons/hi';

// Bad - imports entire pack
import * as FiIcons from 'react-icons/fi';
```

### 4. Accessibility: prefers-reduced-motion Implementation

**Decision**: Create custom hook that returns boolean + provide static alternatives

**Rationale**:
- Single source of truth for motion preference
- Components can conditionally disable animations
- Fallback to static transitions maintains visual hierarchy

**Implementation Pattern**:
```tsx
const prefersReducedMotion = useReducedMotion();

const variants = prefersReducedMotion
  ? { initial: {}, animate: {}, exit: {} }
  : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
```

### 5. Theme Persistence Strategy

**Decision**: localStorage with system preference fallback, hydration-safe

**Rationale**:
- localStorage persists across sessions
- System preference (prefers-color-scheme) as intelligent default
- Script in `<head>` prevents flash of wrong theme

**Implementation**:
```tsx
// In layout.tsx <head>
<script dangerouslySetInnerHTML={{
  __html: `
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  `
}} />
```

### 6. 3D Card Performance Optimization

**Decision**: Use CSS transforms with Framer Motion springs, limit to 15deg rotation

**Rationale**:
- CSS transforms are GPU-accelerated
- Spring physics feel natural without continuous recalculation
- 15deg max rotation prevents disorienting effects

**Performance Targets**:
- Mouse move handler: <1ms execution
- Transform update: <16ms (60fps)
- Use `will-change: transform` hint

### 7. Particle System Performance

**Decision**: Canvas-based particles with requestAnimationFrame, adaptive count

**Rationale**:
- Canvas is more performant than DOM elements for many particles
- RAF ensures sync with display refresh rate
- Adaptive count based on device: 80 desktop, 40 tablet, 20 mobile

**Optimizations**:
- Batch all particle draws in single frame
- Skip particles outside viewport
- Pause when tab not visible (Page Visibility API)

### 8. Glassmorphism Browser Support

**Decision**: backdrop-filter with fallback solid background

**Rationale**:
- backdrop-filter: blur() has 95%+ browser support
- Safari requires -webkit prefix
- Fallback maintains usability on older browsers

**CSS Pattern**:
```css
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@supports not (backdrop-filter: blur(10px)) {
  .glassmorphism {
    background: rgba(30, 41, 59, 0.95);
  }
}
```

## Dependencies Research

| Package | Version | Size (gzip) | Purpose |
|---------|---------|-------------|---------|
| framer-motion | 11.15.0 | ~45kb | Animation library |
| react-icons | 5.4.0 | ~3kb per icon | Icon library |
| clsx | 2.1.1 | ~0.5kb | Class name utility |
| tailwind-merge | 2.6.0 | ~3kb | Merge Tailwind classes |

**Total Addition**: ~52kb gzip (acceptable for visual enhancement value)

## No Outstanding Clarifications

All technical decisions resolved. Ready for implementation.
