# Shimmer Text

Use sparingly for active generation/planning/thinking copy where a subtle continuous indicator improves perceived activity.

## Contract

Visible text must be duplicated into `data-text` so the pseudo-element can clip the moving highlight to the same glyphs. Keep them synchronized if text changes.

## Avoid when

- normal labels/headings are static
- loading can be represented more clearly with skeleton/spinner/progress
- the continuous animation would remain onscreen for long periods without value

Use product theme tokens instead of the reference gray colors. Reference implementation: `shimmer-text.css`.
