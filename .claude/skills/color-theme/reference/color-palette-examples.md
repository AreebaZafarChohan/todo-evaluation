# Color Palette Examples

## Example 1: Blue & Purple (Tech/SaaS)

### Brand Colors
- **Primary**: `#3b82f6` (Blue)
- **Secondary**: `#8b5cf6` (Purple)

### Generated Palette
```typescript
{
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Base
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  semantic: {
    success: '#10b981',  // Green
    warning: '#f59e0b',  // Orange
    error: '#ef4444',    // Red
    info: '#3b82f6'      // Blue
  }
}
```

### Use Case
- Modern SaaS applications
- Tech startups
- Developer tools
- Productivity apps

---

## Example 2: Green & Teal (Finance/Health)

### Brand Colors
- **Primary**: `#10b981` (Green)
- **Secondary**: `#14b8a6` (Teal)

### Generated Palette
```typescript
{
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // Base
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22'
  }
}
```

### Use Case
- Financial applications
- Healthcare platforms
- Sustainability/eco brands
- Wellness apps

---

## Example 3: Orange & Pink (Creative/Social)

### Brand Colors
- **Primary**: `#f97316` (Orange)
- **Secondary**: `#ec4899` (Pink)

### Generated Palette
```typescript
{
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Base
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  }
}
```

### Use Case
- Social media platforms
- Creative agencies
- Entertainment apps
- Food & restaurant brands

---

## Example 4: Indigo & Cyan (Professional/Corporate)

### Brand Colors
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#06b6d4` (Cyan)

### Generated Palette
```typescript
{
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',  // Base
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b'
  }
}
```

### Use Case
- Corporate websites
- Professional services
- Legal/consulting firms
- Educational platforms

---

## Example 5: Red & Yellow (Food/Energy)

### Brand Colors
- **Primary**: `#dc2626` (Red)
- **Secondary**: `#eab308` (Yellow)

### Generated Palette
```typescript
{
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',  // Base
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  }
}
```

### Use Case
- Food delivery apps
- Restaurant brands
- Energy/sports brands
- Urgent/emergency services

---

## Dark Mode Color Adjustments

### Strategy 1: Lighter Primary for Dark Backgrounds
```typescript
// Light mode
primary-500: '#3b82f6'

// Dark mode - slightly lighter for better contrast
primary-500: '#60a5fa'
```

### Strategy 2: Inverted Neutral Scale
```typescript
// Light mode
neutral: {
  50: '#f8fafc',   // Lightest
  900: '#0f172a'   // Darkest
}

// Dark mode - inverted
neutral: {
  50: '#0f172a',   // Darkest becomes lightest
  900: '#f8fafc'   // Lightest becomes darkest
}
```

---

## Accessibility Compliance

### WCAG AA Compliant Combinations

#### Light Mode
```typescript
// Text on background
text: primary-700   // #1d4ed8
background: white   // #ffffff
contrast: 7.2:1     // ✅ Passes WCAG AAA

// Button text on primary
text: white         // #ffffff
background: primary-600  // #2563eb
contrast: 4.8:1     // ✅ Passes WCAG AA

// Muted text
text: neutral-600   // #475569
background: white   // #ffffff
contrast: 5.5:1     // ✅ Passes WCAG AA
```

#### Dark Mode
```typescript
// Text on background
text: neutral-100   // #f1f5f9
background: neutral-900  // #0f172a
contrast: 15.8:1    // ✅ Passes WCAG AAA

// Button text on primary
text: neutral-900   // #0f172a
background: primary-500  // #60a5fa
contrast: 8.2:1     // ✅ Passes WCAG AAA
```

---

## Testing Your Palette

### Manual Testing Checklist
- [ ] All text meets minimum 4.5:1 contrast
- [ ] Headings meet minimum 3:1 contrast
- [ ] Interactive elements are distinguishable
- [ ] Focus states are clearly visible
- [ ] Dark mode has sufficient contrast
- [ ] Colors work for colorblind users

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors](https://coolors.co/) - Palette generation
- [Adobe Color](https://color.adobe.com/) - Accessibility tools
- Chrome DevTools - Color picker with contrast ratio

---

## Monochromatic Palettes (Single Brand Color)

Sometimes you only have one brand color. Here's how to work with it:

### Single Color: `#3b82f6` (Blue)

```typescript
const palette = {
  primary: generateColorScale('#3b82f6'),
  secondary: generateColorScale('#6366f1'), // Shifted hue
  neutral: generateColorScale('#64748b'),   // Desaturated blue-gray
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'  // Reuse primary
  }
}
```

### Tips for Single Color Palettes
1. **Secondary = Primary + 30° hue shift**
2. **Neutral = Desaturated version of primary**
3. **Keep semantic colors standard** (green=success, red=error)
4. **Use opacity variations** for subtle effects
