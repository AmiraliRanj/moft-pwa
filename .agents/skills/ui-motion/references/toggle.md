# Toggle

Use for a true binary switch. The bounce should remain subtle because switches can be used frequently.

## State contract

The reference uses `data-on`; if the element uses `role="switch"`, synchronize `aria-checked` with the same state. `.is-init` prevents the off animation from playing on cold load.

## Avoid when

- the interaction is not binary
- a checkbox better matches the semantics

With shadcn/Base UI, preserve the switch primitive and adapt the thumb/track motion rather than introducing a second independent state. Reference implementation: `toggle.css`.
