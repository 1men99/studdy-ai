---
name: Academic Clarity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 1rem
  margin-mobile: 1.25rem
  margin-desktop: 2.5rem
---

## Brand & Style

This design system centers on a **Minimalist** and **Modern Corporate** aesthetic tailored for the academic environment. The core philosophy is "reduction for focus"—removing visual noise to prioritize cognitive load management for students. 

The emotional response should be one of calm, organized efficiency. By utilizing expansive whitespace and a restrained color palette, the UI disappears to let the educational content lead. It avoids the clinical coldness of traditional enterprise software by using soft radius values and approachable typography, ensuring the interface feels like a helpful companion rather than a rigid tool.

## Colors

The palette is anchored by a high-clarity **Primary Blue (#2563EB)**, used strategically for primary actions and progress indicators. 

- **Primary**: Used for call-to-action buttons, active states, and focus indicators.
- **Secondary**: A muted slate blue-gray for secondary text and icons to reduce visual vibration.
- **Backgrounds**: The system uses a tiered white-to-gray approach. The main canvas is pure white (#FFFFFF), while container backgrounds use a soft "Ghost Gray" (#F8FAFC) to create subtle grouping without harsh borders.
- **Text**: Deep indigo-black (#0F172A) is used for maximum legibility on light backgrounds, ensuring WCAG AAA compliance for body text.

## Typography

The typography utilizes **Inter** exclusively to leverage its exceptional legibility and systematic weight distribution. 

- **Hierarchy**: Large, bold headings provide immediate orientation. 
- **Body Text**: Generous line height (1.5x) is applied to body copy to prevent "wall of text" fatigue during long study sessions.
- **Tracking**: Tighten letter spacing slightly on larger headlines for a contemporary, premium feel, while keeping labels slightly tracked out for clarity at small sizes.
- **Mobile Adaptation**: Display and Large Headlines scale down significantly on mobile to maintain vertical rhythm without overwhelming the viewport.

## Layout & Spacing

This design system uses a **Fluid Grid** model with a mobile-first philosophy.

- **Grid**: A 12-column grid is used for desktop (max-width 1280px), collapsing to a 4-column grid on mobile.
- **Rhythm**: All spacing is derived from a 4px baseline unit. 
- **Stacking**: Use 24px (md) spacing between related cards and 48px (xl) between major sections to emphasize a sense of "air."
- **Margins**: Mobile views utilize a 20px (1.25rem) side margin to prevent content from feeling cramped against the screen edge, while desktop expands to a more generous 40px (2.5rem).

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Ambient Shadows** rather than heavy borders.

- **Level 0 (Canvas)**: Pure White (#FFFFFF).
- **Level 1 (Surface)**: Soft Gray (#F8FAFC) used for subtle background sections or inset areas.
- **Level 2 (Cards)**: White surfaces with an extremely diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.04)). This makes cards appear to float gently above the canvas.
- **Interaction**: On hover, elevation should subtly increase (shadow deepens to 0.08 opacity) to provide tactile feedback without looking "heavy."

## Shapes

The shape language is defined by **large, friendly corner radii**. 

- **Base Radius**: 8px for standard components like input fields and buttons.
- **Large Radius (Cards)**: 16px is the standard for content containers and dashboard cards, creating a soft, approachable frame for information.
- **Full Radius**: Used exclusively for status chips and specific "floating" action buttons to differentiate them from structural layout elements.

## Components

- **Cards**: These are the primary organizational units. They must have a 16px border radius, no border (or a very faint 1px #F1F5F9 stroke), and Level 2 elevation.
- **Buttons**: Primary buttons use a solid #2563EB fill with white text. Secondary buttons use a ghost style (no fill, 1px slate-gray border) or a subtle gray fill. All buttons should have a minimum height of 48px on mobile for ease of use.
- **Input Fields**: Focus on accessibility with a 2px blue border on focus. Use a light gray background (#F8FAFC) to make fields feel "receptive."
- **Progress Bars**: Use the primary blue against a soft gray track. Corners should be fully rounded to match the friendly brand tone.
- **Chips**: Small, fully rounded badges for tags (e.g., "Mathematics", "Due Today"). Use low-saturation background tints (e.g., light blue background with dark blue text) to signify categories without competing with primary buttons.
- **Lists**: Lists should be "flushed" with generous vertical padding (16px) between items and a simple horizontal rule divider (1px #F1F5F9).