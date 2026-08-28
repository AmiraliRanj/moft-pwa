---
name: moft-liquid-glass
description: Build, refactor, or audit production-quality Liquid Glass UI for the MOFT React/Next.js PWA. Use for real optical refraction, glass navigation, selection indicators, switches, sliders, overlays, headers, bottom bars, cards, and other glass materials. Prioritize iPhone/iOS Safari/PWA performance and accessibility. Use liquid-glass-web-react as the default live-DOM refraction engine, and use other techniques only when the medium or browser requires them.
---

# MOFT Liquid Glass

## Objective

Create a coherent Liquid Glass design system for MOFT that feels optical and tactile, not like generic `backdrop-blur` glassmorphism.

The preferred DOM engine is:

- `liquid-glass-web-react`
- repository: `https://github.com/PallavAg/liquid-glass-web-react`
- technique: generated displacement map + SVG `feDisplacementMap`
- baseline inspected version: `0.1.1`

The engineering reference is Aave's "Building Glass for the Web":

- `https://aave.com/design/building-glass-for-the-web`

Supplementary implementation reference:

- `https://github.com/samasante/liquid-glass`

Do not blindly copy another product's visual design. Reuse the optical engineering ideas while preserving MOFT's own themes, spacing, typography, RTL behavior, and component language.

## Core rule

**Real Liquid Glass requires optical displacement.**

Do not call this Liquid Glass when the implementation is only:

- `backdrop-filter: blur(...)`
- transparency
- border
- gradient
- glow
- box shadow

Those properties may support the material, but the primary interactive glass components should use refraction when the browser/device/performance budget allows it.

## Before changing code

1. Inspect the repository and current UI before installing or rewriting anything.
2. Identify:
   - framework and React version
   - package manager
   - Next.js/App Router or equivalent
   - current theme provider
   - Customer and Business theme tokens
   - existing buttons, tabs, switches, sheets, dialogs, headers, bottom navigation, selects
   - current mobile/PWA layout and safe-area handling
   - existing animation library
   - current reduced-motion handling
3. Search for existing glass implementations and remove duplicated one-off effects rather than stacking a new effect over them.
4. Do not rewrite the whole frontend in one pass. Migrate primitives first, then composite components.

## Default engine decision

For ordinary live DOM, use `liquid-glass-web-react`.

It is appropriate for:

- selection indicators
- segmented controls
- tabs
- switch thumbs
- slider handles
- compact buttons
- toolbars
- localized overlays
- small glass panels
- lenses over text/images/cards where the filtered source remains reasonably sized

Prefer the React `<LiquidGlass>` wrapper unless a low-level imperative engine is necessary.

For per-frame lens movement, use the imperative handle:

```tsx
const glassRef = useRef<LiquidGlassHandle>(null)

glassRef.current?.setPosition(x, y)
```

Do not drive 60 fps lens movement through React state if the imperative API can update it directly.

## Do not refract huge DOM regions

Never wrap the entire page, long dashboard, document body, or multi-screen scrolling container in one SVG refraction filter.

Safari has a practical source-size ceiling for SVG filtering. Large filtered sources can tile, corrupt, or disappear.

Keep refracted regions local and bounded.

Prefer:

```text
large page
  opaque/neutral page layer
  normal content
  small localized glass control
```

over:

```text
one giant refracted page container
```

If a fixed header or bottom navigation needs glass, keep the application shell that blocks scrolling content separate from the localized optical glass treatment.

## MOFT theme rules

Liquid Glass is a material, not the brand color.

### Customer

- Preserve the Customer green identity.
- Glass tint and highlights should derive from Customer tokens.
- Do not hardcode Business maroon into shared primitives.

### Business

- Preserve the Business maroon accent.
- Business dark mode should remain primarily near-black/charcoal.
- Maroon is an accent, not the entire background.
- Glass surfaces must not become low-contrast burgundy-on-burgundy.
- Interactive text in dark mode should remain white/near-white.

Use CSS variables or theme tokens. Do not hardcode a separate palette into each glass component.

## Material architecture

Separate these concerns:

1. **Refraction layer**
   - displacement
   - chromatic aberration
   - optical curvature

2. **Material/chrome layer**
   - tint
   - border/rim
   - subtle shadow
   - specular highlight
   - frost only when useful

3. **Content layer**
   - text
   - icons
   - controls
   - focus indicators

Important text and icons should normally remain crisp above the refraction layer.

Do not distort essential labels just to show the effect.

## Component strategy

Build one local MOFT abstraction around the upstream package instead of scattering raw `<LiquidGlass>` props across the codebase.

Suggested structure:

```text
components/
  glass/
    GlassLens.tsx
    GlassMaterial.tsx
    GlassSelection.tsx
    GlassButton.tsx
    GlassSwitch.tsx
    GlassTabs.tsx
    GlassBottomNav.tsx
    GlassTopbar.tsx
    glass-presets.ts
    glass-tokens.css
```

