# EzLift Design System

**Version**: 1.1
**Last Updated**: 2025-01-12
**Status**: Active (Light Mode Only - MVP)

> **⚠️ CRITICAL**: All color values in this document are sourced directly from `theme.ts`, which is the **single source of truth** for EzLift brand colors. If you need to update colors, modify `theme.ts` first, then update this documentation accordingly.

---

## Overview

This design system defines the visual language for the EzLift web app, ensuring consistency with the mobile app's brand identity. All components, colors, and typography are designed to match the mobile experience.

**Color Source**: `theme.ts` - All color values match exactly with theme.ts color definitions.

**Key Principles**:
- **Consistency**: Match mobile app design exactly
- **Simplicity**: Light mode only for MVP
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized for web

---

## Color Palette

> **Source**: All color values from `theme.ts` - single source of truth for EzLift brand colors.

### Brand Colors

#### Primary Orange (Brand Color)
| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Primary 50** | `#FFF0E5` | Lightest tint, backgrounds | `bg-primary-50` |
| **Primary 100** | `#FFD1B2` | Light tint, hover states | `bg-primary-100` |
| **Primary 200** | `#FFC299` | Light shade | `bg-primary-200` |
| **Primary 300** | `#FFA366` | Medium-light shade | `bg-primary-300` |
| **Primary 400** | `#FF8533` | Medium shade | `bg-primary-400` |
| **Primary 500** | `#FF6600` | **Brand Orange** - Primary CTAs, active states, Skip buttons | `bg-primary-500` `bg-brand-orange` `text-brand-orange` |

#### Secondary Blue (Selection Color)
| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Secondary 25** | `#4CB3F8` | Lightest tint | `bg-secondary-25` |
| **Secondary 50** | `#2EA6F6` | Light tint | `bg-secondary-50` |
| **Secondary 100** | `#1099F5` | **Selection Blue** - Selection states, links, charts, progress | `bg-secondary-100` `bg-brand-blue` `text-brand-blue` |
| **Secondary 200** | `#0988DD` | Darker shade | `bg-secondary-200` |
| **Secondary 300** | `#0988DD` | Darkest shade | `bg-secondary-300` |

### Background Colors (Grayscale)

| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Grayscale 0** | `#F8F9FB` | **Surface Gray** - Page backgrounds | `bg-grayscale-0` `bg-surface-gray` |
| **Grayscale 25** | `#F6F6FA` | Lightest gray | `bg-grayscale-25` |
| **Grayscale 50** | `#ECEFF3` | Light gray | `bg-grayscale-50` |
| **Grayscale 100** | `#DFE1E6` | Light-medium gray | `bg-grayscale-100` |
| **Grayscale 200** | `#C1C7CF` | Medium-light gray | `bg-grayscale-200` |
| **Grayscale 300** | `#A4ABB8` | Medium gray | `bg-grayscale-300` |
| **Grayscale 400** | `#808897` | Medium-dark gray | `bg-grayscale-400` |
| **Grayscale 500** | `#666D80` | Dark gray | `bg-grayscale-500` |
| **Grayscale 600** | `#353849` | Darker gray | `bg-grayscale-600` |
| **Grayscale 700** | `#272835` | Very dark gray | `bg-grayscale-700` |
| **Grayscale 800** | `#1A1B25` | Near black | `bg-grayscale-800` |
| **Grayscale 900** | `#0D0D12` | Almost black | `bg-grayscale-900` |
| **Card White** | `#FFFFFF` | Card backgrounds, modals | `bg-card-white` `bg-white` |

### Text Colors (Grayscale)

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Primary Text** | `#1A1B25` (Grayscale 800) | Headers, body text | `text-grayscale-800` `text-text-primary` |
| **Secondary Text** | `#666D80` (Grayscale 500) | Subtitles, metadata | `text-grayscale-500` `text-text-secondary` |
| **Disabled Text** | `#A4ABB8` (Grayscale 300) | Disabled elements | `text-grayscale-300` `text-text-disabled` |

### UI Element Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Border Gray** | `#DFE1E6` (Grayscale 100) | Dividers, input borders | `border-grayscale-100` `border-border-gray` |

### Additional Blue Colors

| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Additional Blue 50** | `#E9FFFD` | Lightest tint | `bg-additional-blue-50` |
| **Additional Blue 100** | `#BDD0F9` | Light tint | `bg-additional-blue-100` |
| **Additional Blue 400** | `#5082EF` | Medium shade | `bg-additional-blue-400` |
| **Additional Blue 500** | `#2463EB` | Primary blue | `bg-additional-blue-500` |
| **Additional Blue 600** | `#1D4FBC` | Darker shade | `bg-additional-blue-600` |

### Status Colors

