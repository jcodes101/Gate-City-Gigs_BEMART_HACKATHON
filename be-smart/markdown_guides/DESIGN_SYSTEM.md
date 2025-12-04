# Design System - CSS Variables Guide

This document outlines the CSS variables and utility classes available throughout the website for consistent styling.

## Colors

### Primary Colors (Greensboro Green)

```css
--color-primary: #16a34a; /* Main green (green-600) */
--color-primary-hover: #15803d; /* Darker green for hover (green-700) */
--color-primary-light: #22c55e; /* Lighter green (green-500) */
--color-primary-lighter: #4ade80; /* Even lighter (green-400) */
--color-primary-lightest: #86efac; /* Lightest (green-200) */
--color-primary-custom: #b0fcb9; /* Custom light green for backgrounds */
--color-primary-icon: #87fd9d; /* Custom green for icons */
```

### Text Colors

```css
--color-text-primary: #374151; /* Main text (gray-700) */
--color-text-secondary: #4b5563; /* Secondary text (gray-600) */
--color-text-tertiary: #9ca3af; /* Tertiary text (gray-400) */
--color-text-light: #f9fafb; /* Light text (gray-50) */
--color-text-dark: #111827; /* Dark text (gray-900) */
```

### Background Colors

```css
--color-bg-primary: #ffffff; /* White */
--color-bg-secondary: #f9fafb; /* Light gray (gray-50) */
--color-bg-tertiary: #f3f4f6; /* Medium gray (gray-100) */
--color-bg-quaternary: #e5e7eb; /* Darker gray (gray-200) */
```

### Border Colors

```css
--color-border: #d1d5db; /* Standard border (gray-300) */
--color-border-light: #e5e7eb; /* Light border (gray-200) */
--color-border-dark: #374151; /* Dark border (gray-700) */
```

## Gradients

```css
--gradient-navbar: linear-gradient(to right, #f9fafb, #f3f4f6, #e5e7eb);
--gradient-homepage: linear-gradient(to right, #f0fdf4, #b0fcb9, #d1fae5);
```

## Buttons

### Primary Button

Use the `.btn-primary` class or apply styles manually:

```css
background-color: var(--button-primary-bg);
color: var(--button-primary-text);
padding: var(--button-primary-padding-y) var(--button-primary-padding-x);
border-radius: var(--button-primary-radius);
font-size: var(--button-primary-font-size);
font-weight: var(--button-primary-font-weight);
```

### Secondary Button

Use the `.btn-secondary` class or apply styles manually:

```css
background-color: var(--button-secondary-bg);
color: var(--button-secondary-text);
border: 1px solid var(--button-secondary-border);
padding: var(--button-secondary-padding-y) var(--button-secondary-padding-x);
border-radius: var(--button-secondary-radius);
```

### Usage Examples

**React Component with CSS Variables:**

```jsx
<button
  style={{
    backgroundColor: "var(--button-primary-bg)",
    color: "var(--button-primary-text)",
    padding: "var(--button-primary-padding-y) var(--button-primary-padding-x)",
  }}
>
  Click Me
</button>
```

**React Component with Utility Classes:**

```jsx
<Link to="/dashboard" className="btn-primary">
  Go to Dashboard
</Link>

<Link to="/report" className="btn-secondary">
  Make a Report
</Link>
```

**Tailwind with CSS Variables (inline styles):**

```jsx
<div style={{ backgroundColor: "var(--color-primary)" }}>Content</div>
```

## Typography

### Utility Classes

- `.text-heading-xl` - Extra large heading (responsive: 4xl on mobile, 6xl on desktop)
- `.text-heading-lg` - Large heading (3xl)
- `.text-heading-md` - Medium heading (2xl)
- `.text-body-lg` - Large body text (responsive: lg on mobile, xl on desktop)
- `.text-body-md` - Medium body text (base)
- `.text-body-sm` - Small body text (sm)

### CSS Variables

```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
--font-size-5xl: 3rem;
--font-size-6xl: 3.75rem;

--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Usage Examples

**With Utility Classes:**

```jsx
<h1 className="text-heading-xl">
  Main Heading
</h1>

<p className="text-body-lg">
  Body text content
</p>
```

**With CSS Variables:**

```jsx
<h1
  style={{
    fontSize: "var(--font-size-4xl)",
    fontWeight: "var(--font-weight-bold)",
    color: "var(--color-text-primary)",
  }}
>
  Custom Heading
</h1>
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

## Spacing

```css
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */
```

## Transitions

```css
--transition-default: all 0.2s ease-in-out;
--transition-colors: color 0.2s ease-in-out, background-color 0.2s ease-in-out,
  border-color 0.2s ease-in-out;
```

## Dark Mode

All color variables automatically adjust in dark mode when the `.dark` class is applied to the document root. The dark mode variants are defined in the CSS and will override the default values.

## Best Practices

1. **Use CSS Variables** for colors, spacing, and typography to maintain consistency
2. **Use Utility Classes** (`.btn-primary`, `.btn-secondary`, `.text-heading-xl`, etc.) for common components
3. **Combine with Tailwind** when needed, but prefer CSS variables for design system values
4. **Test in Dark Mode** - All variables have dark mode variants that work automatically

## Example: Complete Button Component

```jsx
import { Link } from "react-router-dom";

export function PrimaryButton({ to, children, onClick }) {
  const className = "btn-primary";

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export function SecondaryButton({ to, children, onClick }) {
  const className = "btn-secondary";

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}
```
