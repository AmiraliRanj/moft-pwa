# Spinning Counter

Special-purpose motion for a focal numeric value where emphasizing the change itself improves comprehension or delight.

## Missing source controller

The supplied CSS is not a complete implementation. The described JS must:

- build one `.t-reel-col` per digit
- build a `.t-reel-strip` containing digit cells
- translate each strip by `(spins * 10 + digit)` cells
- stagger columns
- optionally apply a vertical-only SVG `feGaussianBlur` and decay its Y deviation to zero as each reel settles

Do not substitute a generic CSS blur if directional vertical streaking is required.

## Avoid when

- numbers update rapidly
- the number is a price/form value/static statistic
- 1.4s animation would slow comprehension

Always show the final value immediately under reduced motion. Reference implementation: `spinning-counter.css`.
