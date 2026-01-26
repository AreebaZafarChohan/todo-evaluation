# Implementation Plan: Modern UI/UX Overhaul

**Branch**: `001-modern-ui-overhaul` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-modern-ui-overhaul/spec.md`

## Summary

Transform the existing Todo App frontend into a visually stunning, modern interface using Aceternity UI-inspired components, Framer Motion animations, Tailwind CSS styling, and React Icons. The overhaul applies to all pages (Landing, Auth, Tasks) with 3D cards, particle effects, glassmorphism, smooth transitions, and full dark/light theme support while maintaining 60fps performance and WCAG accessibility compliance.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.1.4, React 19.2.3
**Primary Dependencies**:
- Existing: Next.js 16, React 19, Tailwind CSS 4
- To Add: Framer Motion 11.x, React Icons 5.x, clsx, tailwind-merge
**Storage**: localStorage (theme preference only)
**Testing**: Manual visual testing, Lighthouse audits, responsive testing
**Target Platform**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (frontend-only changes)
**Performance Goals**: 60fps animations, <3s visual completeness, <400ms page transitions
**Constraints**: <16ms hover response, CLS <0.1, touch targets 44x44px minimum
**Scale/Scope**: 4 pages (Landing, Signin, Signup, Tasks), ~12 new UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven Development | ✅ PASS | spec.md created and approved |
| Lifecycle Enforcement | ✅ PASS | Following Specify → Plan → Tasks → Implement |
| Traceability Requirement | ✅ PASS | Task IDs will follow II-UI-### format |
| Agent Authority Limits | ✅ PASS | Following spec exactly, no architectural decisions |
| Layer Separation | ✅ PASS | UI-only changes, no business logic modification |
| Dependency Management | ✅ PASS | Adding only essential deps: framer-motion, react-icons |

## Project Structure

### Documentation (this feature)

```text
specs/001-modern-ui-overhaul/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (theme config)
├── quickstart.md        # Phase 1 output
├── contracts/           # N/A (no API changes)
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
Phase-II__Todo-Full-Stack-Web-Application/frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # UPDATE: Add CSS variables, gradients
│   │   ├── layout.tsx               # UPDATE: Add theme provider, transitions
│   │   ├── page.tsx                 # UPDATE: Landing page with hero
│   │   ├── (auth)/
│   │   │   ├── layout.tsx           # UPDATE: Auth layout with gradient bg
│   │   │   ├── signin/page.tsx      # UPDATE: Glassmorphism card
│   │   │   └── signup/page.tsx      # UPDATE: Glassmorphism card
│   │   └── (protected)/
│   │       ├── layout.tsx           # UPDATE: Protected layout styling
│   │       └── tasks/page.tsx       # UPDATE: 3D task cards
│   ├── components/
│   │   ├── ui/                      # NEW: Reusable UI components
│   │   │   ├── 3d-card.tsx          # 3D tilt effect card
│   │   │   ├── particles.tsx        # Canvas particle background
│   │   │   ├── floating-element.tsx # Floating animation wrapper
│   │   │   ├── glassmorphism-card.tsx # Blur + transparency card
│   │   │   ├── gradient-button.tsx  # Animated gradient button
│   │   │   ├── animated-text.tsx    # Text entrance animations
│   │   │   └── theme-toggle.tsx     # Dark/light mode switch
│   │   ├── layout/                  # NEW: Layout components
│   │   │   ├── page-transition.tsx  # Route transition wrapper
│   │   │   └── hero-section.tsx     # Animated hero component
│   │   └── tasks/                   # UPDATE: Existing task components
│   │       ├── CreateTaskForm.tsx   # Add animations
│   │       ├── TaskItem.tsx         # Convert to 3D card
│   │       └── UpdateTaskForm.tsx   # Add animations
│   ├── hooks/                       # NEW: Custom hooks
│   │   ├── use-theme.ts             # Theme state management
│   │   └── use-reduced-motion.ts    # Accessibility hook
│   ├── lib/
│   │   ├── api.ts                   # No changes
│   │   └── utils.ts                 # NEW: cn() helper, animation utils
│   └── types/
│       ├── task.ts                  # No changes
│       └── theme.ts                 # NEW: Theme types
└── package.json                     # UPDATE: Add dependencies
```

**Structure Decision**: Extending existing Next.js 16 App Router structure with new `components/ui/` directory for reusable Aceternity-style components and `hooks/` directory for theme and accessibility hooks.

## Complexity Tracking

> No violations - all changes are within single frontend project, using minimal dependencies.

## Component Architecture

### Layer 1: Foundation Components

| Component | Purpose | Dependencies |
|-----------|---------|--------------|
| `use-theme.ts` | Theme state + localStorage persistence | React Context |
| `use-reduced-motion.ts` | Detect prefers-reduced-motion | window.matchMedia |
| `utils.ts` | cn() helper for conditional classes | clsx, tailwind-merge |

### Layer 2: Primitive UI Components

| Component | Props | Animation |
|-----------|-------|-----------|
| `particles.tsx` | count, color, speed | Canvas requestAnimationFrame |
| `floating-element.tsx` | duration, yOffset, delay | Framer motion.y |
| `animated-text.tsx` | delay, direction | Framer initial/animate |
| `gradient-button.tsx` | variant, size | Framer whileHover/whileTap |

### Layer 3: Composite UI Components

| Component | Uses | Purpose |
|-----------|------|---------|
| `3d-card.tsx` | framer-motion | Mouse-tracking tilt effect |
| `glassmorphism-card.tsx` | tailwind | Backdrop blur + transparency |
| `theme-toggle.tsx` | use-theme, react-icons | Dark/light switch |
| `page-transition.tsx` | framer AnimatePresence | Route transitions |
| `hero-section.tsx` | particles, floating-element, animated-text | Landing hero |

### Layer 4: Page Integration

| Page | Components Used |
|------|-----------------|
| Landing (page.tsx) | hero-section, gradient-button, particles |
| Signin | glassmorphism-card, gradient-button, animated-text |
| Signup | glassmorphism-card, gradient-button, animated-text |
| Tasks | 3d-card (TaskItem), page-transition, theme-toggle |

## Color System

### Primary Palette (Blue/Purple - Tech/SaaS)

```css
:root {
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  --secondary-500: #8b5cf6;
  --neutral-50: #f8fafc;
  --neutral-900: #0f172a;
}

