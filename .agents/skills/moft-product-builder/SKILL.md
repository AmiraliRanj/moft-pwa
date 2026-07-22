---
name: moft-product-builder
description: Build or extend the Persian RTL Moft surplus-food marketplace preview, including surprise boxes, pickup windows, mock reservations, product flows, and university-demo scope. Use for product features in this repository; do not use to add real payments or production backend unless explicitly requested.
---

# Moft product builder

Read `AGENTS.md`, `PROJECT_BRIEF.md`, and the relevant files in `docs/` before editing.

## Workflow

1. Identify whether the request belongs to the university preview or the future production roadmap.
2. Preserve mock behavior unless production work is explicit.
3. Reuse the typed offer and reservation models.
4. Implement the smallest complete user flow, not isolated decorative UI.
5. Include loading, empty, disabled, success, and offline behavior where relevant.
6. Validate Persian copy, RTL layout, pickup windows, quantity, and the Surprise Box explanation.
7. Run `npm run validate`, `npm run lint`, and `npm run build`.

## Product acceptance criteria

- A user can understand what they receive and what remains unknown.
- A user sees where and when pickup happens before reserving.
- No screen implies expired or unsafe food is being sold.
- Preview actions are visibly simulated.
- No real payment data is requested.

## Avoid

- delivery-first flows
- food delivery map clones
- fake scarcity without a quantity field
- hiding allergen uncertainty
- adding a backend only to persist demo state
