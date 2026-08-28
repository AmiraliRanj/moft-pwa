# Checkbox Check

Use for custom checkbox feedback when the product design needs a drawn check stroke.

## State contract

Use a native checkbox where practical, or keep `role="checkbox"` and `aria-checked` synchronized if a custom control is required. Set `--check-len` to the SVG path's `getTotalLength()` rounded up.

## Avoid when

- native/shadcn checkbox behavior and styling are already sufficient
- custom rendering would reduce accessibility or form integration

With shadcn/Base UI, preserve the primitive's semantics/state and adapt the visual check element rather than replacing behavior. Reference implementation: `checkbox-check.css`.
