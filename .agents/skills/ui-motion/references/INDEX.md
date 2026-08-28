# UI Motion Pattern Index

Choose by interaction semantics, not by visual novelty.

| Pattern | Use for | Frequency / intensity | Avoid when |
|---|---|---|---|
| Icon Swap | menu/close, play/pause, mute/unmute, state icon replacement | frequent / subtle | icons do not represent the same control state |
| Text States Swap | Processing → Done, Saving → Saved | frequent / subtle | static copy or text that must remain continuously readable |
| Notification Badge | arrival/removal of a badge/dot/count | occasional / noticeable | badge is permanently present or changes rapidly |
| Card Resize | one surface changing explicit size between states | occasional / noticeable | content can naturally reflow without needing continuity |
| Skeleton Reveal | loading placeholder → loaded content | occasional / noticeable | dimensions are unknown and absolute stacking would collapse layout |
| Toast Open/Close | transient non-blocking feedback | occasional / noticeable | user must acknowledge or decide something |
| Checkbox Check | checkbox state feedback | frequent / subtle | native styling already matches the design and no custom draw is needed |
| Toggle | switch thumb movement | frequent / subtle | interaction is not binary |
| Success Check | important completion confirmation | rare / expressive | every tiny action or autosave |
| Number Pop-in | newly appearing/replaced digits | occasional / expressive | static numbers or rapidly updating values |
| Plus to Menu Morph | compact trigger expanding into a related menu surface | rare / expressive | a normal popover/menu communicates structure better |
| Shimmer Text | active generation/planning/thinking state | special-purpose | decorative headings, labels, or normal content |
| Like Button | playful positive reaction | special-purpose | generic buttons, enterprise/admin controls |
| Spinning Counter | meaningful numeric change where the number itself is focal | special-purpose | prices, form fields, rapidly changing metrics |
| Matrix Dot Loader | compact branded loading indicator | special-purpose | skeleton/spinner is clearer or loading is very short |

## Missing original controllers

The supplied snippets describe but do not include the original JS controller for:

- Text States Swap
- Like Button particle randomization/replay
- Spinning Counter reels + directional SVG blur decay
- Matrix Dot Loader construction/delay tables
- Number Pop-in replay helper

Codex may implement a minimal controller from the documented contract when the pattern is selected. If exact Transitions.dev JavaScript becomes available later, add it as a reference instead of approximating it.
