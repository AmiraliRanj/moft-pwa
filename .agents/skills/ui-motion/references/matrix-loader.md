# Matrix Dot Loader

Special-purpose compact loader. Use when a branded dot-matrix loading treatment fits the surface better than a skeleton or conventional spinner.

## Missing source controller

The supplied snippet describes JS that builds 16 dots and assigns `--d` delay values. Supported described variants:

- scan: column-based delay
- twinkle: order `[7,2,11,5,14,9,0,12,3,15,6,10,13,1,8,4]`
- orbit: ring `[1,2,7,11,14,13,8,4]`, center steady
- pulse: inner `[5,6,9,10]` first, outer dots delayed
- rounded variants: mark corners `[0,3,12,15]` with `.is-gap`

Implement only the chosen variant. Do not create every variant if the product uses one.

## Avoid when

- loading is extremely short
- skeleton/progress communicates expected wait better
- an infinite animation would be distracting

Use design-system colors instead of the reference gray values. Reference implementation: `matrix-loader.css`.
