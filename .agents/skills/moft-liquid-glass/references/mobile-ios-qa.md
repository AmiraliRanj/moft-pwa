# Mobile / iOS QA

MOFT is mobile-first. Liquid Glass changes must be tested primarily on iPhone behavior.

## Device priority

1. iPhone Safari
2. installed iOS PWA
3. Android mobile
4. iPad
5. desktop

## Viewports

Test at minimum:

- 320×568
- 375×667
- 375×812
- 390×844
- 393×852
- 414×896
- 430×932
- 768×1024
- 1024×1366
- 1366×1024
- 1440 desktop

## Safe areas

Check:

- top status/Dynamic Island area
- Home Indicator area
- bottom navigation shell
- fixed action footer
- sheet/dialog padding

Use `env(safe-area-inset-*)`.

## Viewport height

Avoid relying only on `100vh`.

Prefer modern dynamic units such as `100dvh` when the visible viewport must follow Safari chrome/keyboard.

## Keyboard

Glass layers and overlays must not:

- dismiss keyboard after the first character
- remount textarea/input
- steal pointer/focus
- close dialog due to visual viewport change
- cover the focused field
- reset cursor position

Test Persian multi-line typing.

## Input zoom

Editable input/textarea text should be at least 16px on iPhone.

Do not disable user zoom.

## Scroll

Check:

- one primary vertical page scroll
- no nested trapped scroll
- fixed bottom nav does not reveal content behind it
- sticky header does not reveal content above/through it
- bottom page padding lets final content scroll fully above nav
- overlays restore page scroll position after close

## Touch

Minimum target: approximately 44×44 CSS px.

Check adjacent destructive/stock buttons for accidental taps.

## Glass performance

During normal scroll and interaction:

- glass must not cause obvious stutter
- avoid simultaneous high-quality filters
- selection lens should move smoothly
- page scrolling should remain responsive

If jank appears, lower the glass budget rather than hiding content or disabling input behavior.

## PWA standalone

Verify:

- start route stays internal
- safe areas
- theme persistence
- no white flash in dark mode
- bottom nav does not overlap Home Indicator
- no browser-only assumptions
- relaunch preserves valid app state

## Reduced motion

With `prefers-reduced-motion`:

- disable lens wobble/squish
- disable long spring travel
- retain a static readable material
- preserve semantic state and focus

## Acceptance statement

Do not claim "tested on iPhone" unless a physical iPhone or real iOS environment was actually used.

If only responsive emulation was available, say so explicitly.
