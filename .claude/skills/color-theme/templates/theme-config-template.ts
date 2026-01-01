// Template: Theme Configuration
// Usage: Define your brand colors and generate complete palette

import { generatePalette, generateCSSVariables } from '@/utils/color-generator';

export const themeConfig = {
  // Your brand colors
  colors: {
    primary: '#3b82f6',      // Replace with your primary brand color
    secondary: '#8b5cf6',    // Replace with your secondary brand color (optional)
  },

  // Dark mode configuration
  darkMode: {
    enabled: true,
    strategy: 'class' as const, // 'class' or 'media'
  },

  // Accessibility settings
  accessibility: {
    enforceWCAG: true,
    minimumContrast: 4.5,    // WCAG AA standard
  },
};

// Generate complete color palette
export const colorPalette = generatePalette(
  themeConfig.colors.primary,
  themeConfig.colors.secondary
);

// Generate CSS variables
export const cssVariables = generateCSSVariables(colorPalette);

// Export for use in components
export default themeConfig;
