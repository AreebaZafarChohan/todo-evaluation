# Quickstart: Modern UI/UX Overhaul

**Feature**: 001-modern-ui-overhaul
**Date**: 2026-01-21

## Prerequisites

- Node.js 18+
- npm or yarn
- Existing frontend running (`Phase-II__Todo-Full-Stack-Web-Application/frontend`)

## Setup Steps

### 1. Install Dependencies

```bash
cd Phase-II__Todo-Full-Stack-Web-Application/frontend
npm install framer-motion@^11.15.0 react-icons@^5.4.0 clsx@^2.1.1 tailwind-merge@^2.6.0
```

### 2. Create Utility Helper

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 3. Create Theme Types

Create `src/types/theme.ts`:

```typescript
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}
```

### 4. Create Theme Hook

Create `src/hooks/use-theme.ts`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { Theme, ThemeContextValue } from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState(prev =>
    prev === 'light' ? 'dark' : prev === 'dark' ? 'light' : 'light'
  );

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 5. Create Reduced Motion Hook

Create `src/hooks/use-reduced-motion.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}
```

### 6. Update Root Layout

Update `src/app/layout.tsx` to wrap with ThemeProvider:

```typescript
import { ThemeProvider } from '@/hooks/use-theme';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const theme = localStorage.getItem('theme') || 'system';
              const resolved = theme === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : theme;
              document.documentElement.setAttribute('data-theme', resolved);
            })();
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to verify setup.

## Verification Checklist

- [ ] Dependencies installed without errors
- [ ] `cn()` utility works with Tailwind classes
- [ ] Theme toggle changes `data-theme` attribute on `<html>`
- [ ] Theme persists after page refresh
- [ ] No hydration mismatch errors in console

## Next Steps

After setup verification, proceed with:

1. Create UI components in `src/components/ui/`
2. Update pages with new components
3. Add animations and transitions

See `tasks.md` (after running `/sp.tasks`) for detailed implementation steps.
