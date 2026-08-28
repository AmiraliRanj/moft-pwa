# Research Sources

## Primary implementation

### liquid-glass-web-react
https://github.com/PallavAg/liquid-glass-web-react

Baseline reviewed: repository main branch, package version 0.1.1.

Reviewed areas:

- README/API
- package metadata
- displacement-map implementation
- engine architecture
- Safari/iOS notes
- open issue #1 (performance)

License reported by upstream package: MIT.

## Engineering reference

### Aave — Building Glass for the Web
https://aave.com/design/building-glass-for-the-web

Important ideas used by this skill:

- `feDisplacementMap` over live content
- displacement map as portable optical representation
- RGB displacement/chromatic fringe
- specular highlight
- quarter-map symmetry
- position movement without map regeneration
- Safari filter ID cache-busting
- Safari filter footprint constraints
- Safari lens-local specular optimization
- WebGL for media/canvas surfaces

## Supplementary implementation

### @samasante/liquid-glass
https://github.com/samasante/liquid-glass

Used as a conceptual supplement for:

- crisp content layer
- copy/refract architecture
- native accessible control shells
- one optical vocabulary for DOM/WebGL
- media/WebGL path
- motion utilities and component examples

Cautions reviewed:

- open issue about WebGL renderer + React StrictMode
- open issue about pixelated edge artifacts

Do not copy source code from supplementary implementations unless the project intentionally vendors or adapts MIT-licensed code and preserves required attribution/license notices.

## Skill format references

OpenAI Skills use a required `SKILL.md` with YAML frontmatter containing `name` and `description`, with optional `references/`, `scripts/`, and `assets/` resources.

OpenAI:
https://openai.com/academy/skills/

OpenAI Codex skill examples:
https://github.com/openai/openai-cookbook/tree/main/.codex/skills