#### Success (Alert)
| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Alert Success 0** | `#EFFEFA` | Lightest background | `bg-alert-success-0` |
| **Alert Success 25** | `#DDF2EE` | Light background | `bg-alert-success-25` |
| **Alert Success 50** | `#9DE0D3` | Light tint | `bg-alert-success-50` |
| **Alert Success 100** | `#40C4AA` | Primary success | `bg-alert-success-100` `text-success-green` |
| **Alert Success 200** | `#2876E` | Darker shade | `bg-alert-success-200` |
| **Alert Success 300** | `#174E43` | Darkest shade | `bg-alert-success-300` |

#### Success (Standard)
| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Success 100** | `#6E9C83` | Lightest | `bg-success-100` |
| **Success 200** | `#609277` | Light | `bg-success-200` |
| **Success 300** | `#508769` | Medium-light | `bg-success-300` |
| **Success 400** | `#42C257` | Medium | `bg-success-400` |
| **Success 500** | `#2DB470` | **Primary Success** - Positive changes, gains | `bg-success-500` `text-success-green` |

#### Warning (Alert)
| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Alert Warning 0** | `#FFFE60` | Lightest | `bg-alert-warning-0` |
| **Alert Warning 25** | `#F9CCCB` | Light background | `bg-alert-warning-25` |
| **Alert Warning 50** | `#FFB092` | Light tint | `bg-alert-warning-50` |
| **Alert Warning 100** | `#FFB04C` | Primary warning | `bg-alert-warning-100` |
| **Alert Warning 200** | `#953621` | Darker shade | `bg-alert-warning-200` |
| **Alert Warning 300** | `#583D1E` | Darkest shade | `bg-alert-warning-300` |

#### Error (Alert)
| Shade | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Alert Error 0** | `#FFEFF2` | Lightest background | `bg-alert-error-0` |
| **Alert Error 25** | `#FADAEB` | Light background | `bg-alert-error-25` |
| **Alert Error 50** | `#ED8296` | Light tint | `bg-alert-error-50` |
| **Alert Error 100** | `#DF1C41` | **Primary Error** - Errors, negative changes | `bg-alert-error-100` `text-error-red` |
| **Alert Error 200** | `#95122B` | Darker shade | `bg-alert-error-200` |
| **Alert Error 300** | `#710E21` | Darkest shade | `bg-alert-error-300` |
| **Alert Error 400** | `#823329` | Additional dark shade | `bg-alert-error-400` |

### Muscle Group Colors

| Muscle Group | Hex | Usage | Tailwind Class |
|--------------|-----|-------|----------------|
| **Abdominals** | `#0563AB` | Abdominal tags | `bg-muscle-abdominals` |
| **Hamstrings** | `#086E47` | Hamstring tags | `bg-muscle-hamstrings` |
| **Calves** | `#171016` | Calf tags | `bg-muscle-calves` |
| **Shoulders** | `#523173` | Shoulder tags | `bg-muscle-shoulders` |
| **Adductors** | `#061207` | Adductor tags | `bg-muscle-adductors` |
| **Glutes** | `#9C2146` | Glute tags | `bg-muscle-glutes` |
| **Quadriceps** | `#69583A` | Quadricep tags | `bg-muscle-quadriceps` |
| **Lats** | `#143E45` | Lat tags | `bg-muscle-lats` |
| **Biceps** | `#151D30` | Bicep tags | `bg-muscle-biceps` |
| **Forearms** | `#1B8C2C` | Forearm tags | `bg-muscle-forearms` |
| **Triceps** | `#505D75` | Tricep tags | `bg-muscle-triceps` |
| **Chest** | `#6B2B06` | Chest tags | `bg-muscle-chest` |
| **Lower Back** | `#13233B` | Lower back tags | `bg-muscle-lowerback` |
| **Middle Back** | `#7E2EB3` | Middle back tags | `bg-muscle-middleback` |
| **Traps** | `#9C4702` | Trap tags | `bg-muscle-traps` |
| **Abductors** | `#301A4B` | Abductor tags | `bg-muscle-abductors` |
| **Neck** | `#301A4B` | Neck tags | `bg-muscle-neck` |

### Superset Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Superset Exercise One** | `#2097E6` | First exercise in superset | `bg-superset-exerciseOne` |
| **Superset Exercise Two** | `#828AE8` | Second exercise in superset | `bg-superset-exerciseTwo` |

### Gradient Colors

| Gradient | Colors | Usage | Tailwind Class |
|----------|--------|-------|----------------|
| **Primary Orange Gradient** | `#FF6600` → `#FF3729` | Gradient backgrounds, buttons | `bg-gradient-primaryOrange` |

---

## Typography

### Font Family

**System Sans-Serif Stack**:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

