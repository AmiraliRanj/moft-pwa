---
name: apple-like-rtl-ui
description: Design and review refined Apple-inspired Persian RTL interfaces for Moft using system typography, translucent layers, rounded geometry, calm motion, accessibility, and independent branding. Use for UI polish and responsive interaction work; do not copy Apple screens or proprietary assets.
---

# Apple-inspired RTL UI

## Before editing

- Inspect `docs/DESIGN_SYSTEM.md`.
- Check the current page at mobile and desktop widths.
- Prefer improving existing primitives over introducing a component library.

## Visual principles

- One obvious primary action per state.
- Use whitespace before adding dividers.
- Keep shadows subtle and borders translucent.
- Use blur only on surfaces that conceptually float.
- Use the brand palette, not generic iOS blue.
- Keep card information scannable in Persian RTL.

## Interaction principles

- Minimum practical target: 44px.
- Visible keyboard focus.
- Bottom sheets trap attention but remain dismissible.
- Motion should explain hierarchy and respect reduced motion.
- Avoid hover-only information.

## Review checklist

- Persian punctuation and number alignment
- no clipped long merchant names
- no layout shift when counts change
- readable contrast on tinted cards
- safe-area padding for fixed bottom navigation
- no horizontal overflow at 320px
