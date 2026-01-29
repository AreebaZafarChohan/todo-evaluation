# Tasks: Modern UI/UX Overhaul

**Input**: Design documents from `/specs/001-modern-ui-overhaul/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md
**Branch**: `001-modern-ui-overhaul`
**Date**: 2026-01-21

**Tests**: Visual testing via Lighthouse audits (no unit tests requested)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All paths relative to `Phase-II__Todo-Full-Stack-Web-Application/frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create foundational utilities

- [ ] T001 Install dependencies: `npm install framer-motion@^11.15.0 react-icons@^5.4.0 clsx@^2.1.1 tailwind-merge@^2.6.0` in frontend/package.json
- [ ] T002 Create utility helper cn() function in src/lib/utils.ts
- [ ] T003 [P] Create theme types in src/types/theme.ts
- [ ] T004 [P] Create reduced motion hook in src/hooks/use-reduced-motion.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme system and CSS variables that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create theme hook with context provider in src/hooks/use-theme.ts
- [ ] T006 Update globals.css with CSS variables for color system in src/app/globals.css
- [ ] T007 Update root layout with ThemeProvider and theme script in src/app/layout.tsx
- [ ] T008 [P] Create base animated-text component in src/components/ui/animated-text.tsx
- [ ] T009 [P] Create gradient-button component in src/components/ui/gradient-button.tsx

**Checkpoint**: Foundation ready - theme system functional, user story implementation can begin

---

## Phase 3: User Story 1 - First Impressions Landing Experience (Priority: P1) MVP

**Goal**: Impressive animated landing page with particles and smooth animations

**Independent Test**: Load homepage → See animated hero with particles within 2s → Hover buttons show scale effects → Mobile viewport adapts correctly

### Implementation for User Story 1

- [ ] T010 [P] [US1] Create particles canvas component in src/components/ui/particles.tsx
- [ ] T011 [P] [US1] Create floating-element animation wrapper in src/components/ui/floating-element.tsx
- [ ] T012 [US1] Create hero-section composite component in src/components/layout/hero-section.tsx (depends on T010, T011, T008)
- [ ] T013 [US1] Update landing page with hero section in src/app/page.tsx (depends on T012, T009)
- [ ] T014 [US1] Add responsive styles for mobile/tablet in hero-section (update src/components/layout/hero-section.tsx)
- [ ] T015 [US1] Add prefers-reduced-motion support to particles in src/components/ui/particles.tsx

**Checkpoint**: Landing page fully functional with particles, animations, responsive design

---

## Phase 4: User Story 3 - Interactive Task Management (Priority: P1) MVP

**Goal**: 3D card effects and smooth interactions for task management

**Independent Test**: View tasks page → Each task is 3D card → Hover shows tilt effect → Create/complete/delete tasks show animations

### Implementation for User Story 3

- [ ] T016 [P] [US3] Create 3D card component with tilt effect in src/components/ui/3d-card.tsx
- [ ] T017 [US3] Update TaskItem to use 3D card in src/components/tasks/TaskItem.tsx (depends on T016)
- [ ] T018 [US3] Add entrance animation for new tasks in src/components/tasks/TaskItem.tsx
- [ ] T019 [US3] Add completion animation for done tasks in src/components/tasks/TaskItem.tsx
- [ ] T020 [US3] Add exit animation for deleted tasks in src/components/tasks/TaskItem.tsx
- [ ] T021 [US3] Update CreateTaskForm with animations in src/components/tasks/CreateTaskForm.tsx
- [ ] T022 [US3] Update UpdateTaskForm with animations in src/components/tasks/UpdateTaskForm.tsx
- [ ] T023 [US3] Update tasks page layout and styling in src/app/(protected)/tasks/page.tsx
- [ ] T024 [US3] Add responsive grid layout for task cards in src/app/(protected)/tasks/page.tsx

**Checkpoint**: Tasks page fully functional with 3D cards, CRUD animations, responsive grid

---

## Phase 5: User Story 2 - Engaging Authentication Experience (Priority: P2)

**Goal**: Glassmorphism auth pages with gradient backgrounds and smooth transitions

**Independent Test**: Visit signin/signup → See glassmorphism card → Focus inputs show glow → Submit shows loading state

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create glassmorphism-card component in src/components/ui/glassmorphism-card.tsx
- [ ] T026 [US2] Update auth layout with gradient background in src/app/(auth)/layout.tsx
- [ ] T027 [US2] Update signin page with glassmorphism card in src/app/(auth)/signin/page.tsx (depends on T025)
- [ ] T028 [US2] Update signup page with glassmorphism card in src/app/(auth)/signup/page.tsx (depends on T025)
- [ ] T029 [US2] Add input focus animations to auth forms in signin/signup pages
- [ ] T030 [US2] Add loading state animation for form submission in auth pages
- [ ] T031 [US2] Add page transition animation between signin/signup routes

**Checkpoint**: Auth pages fully functional with glassmorphism, input animations, loading states

---

## Phase 6: User Story 5 - Responsive Cross-Device Experience (Priority: P2)

**Goal**: UI adapts beautifully to desktop, tablet, and mobile

**Independent Test**: Resize browser → Desktop shows full effects → Tablet shows 2-col grid → Mobile shows stacked layout with simplified animations

### Implementation for User Story 5