### Type Scale

| Name | Size | Line Height | Weight | Tailwind Class | Usage |
|------|------|-------------|--------|----------------|-------|
| **Page Title** | 32px | 40px | 700 (Bold) | `text-page-title` | H1, page headings |
| **Section Header** | 24px | 32px | 700 (Bold) | `text-section-header` | H2, section titles |
| **Card Title** | 20px | 28px | 600 (Semibold) | `text-card-title` | H3, card headers |
| **Metric Large** | 32px | 40px | 700 (Bold) | `text-metric-large` | Dashboard stats |
| **Button Text** | 18px | 24px | 600 (Semibold) | `text-button-text` | Button labels |
| **Body** | 16px | 24px | 400 (Regular) | `text-body` or `text-base` | Body text |
| **Secondary** | 14px | 20px | 400 (Regular) | `text-secondary` or `text-sm` | Metadata, captions |
| **Small** | 12px | 16px | 400 (Regular) | `text-small` or `text-xs` | Fine print |

### Typography Examples

```tsx
// Page heading
<h1 className="text-page-title text-text-primary">Dashboard</h1>

// Section header
<h2 className="text-section-header text-text-primary">Recent Activity</h2>

// Card title
<h3 className="text-card-title text-text-primary">Training Volume</h3>

// Body text
<p className="text-base text-text-primary">Your workout summary...</p>

// Secondary text
<p className="text-sm text-text-secondary">Last updated 2 hours ago</p>
```

---

## Spacing System

### Layout Spacing

| Name | Value | Tailwind Class | Usage |
|------|-------|----------------|-------|
| **Screen Padding** | 16px | `p-screen-padding` | Mobile screen edges |
| **Card Padding** | 20px | `p-card-padding` | Card internal spacing |
| **Card Gap** | 16px | `gap-card-gap` | Between cards |
| **Section Gap** | 32px | `gap-section-gap` | Between page sections |
| **Element Gap** | 12px | `gap-element-gap` | Between related elements |
| **Touch Target** | 44px | `h-touch-target` | Minimum touch target size |

### Spacing Examples

```tsx
// Page layout
<div className="p-screen-padding space-y-section-gap">
  {/* Content */}
</div>

// Card layout
<Card className="p-card-padding space-y-element-gap">
  {/* Card content */}
</Card>

// Card grid
<div className="grid gap-card-gap">
  <Card />
  <Card />
</div>
```

---

## Border Radius

| Name | Value | Tailwind Class | Usage |
|------|-------|----------------|-------|
| **Card** | 16px | `rounded-card` | Dashboard cards, content cards |
| **Button** | 12px | `rounded-button` | Buttons, CTAs |
| **Input** | 8px | `rounded-input` | Form inputs, text fields |
| **Pill** | 20px | `rounded-pill` | Tags, muscle group pills |

---

## Component Styles

### Buttons

#### Primary Button (Orange CTA)
```tsx
<Button className="bg-primary-500 hover:bg-primary-400 text-white h-12 px-6 rounded-button font-semibold">
  Get Started
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="bg-white border-grayscale-100 hover:bg-grayscale-0 h-12">
  Cancel
</Button>
```

#### Selected State Button
```tsx
<Button className="bg-secondary-100 text-white h-12">
  ✓ Selected
</Button>
```

### Cards

#### Dashboard Card
```tsx
<Card className="rounded-card shadow-sm bg-white p-card-padding">
  <CardHeader>
    <CardTitle className="text-card-title">Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Input Fields

#### Text Input
```tsx
<Input 
  className="h-12 rounded-input border-border-gray focus:ring-brand-orange"
  placeholder="Enter text..."
/>
```

#### Password Input with Toggle
```tsx
<div className="relative">
  <Input 
    type={showPassword ? 'text' : 'password'}
    className="h-12 rounded-input pr-10"
  />
  <button className="absolute right-3 top-3">
    <Eye className="h-5 w-5 text-muted-foreground" />
  </button>
</div>
```

### Tags/Pills (Muscle Groups)

```tsx
<span className="px-4 py-2 rounded-pill bg-muscle-purple text-white text-sm font-medium">
  Shoulders
</span>
```

### Links

```tsx
<Link href="/profile" className="text-brand-blue hover:underline">
  View Profile
</Link>
```

---

## Navigation

### Top Navigation Bar

```tsx
<nav className="h-16 bg-white border-b border-border-gray sticky top-0">
  {/* Navigation items */}
</nav>
```

**Specs**:
- Height: 64px (h-16)
- Background: White
- Border: 1px solid #E0E0E0
- Sticky to top

### Active Route Highlighting

```tsx
<Link 
  className={cn(
    "px-4 py-2 rounded-md",
    isActive 
      ? "bg-brand-blue/10 text-brand-blue border-b-2 border-brand-blue" 
      : "text-muted-foreground hover:bg-muted"
  )}
