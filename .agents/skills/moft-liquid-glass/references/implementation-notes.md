# Implementation Notes

## Primary engine: liquid-glass-web-react

Repository:
https://github.com/PallavAg/liquid-glass-web-react

Baseline inspected: v0.1.1.

Why it is the default MOFT DOM engine:

- React 18+ peer dependency.
- Zero runtime dependencies.
- Uses a generated displacement map.
- Uses SVG `feDisplacementMap` on painted live DOM.
- Text stays selectable and links remain clickable.
- Moving lens position uses a fast imperative update path.
- Displacement map is regenerated on shape/surface changes rather than position-only movement.
- Four-fold symmetry reduces map computation.
- Includes Safari/iOS-specific handling.
- Exposes low-level displacement-map functions.

### Important upstream behavior

The map:

- red channel: horizontal displacement
- green channel: vertical displacement
- blue channel: baked highlight/specular mask
- alpha: exact lens shape

The engine:

- performs RGB-separated displacement passes for chromatic aberration
- supports optional blur
- composites specular highlight
- uses lens-shaped clipping
- uses a fresh filter ID on Safari updates
- uses `userSpaceOnUse` on iOS
- warns on large Safari filtered surfaces

## Known risk: performance

There is an open upstream GitHub issue reporting severe lag on a high-end Android phone and modern laptop.

Therefore:

- do not assume "small bundle" means cheap rendering
- do not default every glass surface to `quality=512`
- do not create a filter per card/list item
- measure scrolling and touch interaction
- use a conservative mobile quality profile
- retain a static material fallback

## Aave engineering principles worth keeping

Reference:
https://aave.com/design/building-glass-for-the-web

Key rules:

1. Refraction is driven by a displacement map.
2. Live DOM remains live and interactive.
3. Map regeneration follows geometry changes, not position changes.
4. Quarter-map symmetry reduces generation cost.
5. Safari needs filter-cache invalidation.
6. Safari has a source-graphic size ceiling.
7. Safari can use a cheaper lens-local specular pass.
8. The displacement map is portable across renderers.
9. For canvas/video, use a renderer appropriate to the medium (WebGL).
10. Component behavior matters as much as optics: switch, slider, toggle group, QR, video controls should each use the glass differently.

## Supplementary reference: @samasante/liquid-glass

Repository:
https://github.com/samasante/liquid-glass

Useful ideas that the MOFT skill borrows conceptually:

- keep crisp child content above refraction
- separate material from semantics
- accessible copy-owned component shells
- motion values / imperative animation
- one optical vocabulary across DOM and WebGL
- WebGL path for video/canvas
- native semantic inputs for switch/slider shells

Do not automatically replace the primary DOM engine with this package.

Known caution from its open issues:

- a WebGL StrictMode teardown issue has been reported
- pixelated edge artifacts have been reported in Chromium

If evaluating this package for media/WebGL, test the exact React/StrictMode environment first.

## Practical architecture

Recommended local wrapper:

```tsx
"use client"

import { LiquidGlass } from "liquid-glass-web-react"

export function GlassLens({ preset, children, ...props }) {
  const optics = resolveGlassPreset(preset)

  return (
    <LiquidGlass {...optics} {...props}>
      {children}
    </LiquidGlass>
  )
}
```

Do not expose dozens of raw numbers across app callsites.

Prefer:

```tsx
<GlassLens preset="selection" />
```

over one-off numeric configurations unless a component genuinely needs them.

## Performance profile idea

A project-local hook can choose a conservative profile after hydration:

```ts
type GlassPerfProfile = "low" | "balanced" | "high"

function getGlassQuality(profile: GlassPerfProfile) {
  if (profile === "low") return 192
  if (profile === "balanced") return 256
  return 384
}
```

Avoid using User-Agent alone as the performance classification.

Possible inputs:

- viewport size
- reduced motion
- device memory when available
- measured interaction/rendering result
- explicit developer override

Do not run continuous expensive performance probes.

## Fixed navigation

Optical glass and content masking are different requirements.

Use an opaque shell:

```text
fixed opaque shell
  glass selection lens
  crisp nav labels/icons
```

Do not make scrolling text visible behind the navigation just because the inner material is glass.

## Forms

Do not refract editable text.

Use glass around:

- focus chrome
- selected state
- field group background, very subtly

Keep actual input/textarea content crisp.

On mobile use editable font-size >=16px.

## When not to use the effect

Do not apply strong refraction to:

- long tables
- dense financial numbers
- every analytics card
- long paragraphs
- repeated list rows
- scrolling article surfaces
- form text
- error messages

Use neutral/opaque surfaces to preserve visual hierarchy.