[data-theme="dark"] {
  --neutral-50: #0f172a;
  --neutral-900: #f8fafc;
}
```

## Animation Specifications

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Page transition | 400ms | ease-out | Route change |
| Card entrance | 300ms | spring(300, 30) | Mount |
| 3D tilt | 16ms | spring(300, 30) | Mouse move |
| Button hover | 200ms | ease-in-out | Hover |
| Theme switch | 300ms | ease-out | Toggle |
| Particle movement | Continuous | linear | RAF loop |

## Dependency Additions

```json
{
  "dependencies": {
    "framer-motion": "^11.15.0",
    "react-icons": "^5.4.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  }
}
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance degradation on mobile | Medium | High | Reduce particle count, simplify animations on mobile |
| Bundle size increase | Low | Medium | Tree-shake react-icons, code-split framer-motion |
| Flash of unstyled content | Low | Medium | Server-side theme detection via cookie |
| Browser compatibility | Low | Low | CSS fallbacks for backdrop-filter |

## Implementation Phases

### Phase 1: Foundation (Dependencies + Utilities)
- Install dependencies
- Create utils.ts with cn() helper
- Create theme hook and context
- Create reduced-motion hook

### Phase 2: UI Components Library
- Build all components/ui/* components
- Test each in isolation
- Document props and usage

### Phase 3: Page Integration
- Update Landing page with hero
- Update Auth pages with glassmorphism
- Update Tasks page with 3D cards

### Phase 4: Polish + Accessibility
- Add theme toggle to layout
- Implement page transitions
- Test reduced-motion compliance
- Lighthouse audit and optimization

## Success Validation

| Criterion | Test Method |
|-----------|-------------|
| SC-001: <3s visual completeness | Lighthouse Performance |
| SC-003: 60fps hover | Chrome DevTools Performance |
| SC-004: 90+ accessibility | Lighthouse Accessibility |
| SC-005: <300ms theme toggle | Manual timing |
| SC-009: CLS <0.1 | Lighthouse CLS metric |
