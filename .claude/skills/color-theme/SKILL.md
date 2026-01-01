# color-theme

## Description
Color palette generation and theme management for websites including primary colors, semantic colors, dark mode colors, and CSS variable generation.

## Use Cases
- Generate complete color palettes from user-provided colors
- Create semantic color scales (success, warning, error, info)
- Generate dark mode compatible color schemes
- Convert colors between formats (hex, rgb, hsl, oklch)
- Create CSS custom properties for theme variables
- Ensure WCAG color contrast compliance
- Generate Tailwind CSS color configurations

## Prerequisites
- Basic understanding of color theory
- CSS custom properties knowledge
- Understanding of WCAG accessibility standards

## Core Principles
1. **Accessibility First**: All color combinations must meet WCAG AA standards (4.5:1 for text)
2. **Performance**: Use CSS variables for instant theme switching
3. **Consistency**: Maintain predictable color scales across light/dark modes
4. **Flexibility**: Support multiple color formats and frameworks

## Implementation Patterns

### 1. Color Palette Generation
```typescript
// types/theme.ts
export interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base color
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

// utils/color-generator.ts
import { TinyColor } from '@ctrl/tinycolor';

export function generateColorScale(baseColor: string): ColorScale {
  const base = new TinyColor(baseColor);

  return {
    50: base.lighten(45).toHexString(),
    100: base.lighten(40).toHexString(),
    200: base.lighten(30).toHexString(),
    300: base.lighten(20).toHexString(),
    400: base.lighten(10).toHexString(),
    500: base.toHexString(),
    600: base.darken(10).toHexString(),
    700: base.darken(20).toHexString(),
    800: base.darken(30).toHexString(),
    900: base.darken(40).toHexString(),
    950: base.darken(45).toHexString(),
  };
}

export function generatePalette(
  primaryColor: string,
  secondaryColor?: string
): ColorPalette {
  const primary = generateColorScale(primaryColor);
  const secondary = secondaryColor
    ? generateColorScale(secondaryColor)
    : generateColorScale(new TinyColor(primaryColor).spin(30).toHexString());

  const neutral = generateColorScale('#64748b');

  return {
    primary,
    secondary,
    neutral,
    semantic: {
      success: generateColorScale('#10b981'),
      warning: generateColorScale('#f59e0b'),
      error: generateColorScale('#ef4444'),
      info: generateColorScale('#3b82f6'),
    },
  };
}
```

### 2. CSS Variable Generation
```typescript
// utils/css-variables.ts
export function generateCSSVariables(palette: ColorPalette): string {
  const vars: string[] = [];

  // Generate primary colors
  Object.entries(palette.primary).forEach(([shade, color]) => {
    vars.push(`  --color-primary-${shade}: ${color};`);
  });

  // Generate secondary colors
  Object.entries(palette.secondary).forEach(([shade, color]) => {
    vars.push(`  --color-secondary-${shade}: ${color};`);
  });

  // Generate neutral colors
  Object.entries(palette.neutral).forEach(([shade, color]) => {
    vars.push(`  --color-neutral-${shade}: ${color};`);
  });

  // Generate semantic colors
  Object.entries(palette.semantic).forEach(([type, scale]) => {
    Object.entries(scale).forEach(([shade, color]) => {
      vars.push(`  --color-${type}-${shade}: ${color};`);
    });
  });

  return `:root {\n${vars.join('\n')}\n}`;
}

// Example output:
/*
:root {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  ...
}
*/
```

### 3. Dark Mode Generation
```typescript
// utils/dark-mode.ts
export function generateDarkModeVariables(palette: ColorPalette): string {
  const vars: string[] = [];

  // Invert color scales for dark mode
  const invertScale = (scale: ColorScale): ColorScale => ({
    50: scale[950],
    100: scale[900],
    200: scale[800],
    300: scale[700],
    400: scale[600],
    500: scale[500],
    600: scale[400],
    700: scale[300],
    800: scale[200],
    900: scale[100],
    950: scale[50],
  });

  // Generate inverted neutral colors for dark mode
  const darkNeutral = invertScale(palette.neutral);
  Object.entries(darkNeutral).forEach(([shade, color]) => {
    vars.push(`  --color-neutral-${shade}: ${color};`);
  });

  return `[data-theme="dark"] {\n${vars.join('\n')}\n}`;
}
```

