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

## Spacing rules

Follow an Apple-inspired 8pt grid with 4px half-steps:
- **Screen gutters**: 16px (`px-4`) on mobile, expanding up to 24px (`sm:px-6`) on desktop.
- **Section rhythm**: 16px (`space-y-4` or `gap-4`) between major content blocks.
- **Card containers**: 12px to 14px (`p-3` or `p-3.5`) inner padding.
- **Component elements**: 8px (`gap-2`) between related inner elements; 4px–6px (`gap-1` / `gap-1.5`) for badges, icons, and micro-labels.
- **Structural strictness**: Structural containers, grids, and lists must strictly use standard increments (4, 8, 12, 16, 24, 32px); fine optical adjustments (e.g. 6px or 14px) are allowed only for tags, chips, and micro-interactions.

## Sizing and touch target rules (UX standards)

Follow Apple Human Interface Guidelines and WCAG touch target standards:
- **Interactive touch targets**: Minimum 44×44px (`min-h-[44px] min-w-[44px]` or 44px tap container) for all primary buttons, icon controls, and navigation triggers.
- **Header frame height**: Header container height must be at least 56px (`min-h-[56px]`, `py-3`), providing comfortable vertical breathing room above page content.
- **Header action icons**: Top navigation and primary action icons (e.g. cart, back, profile) use 24×24px (`w-6 h-6`) visual size centered inside a 44×44px touch area.
- **Header address and titles**: Location selector and tab titles use `text-sm sm:text-base font-black`, with icon sizes between 18px and 20px (`w-4.5 h-4.5` / `w-5 h-5`) and a minimum 44px touch height.
- **Counter and status badges**: Badges on icons use minimum 18×18px to 20×20px (`w-5 h-5`), with legible bold numbers (`text-[10px]` / `text-[11px] font-black`) and clean separation border against the background.
- **Search bar inputs**: Form inputs and search bars use a minimum height of 44px to 48px (`h-11` or `h-12`) with rounded-2xl geometry.
- **Structural borders**: Avoid unnecessary horizontal separator borders underneath floating or sticky glass headers; rely on blur, background contrast, and subtle elevation.


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