Do not create every file if the repository architecture suggests a simpler organization.

### `GlassLens`

Owns:

- upstream `LiquidGlass`
- browser/device performance profile
- quality
- strength
- curvature
- chromatic aberration
- glow
- edge highlight
- reduced-motion behavior

### `GlassMaterial`

Owns:

- tint
- border
- shadow
- fallback surface
- contrast
- theme integration

### Component wrappers

Own interaction and semantics:

- button semantics
- native input semantics
- keyboard behavior
- ARIA
- focus state
- selection state
- touch behavior

Do not bury interaction semantics inside the optical engine.

## Presets

Create a small number of named presets. Do not expose arbitrary optical numbers throughout the app.

Suggested starting profiles:

```ts
export const glassPresets = {
  selection: {
    strength: 0.075,
    chromaticAberration: 0.18,
    curvature: 0.72,
    glow: 0.10,
    edgeHighlight: 0.24,
  },
  control: {
    strength: 0.065,
    chromaticAberration: 0.14,
    curvature: 0.68,
    glow: 0.10,
    edgeHighlight: 0.28,
  },
  panel: {
    strength: 0.035,
    chromaticAberration: 0.08,
    curvature: 0.45,
    glow: 0.07,
    edgeHighlight: 0.18,
  },
}
```

These are starting points, not universal constants. Tune against real content and real devices.

Use gentler refraction on text-heavy controls than on decorative selection lenses.

## Recommended usage hierarchy

Use Liquid Glass most strongly on:

1. moving selection indicator
2. switch thumb
3. compact floating action
4. active tab/segmented selection
5. small toolbar control
6. localized navigation material

Use it sparingly on:

- data-heavy cards
- forms
- long lists
- tables
- large backgrounds
- finance screens
- dense dashboards

Do not make every card glass. The effect loses hierarchy and can hurt performance.

## Selection indicators

A moving selection lens is one of the best uses.

Prefer one glass lens that moves between options instead of creating one independent filter for every tab.

Requirements:

- labels stay crisp
- selected state is also conveyed by contrast/weight, not refraction alone
- keyboard focus remains independent
- movement uses imperative positioning when possible
- spring/easing may be used, but respect reduced motion

## Switches and sliders

Keep the native semantic control.

For a switch:

- retain a real checkbox/button semantic
- lens may act as the thumb
- state must remain readable without glass

For a slider:

- retain native `<input type="range">` or equivalent accessible control
- use gentler refraction
- do not make the numeric value difficult to read
- do not require pointer dragging; keyboard must work

## Fixed topbars and bottom navigation

Do not use transparent glass as the only layer between fixed navigation and scrolling content.

Use:

```text
opaque fixed/sticky application shell
  localized glass material/control
```

The shell must prevent content bleed-through.

On iPhone:

- cover the full safe-area
- reserve page space for fixed bottom navigation
- no readable page content may show through the nav
- no content may appear above a sticky taskbar through a transparent gap

Optical glass may decorate the inner nav or selected item, but usability and masking come first.

## Mobile and iOS are the primary target

Prioritize:

1. iPhone Safari
2. installed iOS PWA
3. Android mobile
4. iPad
5. desktop

Read `references/mobile-ios-qa.md` before shipping a glass-heavy change.

## Performance budget

The upstream repository has an open real-world performance report. Treat performance as a release criterion, not an assumption.

### Default strategy

Start conservatively on mobile.

Recommended initial `quality`:

- low-power / small mobile: 192–256
- modern mobile: 256
- tablet: 256–384
- desktop localized lens: 384–512

Do not blindly use `512` everywhere.

Tune visually and measure.

### Limit simultaneous optical lenses

Prefer:

- one moving selection lens
- one active interaction lens
- a few small localized lenses

Avoid:

- dozens of independent live SVG filters
- one glass filter per list row
- one glass filter per dashboard card

### Degradation order

If interaction or scrolling becomes janky:

1. reduce `quality`
2. reduce number of simultaneous lenses
3. reduce chromatic aberration
4. reduce edge/specular work
5. reduce animated geometry changes
6. keep lens geometry static while moving position only
7. fall back to a static glass material on that device/context

Do not solve performance problems by disabling accessibility or touch behavior.

### Motion rules

Moving the lens position should not regenerate the displacement map.

Shape changes may regenerate the map.

Avoid animating width, height, radius, curvature, and quality simultaneously during ordinary UI transitions.

If the control only moves, use `setPosition`.

## `prefers-reduced-motion`

If reduced motion is requested:

- remove spring wobble/squish
- avoid continuous lens-following motion
- use instant or short opacity/state changes
- keep a static glass material
- refraction may remain if it is static and does not impair readability

Do not remove focus indicators.

## Video, canvas, QR, and other non-DOM media

The preferred `liquid-glass-web-react` DOM engine does **not** solve every medium.

Known limitation:

