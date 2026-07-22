# AGENTS.md

## Product

Build and maintain **مفت (Moft)**, a Persian RTL marketplace preview for rescuing same-day surplus food and near-expiry grocery items through discounted surprise boxes.

This repository is a university-demo PWA first. Do not silently turn it into a production marketplace. Preserve mock data and clearly label simulated actions unless the task explicitly asks for a real backend.

## Non-negotiable product rules

- The main UI language is Persian and the document direction is RTL.
- The brand name is always `مفت` in Persian UI and `Moft` in code identifiers.
- A surprise box contains unsold items that the merchant may not know in advance.
- Pickup uses a defined time window. Do not imply delivery in the MVP.
- Do not display unsafe, expired, or unfit food as sellable.
- The preview may show a crossed-out reference price and a discounted reservation price.
- Reservations in the preview are simulations and must not process real payments.

## Design direction

Create an Apple-inspired experience without copying Apple screens, trademarks, product artwork, or proprietary assets.

- Use calm hierarchy, generous spacing, system typography, layered blur, subtle depth, rounded geometry, and short physical-feeling motion.
- Keep the brand distinctive: deep pistachio green, warm cream surfaces, coral accents, and a leaf/box symbol.
- Avoid generic dashboard grids, neon gradients, excessive borders, and heavy drop shadows.
- Support light mode first. Dark mode may be added only when every surface remains readable.
- Respect `prefers-reduced-motion`.

## Technical baseline

- Next.js App Router
- TypeScript with strict mode
- React components with minimal client boundaries
- Plain CSS in `app/globals.css` for the starter; do not add a UI framework without a concrete benefit
- No database or authentication in the university preview
- PWA manifest in `app/manifest.ts`
- Service worker in `public/sw.js`
- Vercel-compatible build

## Engineering rules

- Inspect existing components before creating duplicates.
- Keep mock entities typed and centralized.
- Use semantic HTML and accessible buttons.
- Every icon-only control needs an accessible label.
- Interactive targets should be at least 44px where practical.
- Avoid `any`, suppressed TypeScript errors, and hydration workarounds.
- Never commit `.env*`, tokens, private keys, or credentials.
- Do not use destructive Git commands unless the user explicitly asks.
- Do not add analytics, cookies, or tracking to the preview.

## Required checks

Before reporting completion:

```bash
npm run validate
npm run lint
npm run build
```

If dependencies are unavailable, still run `npm run validate` and report exactly which checks could not run.

## Completion standard

A task is not complete when the UI merely renders. Check:

- mobile width around 390px
- desktop width around 1440px
- RTL alignment
- keyboard focus
- reduced motion
- empty/error/offline states when relevant
- PWA manifest and service worker paths
- no misleading production claims

## Code review rules

Flag changes that:

- introduce real payment handling into the mock preview
- sell expired food rather than near-expiry or same-day surplus food
- remove pickup windows
- break RTL or Persian labels
- copy a branded Apple screen too literally
- add large dependencies for trivial UI behavior
- expose secrets or private environment values
