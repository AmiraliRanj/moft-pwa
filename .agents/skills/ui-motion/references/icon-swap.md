# Icon Swap

Use for two visual states of the same control: menu/close, play/pause, mute/unmute, favorite/unfavorite, sun/moon.

## State contract

Set `data-state="a"` or `data-state="b"` on `.t-icon-swap`. Both icons occupy the same grid cell, so the swap should not cause layout shift.

## Use when

- the icon change confirms a real control state
- preserving spatial continuity helps the user understand that the control is the same

## Avoid when

- the icons represent unrelated actions
- the control changes so rapidly that animation becomes visual noise

## Integration notes

- Keep the parent button's accessible name correct; do not rely on the icon alone.
- In React, derive `data-state` from component state.
- Preserve crisp SVG rendering and avoid scaling huge raster icons.
- Reference implementation: `icon-swap.css`.
