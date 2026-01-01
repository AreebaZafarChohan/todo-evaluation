# WCAG Color Compliance Guide

## Understanding WCAG Contrast Requirements

### Contrast Ratio Standards

#### WCAG AA (Minimum)
- **Normal text**: 4.5:1
- **Large text** (18pt+ or 14pt+ bold): 3:1
- **UI components**: 3:1

#### WCAG AAA (Enhanced)
- **Normal text**: 7:1
- **Large text**: 4.5:1

### Why It Matters
- 1 in 12 men and 1 in 200 women have color vision deficiency
- Low vision users need high contrast
- Legal requirements in many jurisdictions (ADA, Section 508)

---

## Calculating Contrast Ratios

### Formula
```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
```
Where L1 is the relative luminance of the lighter color and L2 is the darker color.

### Implementation
```typescript
import { TinyColor } from '@ctrl/tinycolor';

function getContrastRatio(color1: string, color2: string): number {
  const c1 = new TinyColor(color1);
  const c2 = new TinyColor(color2);

  const l1 = c1.getLuminance();
  const l2 = c2.getLuminance();

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Usage
const ratio = getContrastRatio('#3b82f6', '#ffffff');
console.log(ratio); // 3.69:1
```

---

## Common Color Combinations

### Light Mode

#### Text on White Background
```typescript
// ✅ WCAG AAA Compliant
{ fg: '#1e293b', bg: '#ffffff', ratio: 15.04 }  // neutral-800
{ fg: '#334155', bg: '#ffffff', ratio: 11.46 }  // neutral-700

// ✅ WCAG AA Compliant
{ fg: '#475569', bg: '#ffffff', ratio: 7.85 }   // neutral-600
{ fg: '#64748b', bg: '#ffffff', ratio: 5.06 }   // neutral-500

// ❌ Fails WCAG AA
{ fg: '#94a3b8', bg: '#ffffff', ratio: 2.97 }   // neutral-400
{ fg: '#cbd5e1', bg: '#ffffff', ratio: 1.57 }   // neutral-300
```

#### Primary Blue on White
```typescript
// ✅ WCAG AA Compliant
{ fg: '#1e40af', bg: '#ffffff', ratio: 7.35 }   // primary-800
{ fg: '#1d4ed8', bg: '#ffffff', ratio: 5.45 }   // primary-700

// ❌ Fails WCAG AA
{ fg: '#2563eb', bg: '#ffffff', ratio: 3.94 }   // primary-600
{ fg: '#3b82f6', bg: '#ffffff', ratio: 2.86 }   // primary-500
```

#### Buttons
```typescript
// ✅ White text on primary button
{ fg: '#ffffff', bg: '#2563eb', ratio: 5.35 }   // primary-600

// ✅ White text on dark button
{ fg: '#ffffff', bg: '#1e293b', ratio: 15.04 }  // neutral-800

// ❌ White text on light primary (fails)
{ fg: '#ffffff', bg: '#60a5fa', ratio: 2.05 }   // primary-400
```

### Dark Mode

#### Text on Dark Background
```typescript
// ✅ WCAG AAA Compliant
{ fg: '#f1f5f9', bg: '#0f172a', ratio: 15.35 }  // neutral-100/900
{ fg: '#e2e8f0', bg: '#0f172a', ratio: 13.82 }  // neutral-200/900

// ✅ WCAG AA Compliant
{ fg: '#cbd5e1', bg: '#0f172a', ratio: 10.73 }  // neutral-300/900
{ fg: '#94a3b8', bg: '#0f172a', ratio: 5.65 }   // neutral-400/900

// ❌ Fails WCAG AA
{ fg: '#64748b', bg: '#0f172a', ratio: 3.32 }   // neutral-500/900
```

#### Primary Blue on Dark Background
```typescript
// ✅ Use lighter shades in dark mode
{ fg: '#60a5fa', bg: '#0f172a', ratio: 7.47 }   // primary-400
{ fg: '#93c5fd', bg: '#0f172a', ratio: 10.45 }  // primary-300

// ❌ Dark primary shades don't work
{ fg: '#2563eb', bg: '#0f172a', ratio: 2.34 }   // primary-600
```

---

## Fixing Non-Compliant Colors

### Strategy 1: Darken Text Color
```typescript
// Before (fails)
<p className="text-primary-500">  // #3b82f6 on white = 2.86:1 ❌

// After (passes)
<p className="text-primary-700">  // #1d4ed8 on white = 5.45:1 ✅
```

### Strategy 2: Add Background Color
```typescript
// Before (fails)
<span className="text-primary-500">Important</span>

// After (passes)
<span className="bg-primary-100 text-primary-800 px-2 py-1 rounded">
  Important
</span>
// #1e40af on #dbeafe = 8.2:1 ✅
```

