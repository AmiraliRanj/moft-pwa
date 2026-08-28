# Text States Swap

Use for a short status label changing between meaningful states, such as `Processing…` → `Done` or `Saving…` → `Saved`.

## Controller contract

The supplied CSS requires a three-phase controller:

1. Add `.is-exit` so old text moves up, blurs, and fades.
2. After `--text-swap-dur`, replace the text and apply `.is-enter-start` with no transition.
3. Force layout once, remove `.is-enter-start`, and let the new text transition to rest.

Implement the minimum controller needed for the framework. In React, clean up timers on unmount/state changes.

## Avoid when

- the text is normal copy, a heading, or needs uninterrupted readability
- state can update instantly without losing comprehension

Reference implementation: `text-states-swap.css`.
