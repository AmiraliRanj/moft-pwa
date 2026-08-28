# Number Pop-in

Use when a newly appearing/replaced numeric value deserves a small emphasis and the digits themselves are meaningful.

## Replay contract

Remove `.is-animating`, update/re-render digits, force one reflow, then re-add `.is-animating`. `data-stagger` adds per-digit delay. Direction is controlled by unitless `--digit-dir-x` / `--digit-dir-y`.

## Avoid when

- values update rapidly
- numbers are static labels, prices, or ordinary form values
- animation would make comparison harder

Reference implementation: `number-pop-in.css`.
