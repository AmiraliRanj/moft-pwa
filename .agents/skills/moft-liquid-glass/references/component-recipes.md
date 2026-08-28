# Component Recipes

These are design/engineering recipes, not mandatory component APIs.

## 1. Moving segmented selection

Best use of the effect.

Structure:

```text
segmented container
  normal labels/buttons
  one moving glass selection lens
```

Rules:

- only one optical lens
- labels remain crisp
- `aria-pressed` / selected semantics remain on buttons
- move lens imperatively where possible
- spring motion only when reduced motion is off

## 2. Switch

Structure:

```text
semantic checkbox/switch
  track
  moving glass thumb
```

Rules:

- 44px minimum touch target
- state readable without color/refraction
- white/near-white icon or thumb contrast in dark mode
- do not use a lens so strong that the track state becomes ambiguous

## 3. Slider

Use softer refraction than a decorative lens.

Rules:

- native `input[type=range]` or accessible equivalent remains authoritative
- glass handle can follow the native value
- keyboard arrows work
- visible numeric value remains crisp
- reduce refraction strength

## 4. Mobile bottom navigation

Preferred MOFT pattern:

```text
opaque safe-area shell
  localized glass nav surface
    one glass active-selection lens
    crisp icons + labels
```

The outer shell must fully mask scrolling content.

Do not refract the entire scrolling page.

## 5. Sticky topbar

Preferred pattern:

```text
opaque sticky wrapper from viewport top
  rounded material topbar
    small glass controls / selected branch
```

No transparent gap above the topbar.

## 6. Floating action button

A good strong-glass candidate because it is small and isolated.

Requirements:

- crisp icon
- clear high-contrast text when text exists
- static shadow/tint supports the optical effect
- avoid full-page filter source

## 7. Modal / sheet

Do not make the entire form optically distorted.

Use:

- subtle glass header
- subtle edge/material
- opaque readable body
- crisp form fields
- safe-area-aware bottom actions

## 8. Cards

Use strong glass only for special cards.

Ordinary repeated offer/order cards should remain mostly neutral.

Possible glass accents:

- status lens
- selected card
- CTA
- hover/focus halo on desktop

## 9. Dropdown / select

Use glass for:

- trigger chrome
- selected item indicator

Keep menu text and options crisp.

Do not put an expensive independent SVG filter on every option row.

## 10. Charts

Do not refract the plot itself.

Possible use:

- selected range pill
- tooltip shell
- metric selector

Chart values must remain clear.

## 11. QR / video

Ordinary DOM SVG glass is not the correct renderer for Safari live video.

Use a dedicated media path only if the product benefit justifies it.

Never compromise QR scan reliability for decorative distortion.
