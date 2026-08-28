# Skeleton Loader + Reveal

Use for reserved loading placeholders that transition into loaded content without layout shift.

## State contract

- Skeleton can mount with `.is-pulsing`.
- Add `.is-revealed` to `.t-skel` when content is ready.
- For replay without reverse animation: add `.is-resetting`, remove `.is-revealed`, force one reflow, then remove `.is-resetting`.

## Caution

Both layers are absolutely positioned. The wrapper must have a reliable reserved footprint or another layout technique must be used; otherwise content can collapse.

## Avoid when

- loading is so short that a skeleton flashes
- final dimensions are not predictable
- a normal spinner/status is clearer

Reference implementation: `skeleton-reveal.css`.