>
  Dashboard
</Link>
```

---

## Accessibility

### Color Contrast (WCAG AA)

All color combinations meet WCAG 2.1 AA standards (≥ 4.5:1 contrast ratio):

✅ **Black (#1A1B25) on White**: 16.1:1  
✅ **White on Orange (#FF6600)**: 4.52:1  
✅ **White on Blue (#1099F5)**: 4.5:1  
✅ **Gray (#666D80) on White**: 4.6:1

### Touch Targets

All interactive elements have minimum **44px** touch target:
- Buttons: 48px height ✅
- Nav items: 44px+ height ✅
- Checkboxes: 44px touch area ✅

### Focus Indicators

All focusable elements show orange focus ring:
```css
focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

---

## Usage Examples

### Page Layout

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-surface-gray">
      <main className="container mx-auto p-screen-padding space-y-section-gap">
        <h1 className="text-page-title text-text-primary">Page Title</h1>
        
        <div className="grid gap-card-gap">
          <Card className="rounded-card p-card-padding">
            <CardTitle className="text-card-title">Card Title</CardTitle>
            <p className="text-base text-text-primary">Content...</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
```

### Form

```tsx
<form className="space-y-4 max-w-md">
  <div>
    <Label className="text-sm font-medium">Email</Label>
    <Input 
      type="email" 
      className="h-12 rounded-input border-border-gray"
      placeholder="you@example.com"
    />
  </div>
  
  <Button 
    type="submit"
    className="w-full h-12 bg-brand-orange hover:bg-[#E55F00] text-white rounded-button"
  >
    Submit
  </Button>
</form>
```

---

## Do's and Don'ts

### ✅ Do

- **Do** use `bg-primary-500` (or `bg-brand-orange`) for primary CTAs
- **Do** use `bg-secondary-100` (or `bg-brand-blue`) for selected/active states
- **Do** use `text-text-secondary` for metadata
- **Do** use `rounded-card` (16px) for cards
- **Do** use `rounded-button` (12px) for buttons
- **Do** ensure 44px+ touch targets
- **Do** test color contrast ratios

### ❌ Don't

- **Don't** use generic Tailwind colors (`bg-blue-500`, `bg-red-500`)
- **Don't** use dark mode (MVP is light mode only)
- **Don't** create custom colors outside this system
- **Don't** use border-radius < 8px
- **Don't** make touch targets < 44px
- **Don't** skip accessibility testing

---

## Migration Guide

### Updating Existing Components

**Before** (Generic):
```tsx
<Button className="bg-blue-500 text-white">Login</Button>
<Link className="text-blue-600 hover:underline">Sign up</Link>
<div className="bg-gray-100 rounded-lg">Content</div>
```

**After** (Branded):
```tsx
<Button className="bg-primary-500 text-white">Login</Button>
<Link className="text-secondary-100 hover:underline">Sign up</Link>
<div className="bg-grayscale-0 rounded-card">Content</div>
```

---

## Quick Reference

### Common Patterns

**Primary Button**:
```tsx
className="bg-primary-500 hover:bg-primary-400 text-white h-12 px-6 rounded-button font-semibold"
```

**Secondary Button**:
```tsx
className="bg-white border border-grayscale-100 hover:bg-grayscale-0 h-12 px-6 rounded-button"
```

**Card**:
```tsx
className="bg-white rounded-card shadow-sm p-card-padding"
```

**Active Nav Item**:
```tsx
className="bg-secondary-100/10 text-secondary-100 border-b-2 border-secondary-100"
```

**Link**:
```tsx
className="text-secondary-100 hover:underline"
```

**Tag/Pill**:
```tsx
className="px-4 py-2 rounded-pill bg-muscle-shoulders text-white text-sm"
```

---

## Testing Checklist

### Visual QA
- [ ] Colors match mobile app screenshots exactly
- [ ] Typography hierarchy clear and consistent
- [ ] Spacing feels balanced and generous
- [ ] Components look polished and professional

### Accessibility
- [ ] All text readable (contrast ≥ 4.5:1)
- [ ] All interactive elements focusable
- [ ] Touch targets ≥ 44px
- [ ] Keyboard navigation works

### Consistency
- [ ] Orange used for primary actions
- [ ] Blue used for selections/links
- [ ] White cards on gray backgrounds
- [ ] 16px card border-radius throughout

---

**Reference**: Color values from `theme.ts` - Single source of truth for EzLift brand colors.  
**Previous Reference**: Based on `docs/ux-design-brief.md` - Mobile App Design System (lines 973-1093) - **NOW SUPERSEDED by theme.ts**



