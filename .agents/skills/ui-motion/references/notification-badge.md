# Notification Badge

Use when a badge/dot/count meaningfully appears or disappears on a stable trigger such as a notification bell.

## State contract

Toggle `data-open="true"` / `"false"` on `.t-badge`. The trigger itself should stay still and be `position: relative`.

## Avoid when

- the badge is always present
- counts update continuously and every update would replay motion

## Integration notes

- Badge content/count must remain accessible through surrounding semantics if it conveys important information.
- Tune top/right anchoring to the actual trigger geometry.
- Reference implementation: `notification-badge.css`.
