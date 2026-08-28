# Card Resize

Use only when the same surface has explicit known sizes in two states and animating the size makes continuity clearer.

## Caution

Animating `width` and `height` can trigger layout work. Prefer natural layout/reflow or transform-based techniques when they communicate the relationship equally well.

## Avoid when

- the component height is content-driven and unpredictable
- the resize causes neighboring content to thrash
- the only goal is decorative softness

Reference implementation: `card-resize.css`.
