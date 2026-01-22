# Data Model: Modern UI/UX Overhaul

**Feature**: 001-modern-ui-overhaul
**Date**: 2026-01-21

## Overview

This feature is UI-only and does not modify backend data models. The only new data entity is client-side theme configuration stored in localStorage.

## Entities

### ThemeConfig

**Storage**: localStorage (key: `theme`)
**Scope**: Client-side only

```typescript
// types/theme.ts

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  resolvedTheme: 'light' | 'dark'; // Actual applied theme
}
```

**Fields**:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| theme | 'light' \| 'dark' \| 'system' | User's explicit preference | 'system' |
| resolvedTheme | 'light' \| 'dark' | Computed theme based on preference + system | Based on prefers-color-scheme |

**Validation Rules**:
- theme must be one of: 'light', 'dark', 'system'
- resolvedTheme is computed, not stored

**State Transitions**:

```
┌─────────────────────────────────────────────────────┐
│                    Theme State                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│   [Initial Load]                                     │
│        │                                             │
│        ▼                                             │
│   ┌─────────┐   User toggles   ┌─────────┐          │
│   │  light  │ ◄──────────────► │  dark   │          │
│   └─────────┘                  └─────────┘          │
│        ▲                            ▲               │
│        │      System changes        │               │
│        └──────── system ────────────┘               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Context Provider Shape

```typescript
// hooks/use-theme.ts

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
```

## localStorage Schema

```json
{
  "key": "theme",
  "value": "light" | "dark" | "system",
  "type": "string"
}
```

## No Database Changes

This feature does not require any database schema changes. All existing task, user, and authentication models remain unchanged.

## CSS Variables Schema

```css
:root {
  /* Color tokens */
  --color-primary-50: string;
  --color-primary-100: string;
  --color-primary-200: string;
  --color-primary-300: string;
  --color-primary-400: string;
  --color-primary-500: string;
  --color-primary-600: string;
  --color-primary-700: string;
  --color-primary-800: string;
  --color-primary-900: string;
  --color-primary-950: string;

  --color-secondary-500: string;

  --color-neutral-50: string;
  --color-neutral-100: string;
  --color-neutral-200: string;
  --color-neutral-300: string;
  --color-neutral-400: string;
  --color-neutral-500: string;
  --color-neutral-600: string;
  --color-neutral-700: string;
  --color-neutral-800: string;
  --color-neutral-900: string;
  --color-neutral-950: string;

  /* Semantic tokens */
  --color-success: string;
  --color-warning: string;
  --color-error: string;
  --color-info: string;

  /* Component tokens */
  --bg-primary: var(--color-neutral-50);
  --bg-secondary: var(--color-neutral-100);
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --border-color: var(--color-neutral-200);
}

[data-theme="dark"] {
  --bg-primary: var(--color-neutral-950);
  --bg-secondary: var(--color-neutral-900);
  --text-primary: var(--color-neutral-50);
  --text-secondary: var(--color-neutral-400);
  --border-color: var(--color-neutral-800);
}
```
