# Toast Open / Close

Use for transient, non-blocking feedback that does not require a decision.

## State contract

The actual supplied CSS uses `.is-open` on `.t-toast` (despite the original usage comment mentioning `data-open`). Integrate with the state API of the project's toast primitive rather than adding duplicate state systems.

## Avoid when

- the user must acknowledge a warning
- a destructive/irreversible action needs confirmation
- feedback belongs inline next to the affected control

When using shadcn/Base UI, preserve its accessibility/lifecycle and apply this motion to the appropriate toast surface rather than rebuilding toast behavior. Reference implementation: `toast.css`.
