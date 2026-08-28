# Success Check

Use for an important action that has clearly completed: reservation submitted, checkout completed, upload finished, or another completion where explicit confirmation is useful.

## State contract

Cold state is `data-state="out"`. Set `data-state="in"` to run fade + rotate + blur + Y-bob and SVG stroke draw in parallel. The supplied snippet is an appear transition only.

## Use when

- completion is meaningful and deserves explicit feedback
- the success state might otherwise be ambiguous

## Avoid when

- autosave or tiny preference changes happen frequently
- a normal inline state or toast already communicates success clearly

## Integration notes

- Set the SVG path length accurately via `getTotalLength()` or an appropriate CSS variable/adaptation; the reference hardcodes `20`.
- Provide hide/unmount behavior appropriate to the component.
- Reduced-motion integration should preserve state semantics: do not reveal an `out` success icon merely because motion is reduced. The source CSS forces visibility in the media query, so correct this when integrating if `out` must remain hidden.
- Reference implementation: `success-check.css`.
