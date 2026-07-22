---
name: pwa-vercel-release
description: Validate and prepare the Moft Next.js PWA for Vercel, including manifest, icons, service worker, offline fallback, production build, metadata, and deployment instructions. Use for release readiness; do not perform a production deployment unless explicitly asked.
---

# PWA and Vercel release

## Checks

1. Read `docs/PWA_AND_VERCEL.md`.
2. Verify manifest name, short name, direction, theme colors, display mode, start URL, and icons.
3. Verify service worker registration is client-only and does not break development.
4. Verify offline navigation reaches `/offline`.
5. Ensure service-worker cache names are versioned.
6. Run `npm run validate`, `npm run lint`, and `npm run build`.
7. Confirm there are no secrets or real environment values in Git-tracked files.
8. Do not run `vercel --prod` without explicit user instruction.

## Report

Return:

- build status
- PWA status
- remaining limitations
- exact preview and production deployment commands
