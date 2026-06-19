---
name: EduTrack
description: Clear, trustworthy school management UI built on neutral tokens and institutional blue accents.
colors:
  background: "#ffffff"
  foreground: "#252525"
  primary: "#333333"
  primary-foreground: "#fafafa"
  brand-blue: "#2563eb"
  brand-blue-deep: "#1d4ed8"
  secondary: "#f5f5f5"
  secondary-foreground: "#333333"
  muted: "#f5f5f5"
  muted-foreground: "#737373"
  accent: "#f5f5f5"
  accent-foreground: "#333333"
  destructive: "#dc2626"
  border: "#ebebeb"
  input: "#ebebeb"
  ring: "#a3a3a3"
  card: "#ffffff"
  card-foreground: "#252525"
  popover: "#ffffff"
  popover-foreground: "#252525"
  canvas-gray: "#f9fafb"
  slate-ink: "#0f172a"
  slate-body: "#475569"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: EduTrack

## Overview

**Creative North Star: "The Clear Classroom"**

EduTrack looks and behaves like dependable school software: bright workspaces, crisp type, and blue accents that signal trust without shouting. The shadcn/Radix component layer in `globals.css` defines the normative token stack (OKLCH neutrals, 10px radius scale, ring-based depth). Marketing surfaces and the top nav still lean on Tailwind `slate` and `blue-600`; new work should converge tokens toward the CSS variable system so dashboards and auth flows feel like one product.

The system rejects SaaS landing theatrics and AI-default warmth. Data tables, forms, and role dashboards are the center of gravity; the public landing is secondary and should not dictate in-app patterns.

**Key Characteristics:**

- Single sans family (Geist) for UI and headings; Geist Mono for code or IDs when needed
- Restrained neutral palette with institutional blue reserved for brand marks, links, and emphasis
- Flat surfaces at rest; hover elevation via `shadow-sm` / `shadow-lg` on cards and popovers
- shadcn/Radix primitives: 32px default controls, 3px focus rings at 50% ring opacity
- Dashboard canvas `gray-50` / `slate` copy alongside semantic `background` / `foreground` tokens

## Colors

Achromatic neutrals carry the product; blue carries identity on logos, avatars, and marketing highlights.

### Primary

- **Ink Charcoal** (`#333333` / `oklch(0.205 0 0)`): Default buttons, badges, and primary actions in the token system. Near-black, not brand blue.
- **Primary on Dark** (`#fafafa` / `oklch(0.985 0 0)`): Text and icons on primary-filled controls.

### Secondary

- **Institutional Blue** (`#2563eb`): EduTrack mark, navbar logo tile, avatar fallback, landing emphasis, and legacy login CTAs. Use for brand recognition and links, not every button.
- **Blue Depth** (`#1d4ed8`): Hover/gradient end on marketing logo blocks.

### Neutral

- **Paper White** (`#ffffff` / `oklch(1 0 0)`): Page background in light mode; cards and popovers.
- **Ink Body** (`#252525` / `oklch(0.145 0 0)`): Primary text on light surfaces.
- **Canvas Mist** (`#f9fafb` / `gray-50`): Dashboard shell behind nav and main content.
- **Surface Wash** (`#f5f5f5` / `oklch(0.97 0 0)`): Secondary buttons, muted fills, card footers.
- **Caption Gray** (`#737373` / `oklch(0.556 0 0)`): Descriptions, placeholders (verify ≥4.5:1 on white).
- **Hairline Border** (`#ebebeb` / `oklch(0.922 0 0)`): Inputs, cards, separators.
- **Slate Ink** (`#0f172a`): Marketing headings and dashboard titles where `text-slate-900` is used today.
- **Slate Body** (`#475569`): Supporting copy on landing and admin welcome lines.

### Named Rules

**The One Blue Voice Rule.** Institutional blue appears on the logo tile, avatars, links, and deliberate emphasis spans. Primary actions inside the app use ink charcoal (`primary`), not blue fills, unless migrating a legacy screen.

**The No-Cream Default Rule.** Backgrounds stay true white or cool gray (`gray-50`). Do not introduce warm sand, parchment, or beige page fills.

## Typography

**Display Font:** Geist (with `ui-sans-serif`, system-ui)
**Body Font:** Geist (same stack)
**Label/Mono Font:** Geist Mono for monospace needs

**Character:** Modern geometric sans tuned for UI density. Headings use weight contrast (600–700) rather than a second display face. Marketing hero sizes (`text-5xl` / `text-6xl`) are landing-only; in-app headlines stay at fixed rem scale.

### Hierarchy

- **Display** (700, 2.25rem / landing up to 3.75rem, line-height 1.2): Landing hero only; clamp max 6rem if fluid is introduced.
- **Headline** (600, 1.5rem / `text-2xl`–`text-3xl`, line-height 1.3): Dashboard page titles, section headers.
- **Title** (500, 1rem / `text-base`, line-height 1.4): Card titles, table column headers, nav labels.
- **Body** (400, 0.875rem / `text-sm`–`text-base`, line-height 1.5): Forms, table cells, descriptions; prose blocks cap at 65–75ch where long copy appears.
- **Label** (500, 0.75rem–0.875rem): Form labels, badges, metadata; sentence case, not all-caps eyebrows.