### 4. Tailwind Configuration
```typescript
// utils/tailwind-config.ts
export function generateTailwindConfig(palette: ColorPalette) {
  return {
    theme: {
      extend: {
        colors: {
          primary: palette.primary,
          secondary: palette.secondary,
          neutral: palette.neutral,
          success: palette.semantic.success,
          warning: palette.semantic.warning,
          error: palette.semantic.error,
          info: palette.semantic.info,
        },
      },
    },
  };
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... etc
          DEFAULT: 'var(--color-primary-500)',
        },
      },
    },
  },
};
```

### 5. Accessibility Checker
```typescript
// utils/accessibility.ts
import { TinyColor } from '@ctrl/tinycolor';

export function checkContrast(
  foreground: string,
  background: string
): { ratio: number; wcagAA: boolean; wcagAAA: boolean } {
  const fg = new TinyColor(foreground);
  const bg = new TinyColor(background);

  const ratio = TinyColor.readability(fg, bg);

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
  };
}

export function validatePalette(palette: ColorPalette): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check primary text on white
  const primaryOnWhite = checkContrast(palette.primary[700], '#ffffff');
  if (!primaryOnWhite.wcagAA) {
    errors.push('Primary 700 does not meet WCAG AA on white background');
  }

  // Check error colors
  const errorOnWhite = checkContrast(palette.semantic.error[600], '#ffffff');
  if (!errorOnWhite.wcagAA) {
    errors.push('Error color does not meet WCAG AA standards');
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

### 6. Theme Switcher Component
```tsx
// components/theme-switcher.tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initial = stored ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
```

## Common Patterns

### Theme Configuration File
```typescript
// config/theme.ts
export const themeConfig = {
  colors: {
    primary: '#3b82f6',    // User-provided
    secondary: '#8b5cf6',  // User-provided or generated
  },
  darkMode: {
    enabled: true,
    strategy: 'class', // or 'media'
  },
  accessibility: {
    enforceWCAG: true,
    minimumContrast: 4.5,
  },
};

export const generatedPalette = generatePalette(
  themeConfig.colors.primary,
  themeConfig.colors.secondary
);
```

### Global Styles
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... rest of colors */
  }

  [data-theme="dark"] {
    /* Dark mode colors */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... rest of colors */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Best Practices

1. **Color Naming**: Use semantic names (primary, success) over color names (blue, green)
2. **Contrast**: Always validate against WCAG standards
3. **Consistency**: Use the same scale pattern across all color sets
4. **Performance**: Use CSS variables for instant theme switching without re-renders
5. **Flexibility**: Support both class-based and media query dark mode
6. **Documentation**: Document color usage guidelines

## Anti-Patterns to Avoid

❌ Hardcoding colors in components
❌ Using too many color variations
❌ Ignoring accessibility standards
❌ Not providing dark mode alternatives
❌ Inconsistent color naming conventions
❌ Using inline styles for theme colors

## Testing Checklist

- [ ] All color combinations meet WCAG AA standards
- [ ] Dark mode switches correctly
- [ ] Theme persists across page reloads
- [ ] Colors render consistently across browsers
- [ ] CSS variables are properly scoped
- [ ] Tailwind classes generate correctly
- [ ] Theme switcher works without JavaScript flash

## Related Skills
- tailwind-css
- shadcn
- frontend-component
- aceternity-ui

## Tools & Libraries
- `@ctrl/tinycolor` - Color manipulation
- `tailwindcss` - Utility-first CSS framework
- `next-themes` - Theme management for Next.js
- Color contrast checkers (WebAIM, Coolors)

## References
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Color Theory Basics](https://www.interaction-design.org/literature/topics/color-theory)
