---
name: ui-motion
description: Apply restrained UI motion and micro-interactions for state changes, feedback, loading, notifications, numeric changes, and small surface transitions. Use when implementing or refining interface motion; prefer the smallest matching reference and do not animate merely because a pattern exists.
---

# UI Motion

Use this skill to add purposeful interface motion without turning the product into an animation showcase.

## Core principle

Motion must have a job. Use it only when it improves at least one of:

- state communication
- interaction feedback
- spatial continuity
- perceived responsiveness
- loading comprehension
- confirmation of an important action

Prefer no animation over unnecessary animation.

## Selection workflow

Before choosing a pattern, answer:

1. What state actually changed?
2. Why does the user need to notice it?
3. How frequently does this interaction occur?
4. Is the change reversible?
5. Does motion clarify the relationship between the two states?

Then read `references/INDEX.md` and select the smallest matching pattern.

Do not choose a pattern based only on visual similarity.

## Restraint rules

- Do not animate every interactive element.
- Prefer one dominant motion idea per state change.
- Do not stack unrelated effects such as morph + shimmer + particle burst on one interaction.
- Frequent actions should generally use subtler motion than rare or important actions.
- Do not delay the user's next action for animation.
- Do not animate text the user needs to read immediately unless the transition itself communicates a state change.
- Do not add particles, spinning, shimmer, large bounces, or morphs unless that specific feedback is justified.
- If the current UI already communicates the state clearly, motion is optional.
- When uncertain, choose the simpler transition or no transition.

## Implementation workflow

1. Inspect the existing component, state model, styling system, and installed animation libraries.
2. Reuse an existing project motion pattern if one already solves the interaction well.
3. Otherwise choose a reference from `references/INDEX.md`.
4. Read the selected pattern's `.md` guidance and `.css` source before editing.
5. Adapt class names and framework syntax to the project; preserve the motion behavior unless the product context requires a restrained variant.
6. In React/Next.js, drive persistent UI state through React state/props. Avoid imperative DOM mutation when declarative state is sufficient.
7. Do not introduce Framer Motion, Motion, GSAP, or another dependency solely for a small CSS interaction when the reference can be implemented cleanly in CSS.
8. Preserve or improve semantics and accessibility. Motion must never replace state conveyed through ARIA, text, or native semantics.
9. Respect `prefers-reduced-motion` and make the reduced-motion state semantically correct, not merely animation-free.
10. Test both directions, rapid toggles, keyboard interaction, and state changes during animation.

## Accessibility requirements

- Buttons remain buttons; checkboxes/switches expose real or ARIA state.
- Keep `aria-checked`, `aria-expanded`, `aria-live`, labels, and disabled state synchronized with visual state where applicable.
- Decorative icons may use `aria-hidden="true"`; meaningful state cannot rely only on animation.
- Reduced motion must preserve visibility/state correctness.
- Do not trap focus or delay focus movement for animation.

## Performance rules

Prefer `transform`, `opacity`, and carefully-scoped `filter` animations.

Treat these as higher-cost and use deliberately:

- `width` / `height` transitions
- large blur radii
- many simultaneous filters
- continuously running animations
- large particle counts

Do not add `will-change` globally. Keep it scoped to elements that actually animate.

## Framework adaptation

### React / Next.js

- Use component state for toggles and open/closed states.
- Clean up timers used for replay/burst sequences.
- Avoid hydration differences caused by random animation values generated during server render.
- Generate random particle vectors only on the client after interaction.

### Tailwind / shadcn

- Keep shadcn/Base UI behavior and accessibility intact.
- Motion references may live in CSS when forcing them into utility classes would reduce clarity.
- Apply product design tokens for color, radius, material, and typography separately from motion.
- Do not use motion to compensate for an incorrect component choice.

## Verification checklist

Before finishing a motion change, verify:

- the motion has a clear UX purpose
- the chosen pattern is the smallest suitable one
- enter/open works
- exit/close works when the interaction needs it
- rapid state changes do not leave stale classes/timers
- no unexpected layout shift occurs
- keyboard behavior is unchanged or improved
- ARIA/native state matches visual state
- reduced-motion behavior is correct
- no unnecessary animation dependency was added
- existing Liquid Glass/design-system styling remains intact unless explicitly changed

## Source fidelity

The files under `references/` are based on user-provided Transitions.dev snippets. Some references describe a JavaScript orchestration contract but did not include the original JavaScript implementation. In those cases, implement only the minimum controller required by the documented state sequence; do not invent extra flourish.