### Named Rules

**The Single-Voice Type Rule.** Geist carries headings and body. Do not add a competing display serif or second sans for decoration.

## Elevation

Depth is mostly flat: white cards on `gray-50` canvas, separated by 1px rings and borders. Shadows appear on interaction and floating layers, not as default card decoration.

### Shadow Vocabulary

- **Nav lift** (`shadow-sm` on sticky nav): Separates chrome from content without heavy blur.
- **Card hover** (`hover:shadow-lg` on stat cards): Optional emphasis on dashboard metrics; use sparingly.
- **Popover / menu** (`shadow-md` + `ring-1 ring-foreground/10`): Dropdowns, selects, and menus.
- **Login / modal panel** (`shadow-md`–`shadow-xl`): Auth card and marketing login panel.

### Named Rules

**The Ring-First Rule.** Prefer `ring-1 ring-foreground/10` on cards (see `Card` component) over always-on drop shadows. Shadows signal hover, open overlays, or sticky chrome.

## Components

Familiar shadcn/Radix controls at 32px default height; institutional blue only where brand requires it.

### Buttons

- **Shape:** Gently rounded corners (`rounded-lg`, 8px effective via `--radius-md`).
- **Primary:** Ink charcoal fill, light foreground text, `h-8`, horizontal padding 10px, `text-sm` medium weight.
- **Hover / Focus:** Primary dims to 80% opacity on hover; `focus-visible` uses 3px ring at `ring/50` and border `ring`. Active state nudges `translate-y-px` (non-popup buttons).
- **Outline:** White/background fill, border `border`, hover `muted`. **Ghost:** transparent, hover `muted`. **Destructive:** 10% destructive tint, destructive text. **Link:** primary color with underline on hover.

### Chips

- **Style:** Pill-shaped badges (`rounded-4xl`), `h-5`, `text-xs`, border transparent; default uses primary fill; outline uses border only.
- **State:** Secondary and destructive variants mirror buttons; role badge in nav uses `outline`.

### Cards / Containers

- **Corner Style:** `rounded-xl` (14px via `--radius-xl`).
- **Background:** `bg-card` with `text-card-foreground`.
- **Shadow Strategy:** Ring at rest; optional `border-2` and `hover:shadow-lg` on admin stat cards (legacy pattern, prefer ring-first for new cards).
- **Border:** `ring-1 ring-foreground/10`; marketing cards sometimes `border-slate-200`.
- **Internal Padding:** `py-4` default, `px-4` header/content; compact `sm` size reduces to `py-3` / `px-3`.

### Inputs / Fields

- **Style:** `h-8`, `rounded-lg`, `border-input`, transparent background (dark: `input/30`).
- **Focus:** Border shifts to `ring`, 3px ring at `ring/50`.
- **Error / Disabled:** `aria-invalid` triggers destructive border and ring; disabled at 50% opacity with `bg-input/50`.

### Navigation

- **Style:** Sticky top bar, white background, bottom border, `shadow-sm`, `z-50`.
- **Brand:** 36px blue square with “E”, wordmark `text-xl` bold slate-900.
- **Items:** shadcn `Button` ghost/secondary by active route; emoji icons beside labels (consider Lucide migration for consistency).
- **User:** Avatar fallback on brand blue; role `Badge` outline; dropdown end-aligned with sign-out.

### Dashboard shell

- **Canvas:** `min-h-screen bg-gray-50` with container `p-8` and `max-w-7xl` content.
- **Loading:** Centered spinner, blue-600 border, gray-600 caption (align spinner color to tokens in future passes).

## Do's and Don'ts

Concrete guardrails for agents extending EduTrack.

### Do:

- **Do** use CSS variables from `globals.css` (`background`, `foreground`, `primary`, `muted`, `border`, `ring`) for new dashboard and form UI.
- **Do** keep body text at ≥4.5:1 contrast; bump `muted-foreground` toward ink if placeholders fail contrast.
- **Do** use Geist at fixed rem steps for in-app headings (1.5rem–2.25rem), not fluid clamp on dashboard routes.
- **Do** show focus-visible rings on all interactive controls (3px, `ring/50`).
- **Do** label buttons with verb + object (“Save changes”, “Mark attendance”).
- **Do** provide skeleton or structured empty states on data-heavy pages.

### Don't:

- **Don't** use generic SaaS landing clichés: hero metric strips (big number + small label grids), identical icon-card feature grids, or gradient text.
- **Don't** add warm cream/sand/parchment page backgrounds or decorative glassmorphism.
- **Don't** use `border-left` accent stripes on cards, alerts, or list rows.
- **Don't** pair competing sans families or all-caps section eyebrows on every block.
- **Don't** leave legacy `/login` gray/blue raw inputs on new flows; use `Input` + `Button` tokens.
- **Don't** fill every primary action with marketing blue; reserve `#2563eb` for brand and emphasis per the One Blue Voice Rule.
- **Don't** use marketing buzzwords, em dashes, or aphoristic short negation cadences in product copy.