### Strategy 3: Increase Font Size
```typescript
// Before (fails for normal text)
<p className="text-sm text-neutral-500">  // 5.06:1 - fails WCAG AA for small text

// After (passes for large text)
<p className="text-lg text-neutral-500">  // 5.06:1 - passes WCAG AA for large text ✅
```

---

## Automated Testing

### Component-Level Testing
```typescript
// utils/test-helpers.ts
import { getContrastRatio } from '@/utils/color-generator';

export function assertAccessibleContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
) {
  const ratio = getContrastRatio(foreground, background);
  const required = level === 'AAA' ? 7 : 4.5;

  expect(ratio).toBeGreaterThanOrEqual(required);
}

// In tests
it('should have accessible text contrast', () => {
  assertAccessibleContrast('#1e293b', '#ffffff', 'AA');
});
```

### Visual Regression Testing
```typescript
// playwright test
test('color contrast meets WCAG AA', async ({ page }) => {
  await page.goto('/');

  const violations = await page.evaluate(() => {
    return new Promise((resolve) => {
      // @ts-ignore
      axe.run(document, {
        rules: {
          'color-contrast': { enabled: true }
        }
      }, (err, results) => {
        resolve(results.violations);
      });
    });
  });

  expect(violations).toHaveLength(0);
});
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Using Brand Colors Directly for Text
```typescript
// Brand color may not be accessible
<p className="text-primary-500">Text</p>  // Often fails
```

**✅ Solution**: Use darker shades
```typescript
<p className="text-primary-700">Text</p>  // Usually passes
```

### ❌ Mistake 2: Gray Text on Gray Background
```typescript
<div className="bg-neutral-100">
  <p className="text-neutral-400">Text</p>  // Low contrast
</div>
```

**✅ Solution**: Increase contrast
```typescript
<div className="bg-neutral-100">
  <p className="text-neutral-700">Text</p>  // Better contrast
</div>
```

### ❌ Mistake 3: Ignoring Dark Mode
```typescript
// Works in light mode, fails in dark mode
<p className="text-neutral-700">Text</p>
```

**✅ Solution**: Use theme-aware classes
```typescript
<p className="text-neutral-700 dark:text-neutral-200">Text</p>
```

### ❌ Mistake 4: Decorative Elements with Text
```typescript
<div className="bg-primary-500 bg-opacity-20">
  <p className="text-primary-500">Text</p>  // Fails on light background
</div>
```

**✅ Solution**: Test actual rendered colors
```typescript
<div className="bg-primary-100">
  <p className="text-primary-800">Text</p>  // Tested combination
</div>
```

---

## Color Blindness Considerations

### Types of Color Blindness
1. **Protanopia** (Red-blind) - 1% of males
2. **Deuteranopia** (Green-blind) - 1% of males
3. **Tritanopia** (Blue-blind) - Rare
4. **Achromatopsia** (Total) - Very rare

### Don't Rely on Color Alone
```typescript
// ❌ Bad: Color is only indicator
<button className="bg-red-500">Delete</button>
<button className="bg-green-500">Confirm</button>

// ✅ Good: Icon + color
<button className="bg-red-500">
  <Trash className="w-4 h-4" />
  Delete
</button>
<button className="bg-green-500">
  <Check className="w-4 h-4" />
  Confirm
</button>
```

### Testing Tools
- [Chrome DevTools Vision Deficiency Emulator](https://developer.chrome.com/blog/new-in-devtools-83/#vision-deficiencies)
- [Color Oracle](https://colororacle.org/) - Desktop app
- [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/) - Online simulator

---

## Quick Reference Table

| Foreground | Background | Ratio | WCAG AA | WCAG AAA |
|------------|------------|-------|---------|----------|
| #000000 | #ffffff | 21.00 | ✅ | ✅ |
| #1e293b | #ffffff | 15.04 | ✅ | ✅ |
| #475569 | #ffffff | 7.85 | ✅ | ✅ |
| #64748b | #ffffff | 5.06 | ✅ | ❌ |
| #94a3b8 | #ffffff | 2.97 | ❌ | ❌ |
| #ffffff | #2563eb | 5.35 | ✅ | ❌ |
| #ffffff | #3b82f6 | 3.69 | ❌ | ❌ |
| #f1f5f9 | #0f172a | 15.35 | ✅ | ✅ |
| #60a5fa | #0f172a | 7.47 | ✅ | ✅ |

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessible-colors.com/)
- [Who Can Use This Color Combo?](https://www.whocanuse.com/)
