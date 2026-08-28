# Plus to Menu Morph

Use only when a compact action trigger genuinely expands into a directly related local menu/surface and the morph explains that spatial relationship.

## State contract

Toggle `data-open` on the container and keep `aria-expanded` synchronized on the trigger.

## Avoid when

- a standard popover/dropdown/menu is clearer
- the menu is complex or focus management would be compromised
- fixed 183×172 geometry does not fit the content; adapt dimensions rather than clipping content

Preserve the project's menu semantics and keyboard behavior. Motion must decorate a correct menu implementation, not replace one. Reference implementation: `plus-menu-morph.css`.
