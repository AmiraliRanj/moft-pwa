# Like Button

Treat this as expressive motion. Use for a deliberate positive/reaction action only when playful feedback fits the product tone.

## State contract

Toggle `data-liked` for fill/pop. Add `.is-bursting` temporarily to fire particles. Particle CSS expects per-dot custom properties such as `--px`, `--py`, `--pdur`, `--pdelay`, `--p-end-scale`, and `--psize`.

## Missing source controller

The supplied snippet does not include the original JS that randomizes particle vectors and removes/replays `.is-bursting`. If selected, implement a minimal client-side controller and clean up its timer. Do not generate random values during SSR.

## Avoid when

- the action is generic
- an admin/enterprise context calls for restrained feedback
- the effect would fire repeatedly during rapid interaction

Keep scale on the HTML wrapper rather than the inline SVG to preserve crisp rendering. Reference implementation: `like-button.css`.