- [ ] T032 [US5] Add responsive breakpoints to all UI components in src/components/ui/*.tsx
- [ ] T033 [US5] Reduce particle count on mobile devices in src/components/ui/particles.tsx
- [ ] T034 [US5] Simplify 3D card effects on mobile in src/components/ui/3d-card.tsx
- [ ] T035 [US5] Ensure 44x44px minimum touch targets on all buttons/links
- [ ] T036 [US5] Add responsive layout to protected area in src/app/(protected)/layout.tsx
- [ ] T037 [US5] Test and fix any responsive issues across all pages

**Checkpoint**: All pages responsive across desktop (1200px+), tablet (768px-1199px), mobile (<768px)

---

## Phase 7: User Story 4 - Theme Preference Support (Priority: P3)

**Goal**: Dark/light theme toggle with smooth transitions and persistence

**Independent Test**: Click theme toggle → All colors transition smoothly → Refresh page → Theme persists

### Implementation for User Story 4

- [ ] T038 [P] [US4] Create theme-toggle component with icons in src/components/ui/theme-toggle.tsx
- [ ] T039 [US4] Add theme toggle to root layout header in src/app/layout.tsx (depends on T038)
- [ ] T040 [US4] Update particle colors for dark mode in src/components/ui/particles.tsx
- [ ] T041 [US4] Update glassmorphism-card for dark mode in src/components/ui/glassmorphism-card.tsx
- [ ] T042 [US4] Update 3d-card colors for dark mode in src/components/ui/3d-card.tsx
- [ ] T043 [US4] Add smooth color transition to all themed elements in src/app/globals.css
- [ ] T044 [US4] Test theme toggle across all pages and components

**Checkpoint**: Theme system fully functional with toggle, persistence, smooth transitions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Page transitions, accessibility, performance optimization

- [ ] T045 Create page-transition wrapper component in src/components/layout/page-transition.tsx
- [ ] T046 Add AnimatePresence for route transitions in src/app/layout.tsx
- [ ] T047 Verify prefers-reduced-motion works on all animated components
- [ ] T048 Run Lighthouse accessibility audit and fix issues (target: 90+ score)
- [ ] T049 Run Lighthouse performance audit and optimize (target: <3s visual completeness)
- [ ] T050 Verify CLS < 0.1 on all pages
- [ ] T051 Final visual QA across all pages and breakpoints
- [ ] T052 Update any component documentation/comments as needed

**Checkpoint**: Feature complete, all success criteria met

---

## Dependencies

```text
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundation) ──────────────────────────────────────┐
    │                                                       │
    ├─────────────────┬─────────────────┬─────────────────┐│
    ▼                 ▼                 ▼                 ││
Phase 3 (US1)    Phase 4 (US3)    Phase 5 (US2)         ││
Landing P1       Tasks P1         Auth P2               ││
    │                 │                 │                ││
    └─────────────────┴─────────────────┘                ││
                      │                                   ││
                      ▼                                   ││
              Phase 6 (US5)                              ││
              Responsive P2                              ││
                      │                                   ││
                      ▼                                   ││
              Phase 7 (US4) ◄────────────────────────────┘│
              Theme P3                                    │
                      │                                   │
                      ▼                                   │
              Phase 8 (Polish) ◄──────────────────────────┘
```

## Parallel Execution Examples

### Within Phase 2 (Foundation):
```bash
# These can run in parallel:
T008 animated-text.tsx  ||  T009 gradient-button.tsx
```

### Within Phase 3 (US1 - Landing):
```bash
# These can run in parallel:
T010 particles.tsx  ||  T011 floating-element.tsx
# Then sequential:
T012 hero-section.tsx (needs T010, T011)
T013 page.tsx (needs T012)
```

### Within Phase 4 (US3 - Tasks):
```bash
# Start with:
T016 3d-card.tsx
# Then all these depend on T016:
T017-T024 (sequential within tasks)
```

### Cross-Phase Parallelism:
```bash
# After Phase 2 completes, these phases can run in parallel:
Phase 3 (US1)  ||  Phase 4 (US3)  ||  Phase 5 (US2)
# Phase 6 and 7 depend on earlier phases
```

## Implementation Strategy

### MVP Scope (Phases 1-4):
- **Deliverable**: Landing page + Tasks page with animations
- **User Stories**: US1 (Landing) + US3 (Tasks)
- **Value**: Core visual experience functional

### Increment 1 (Phase 5):
- **Deliverable**: + Auth pages with glassmorphism
- **User Story**: US2 (Auth)
- **Value**: Complete visual flow from landing to auth to tasks

### Increment 2 (Phases 6-7):
- **Deliverable**: + Responsive + Theme toggle
- **User Stories**: US5 (Responsive) + US4 (Theme)
- **Value**: Cross-device support and user preferences

### Final (Phase 8):
- **Deliverable**: Polish, transitions, accessibility
- **Value**: Production-ready quality

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 52 |
| Phase 1 (Setup) | 4 |
| Phase 2 (Foundation) | 5 |
| Phase 3 (US1 Landing) | 6 |
| Phase 4 (US3 Tasks) | 9 |
| Phase 5 (US2 Auth) | 7 |
| Phase 6 (US5 Responsive) | 6 |
| Phase 7 (US4 Theme) | 7 |
| Phase 8 (Polish) | 8 |
| Parallelizable [P] | 11 |

**MVP Scope**: Phases 1-4 (24 tasks) → Landing + Tasks pages functional
**Full Feature**: All phases (52 tasks) → Complete UI overhaul