- Safari does not pass live `<video>` through the SVG filter pipeline.

For live video/canvas/QR refraction:

1. Do not force the DOM SVG technique where the browser cannot support it.
2. First decide whether real refraction is actually necessary.
3. If necessary, use a WebGL renderer driven by the same displacement-map concept.
4. A supplementary library such as `@samasante/liquid-glass` may be evaluated specifically for WebGL/media mode.
5. Do not introduce a second glass engine for ordinary DOM just because it supports media.
6. Test React StrictMode before adopting another WebGL library.
7. Keep manual/non-WebGL fallback behavior.

If writing a local WebGL path, reuse the displacement-map vocabulary so DOM and media glass still look like one family.

## Browser-specific rules

### Safari / iOS

The upstream engine already handles:

- fresh SVG filter IDs for Safari cache invalidation
- `userSpaceOnUse` on iOS
- lens-sized Safari specular optimization
- large-source warning

Do not remove or work around these protections without a measured reason.

### Browser detection

Do not add more fragile UA hacks unless the bug is verified.

Prefer capability-based behavior for project-level fallbacks where possible.

## Accessibility

Liquid Glass must never be the only communication channel.

Requirements:

- WCAG-readable text
- visible keyboard focus
- minimum 44×44 CSS px touch target on mobile
- semantic buttons/inputs
- ARIA labels for icon-only controls
- selected/pressed/checked semantics
- no hover-only functionality
- no motion-only state
- support high-contrast or fallback material when needed
- editable mobile inputs remain at least 16px to avoid iOS auto-zoom

Do not apply optical distortion to form input text while the user is editing.

## Interaction safety

Glass layers must not intercept clicks intended for real controls.

Audit:

- `pointer-events`
- z-index
- overlay bounds
- portals
- focus trapping
- bottom sheets
- dropdown clipping
- iOS virtual keyboard behavior

If a decorative lens does not need pointer input, use `pointer-events: none`.

## SSR / Next.js

The upstream package is intended to be SSR-safe and performs DOM work in effects, but the glass wrapper is client-side UI.

In Next.js:

- isolate client components
- do not make entire page trees client components just for glass
- avoid reading `window`, `document`, or `navigator` during server render
- prevent hydration differences caused by device-specific quality decisions
- choose device/performance profile after mount or through stable CSS/media logic

## Installation workflow

If the package is not installed:

1. inspect the package manager
2. inspect React compatibility
3. verify current package version
4. install through the project's package manager
5. do not manually copy package source into the repo unless there is a concrete need

Example only:

```bash
npm install liquid-glass-web-react
```

Use the actual repository package manager.

If vendoring or modifying upstream MIT code:

- retain attribution/license requirements
- document why vendoring was necessary
- do not silently remove upstream credit

## Migration workflow

When asked to overhaul existing MOFT frontend with Liquid Glass:

### Phase 1 — audit

Inventory:

- nav
- topbar
- bottom bar
- buttons
- tabs
- switches
- sliders
- selects
- sheets
- dialogs
- cards
- search
- floating controls

Classify each as:

- strong glass candidate
- subtle material candidate
- should stay opaque/neutral

### Phase 2 — primitive lab

Build a temporary local glass lab/story route if needed.

Test:

- selection
- button
- switch
- bottom nav selection
- topbar control
- small panel

Do not migrate the full app before these pass on iPhone.

### Phase 3 — shared primitives

Create/reuse the local glass abstraction and presets.

### Phase 4 — mobile navigation

Migrate Customer and Business navigation separately while preserving each theme.

### Phase 5 — controls

Migrate tabs, switches, segmented controls, selected states.

### Phase 6 — composite surfaces

Only after performance is stable, consider sheets, cards, and larger panels.

### Phase 7 — QA

Run mobile/iOS/accessibility/performance checks.

## Final validation

Before finishing a Liquid Glass task:

- build succeeds
- TypeScript succeeds
- lint succeeds
- no hydration warnings
- no console SVG/filter errors
- no repeated displacement-map regeneration during position-only movement
- no accidental page-sized filters
- no unreadable text
- no pointer interception
- no horizontal overflow
- no scroll bleed through fixed navigation
- no iOS safe-area overlap
- no first-character keyboard dismissal
- no mandatory hover
- dark and light themes both work
- Customer and Business brand accents remain distinct
- reduced motion works
- real iPhone/PWA behavior is tested when available

If physical-device testing is unavailable, state that explicitly rather than claiming iOS validation.

## Output when completing implementation work

Report:

1. glass engine/package and version used
2. components migrated
3. presets added/changed
4. Safari/iOS decisions
5. performance decisions
6. fallback behavior
7. validation commands run
8. physical-device testing status
9. remaining limitations

Read the bundled references when the task touches those areas:

- `references/implementation-notes.md`
- `references/component-recipes.md`
- `references/mobile-ios-qa.md`
- `references/sources.md`
