# Dibz — Collectible Achievement Cards

**Visual prototype system v1** — one persistent card per achievement, five stages, never replaced, only evolved.

This folder is a self-contained design prototype. Open `index.html` in a browser (or serve the folder statically) and every card you see is drawn live as **procedural SVG from a JSON config** — no images, no build step, no app code touched.

```
design/dibz-achievement-cards/
├── index.html      ← page shell (families, edition lab, reveal demo)
├── prototype.css   ← page chrome, tilt/glare, reveal, SVG keyframes
├── cards.js        ← 15 card configs + edition palettes (the "data")
├── layers.js       ← SVG layer kit: paper, frames, stamps, characters, props
└── scenes.js       ← 15 art-directed compositions + renderer + page boot
```

---

## 1. Product philosophy

The system rewards **confirmed food-rescue behavior** and makes that behavior feel collectible.

Collectibility comes from: visual evolution, story, editions, progress, ownership history, milestone meaning. It deliberately does **not** come from:

- loot boxes, random drops, or gambling loops
- artificial scarcity with no purpose
- streaks that punish a normal day off
- incentives to over-order or fake bookings

Every tier threshold maps to real confirmed pickups or real tenure. Editions are issued for real moments (seasons, city launches, restaurant collaborations), never minted procedurally.

---

## 2. The two axes

| Axis | Question it answers | Changes |
|---|---|---|
| **Tier** (Locked → 1 → 2 → 3 → Final) | *How has this card grown with me?* | Illustration, composition, frame, background, props, effects |
| **Edition** (Base, Midnight, Newspaper, Bazaar, Neon, Winter…) | *Which printing of my card is this?* | Palette-level recolor of the whole stack + one overlay layer |

The critical rule: **a tier upgrade must be obvious with the tier number hidden.** Numbers, border colors and star counts are never the mechanism — the actual illustration and composition evolve (§4).

---

## 3. Card anatomy — the 12-layer stack

Every card is composed bottom-to-top from the same named layers. In SVG each is a `<g>` with a stable id so production code can address them independently (also the basis for hover parallax depths).

| # | Layer | SVG group | Depth (hover parallax) |
|---|---|---|---|
| 1 | Paper substrate | `g.paper` | 0 |
| 2 | Background | `g.bg` | 0.2 |
| 3 | Environmental props | `g.props-far` | 0.3–0.55 |
| 4 | Character body | `g.char-body` | 1.0 |
| 5 | Face | `g.char-face` | 1.05 |
| 6 | Limbs (noodle arms, gloves, shoes) | `g.char-limbs` | 1.1 |
| 7 | Accessories (receipt, bag, drum…) | `g.accessories` | 0.85 |
| 8 | Frame | `g.frame` | 0.05 |
| 9 | Stamps & seals | `g.stamps` | 0.9 |
| 10 | Typography | `g.type` | 0.15 |
| 11 | Texture (grain, halftone, vignette) | `g.texture` | 0 |
| 12 | Edition overlay + special effects | `g.fx` | 1.2 |

Texture is always last-but-one so print imperfection sits **over** the art — the cards should feel *printed*, not *rendered*.

---

## 4. Tier grammar (the 5-stage contract)

Each stage has a fixed job. A family scene that doesn't do these jobs fails review.

| Stage | Job | Frame | Background | Props | Effects |
|---|---|---|---|---|---|
| **Locked** | Tease. Mostly silhouette + one glowing hint. Beautiful even unowned. | `locked_seal` — dashed cut-line, punched corners, kraft tint | Unprinted kraft, halftone patch | 1 silhouette prop + «؟» | none |
| **Tier 1** | The character appears. Timid, small story. | `cardboard_01` — plain rounded frame, single inner rule | Flat horizon line, 1–2 accents | 1–2 | none |
| **Tier 2** | The pose gets confident; a signature prop appears. | `coupon_02` — punched side perforations, dashed inner rule | Horizon + skyline/sun band | 3–5 | first ink stamp |
| **Tier 3** | A second character joins; the scene becomes a place. | `ticket_03` — perforated stub with No. + barcode | Full environment (street, sunset, lights) | 5–8 | rosette III + rubber stamp |
| **Final** | The legend. Dramatic composition, premium frame, living card. | `foil_final` — scalloped gold (or navy) ring, corner stars, ribbon banner | Largest environment, gold-hour/night drama | 8+ incl. hidden details | gold seal, foil sweep, ambient animation |

**Hidden details** appear only at Final (a snail in a Dibz cap, a waistcoat mouse with a pocket watch, a tiny Dibz storefront). They exist to be discovered and posted about.

---

## 5. Visual language

**1930s rubber-hose kit (all original):**

- **Pie-cut eyes** — ink circle with a paper wedge cut toward upper-right. Variants: open, happy (arc), shock (ring), wink.
- **White gloves** — round mitt, three stitch lines, cuff band. Every hand, even crowd hands, wears them.
- **Simple two-tone shoes**, no laces.
- **Noodle limbs** — single-stroke quadratic curves, round caps, no elbows or knees.
- **Expressions via brows + mouth library**: smile, open grin (with tongue), determined flat, worried, ooh.
- Characters face LEFT by default — forward motion reads right-to-left in this Persian product.

**Print imperfection (what keeps it from looking vector-clean):**

- **Misregistration** — key shapes and the title get a duplicate offset (2, 1.5px) in accent color at ~50% multiply.
- **Halftone** — two dot patterns (fine 5.5px, coarse 9px) used for shadows, locked-card patches, ground shading.
- **Paper grain** — fractal-noise filter over the whole card at ~10% multiply.
- **Vignette** — soft radial edge darkening.
- **Seeded irregularity** — ray angles, confetti positions and stamp rotations come from `mulberry32(seed)`, so a card is deterministic, never random-looking twice.

**Palette tokens (Base edition):**

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F6ECD9` | card substrate |
| `paperShade` | `#EADFC6` | panels, stubs, locked tint |
| `ink` | `#2E2418` | outlines, text (all outlines 3px, round joins) |
| `accent / accent2 / accentDeep` | `#F87F45 / #FDA74D / #E2622F` | Dibz orange system (brand) |
| `green / greenDeep` | `#3E7350 / #2F5B3E` | secondary print color (stamps, hills) |
| `gold` | `#E9B94E` | foil, clocks, cheese |
| `red` | `#DF5A3A` | rubber stamps, ribbons |
| `blue` | `#8FB6CE` | rare cool accent (sweat, night) |

**Typography:** Vazirmatn (Persian — 800 titles, 700 stats, 500 sub) · Alfa Slab One (Latin display: DIBZ wordmark, tier numerals) · Oswald (small Latin caps: `No. 07`, collection labels). On-card copy is Persian; card numbers stay Latin like vintage print runs.

---

## 6. Frame library

| id | Stage | Description |
|---|---|---|
| `locked_seal` | 0 | Dashed cut-line border, punched corner holes, inner dashed rule |
| `cardboard_01` | 1 | Solid 3px frame + faint inner rule — "unwrapped" |
| `coupon_02` | 2 | Punched perforation dots along both sides, dashed inner rule |
| `ticket_03` | 3 | Right stub with perforation, rotated `DIBZ No.` print + barcode, art area narrows |
| `foil_final` | 4 | Scalloped gold ring, gold gradient inner stroke, 4 corner stars, ribbon banner |
| `foil_final_navy` | 4 (variant) | Same geometry, navy field, gold strokes — night editions |

Stamps (a separate library): `lockSeal`, `dotStamp` (Tier 1 rosette I), `rubberStamp` («نجات شد» / «فوری!»), `tierRosette` I–III with ribbon tails, `sealStamp` (gold scalloped seal with curved Latin text).

---

## 7. The three prototype families

### 7.1 فرار بزرگ — The Great Escape *(First Rescue)*

**Visual story:** your very first rescue, retold as a prison-break. A pizza slice slips out of a Dibz paper bag with the receipt raised like a victory flag. As your journey grows, the legend of that first escape grows with it.
**Main character:** *Pitz*, a pizza slice — crust beret, three pepperoni buttons, paper-glove hands.
**Tier thresholds:** 1 / 10 / 25 / 50 total rescues (the origin card grows as you keep rescuing).

| Tier | Scene | What changed |
|---|---|---|
| Locked | Sealed bag silhouette, gold seam glow, pizza tip peeking, «؟» | — |
| 1 | Head + arms out of the open bag, timid smile, blush | character appears; cardboard frame; 1 confetto |
| 2 | Full leap above the bag, receipt flag raised, steam, 2 birds | coupon frame; quarter sunburst; skyline dots; «نجات شد» stamp |
| 3 | Cape-sprint on a street, bread-roll friend cheering from the tilted bag, lamp post | ticket frame + stub No. 001; half-sun; 3 birds |
| Final | Summit on a green hill, receipt flag planted like a flagpole, emptied bag below, paper planes, snail in a Dibz cap, hidden date microprint | gold foil frame; 16-ray rotating sunburst; ribbon «افسانه‌ی آغاز»; gold seal; confetti rain |

**Animation possibilities:** rays slow-spin (90s), receipt-flag wave (skewY), confetti drift, paper-plane float, shimmer sweep.
**SVG layer notes:** bag and pizza are separate groups so the upgrade morph can animate the bag shrinking/closing while the pizza scales up; the receipt exists in three variants (peek, flag, cape, flagpole).

### 7.2 علیه ساعت — Against the Clock *(Last-minute rescue)*

**Visual story:** a croissant sprints away from a clock that has grown legs. The pickup window is closing; your gloved hand reaches in at 23:59. Calm speed, not panic.
**Main character:** *Kruv*, a croissant — crescent body, flake segment lines, determined brows. The **user is implied** by a giant gloved hand reaching in from the edge (no avatar).
**Tier thresholds:** 1 / 3 / 7 / 15 last-minute pickups (final 20% of window — real scarcity, real behavior).

| Tier | Scene | What changed |
|---|---|---|
| Locked | Giant silhouette clock, hands at 23:5X, runner-shaped shadow in dust | — |
| 1 | Sprint with dust puffs + crumbs; pocket watch dangles from the frame on a chain | cardboard frame; half-sun setting |
| 2 | The clock **grows legs** and chases, angry brows; croissant glances back, sweat drop | coupon frame; sunset band; 5 speed lines |
| 3 | Big sunset horizon; looming clock; **your gloved hand** reaches in; donut cheers from the street | ticket frame, stub prints «23:59»; shockwave arcs |
| Final | Midnight: stars twinkle, sleepy moon, ornate clock with swinging pendulum, the catch mid-air, warm shop-window glow, waistcoat mouse hidden on the clock ledge | navy foil frame; gold seal «JUST IN TIME»; ribbon «دقیقه‌ی نهایی»; 23:59 tag |

**Animation possibilities:** pendulum swing, hand tick, star twinkle, shimmer. The clock is the antagonist and the tier meter at once — its size/pose tells the story.

### 7.3 رژه نجات — The Rescue Parade *(Rescue milestone)*

**Visual story:** every confirmed pickup is one more character joining the parade. One lonely marcher becomes a street festival — the crowd is literally made of the food you saved.
**Main characters:** the ensemble — Pitz (drum major with baton), Loafy the loaf (drum), Cuppy the coffee cup (cymbals), Donut (float queen), a baguette float.
**Tier thresholds:** 10 / 25 / 50 / 100 confirmed pickups.

| Tier | Scene | What changed |
|---|---|---|
| Locked | Dark stage, single spotlight, paper silhouette holding a baton | — |
| 1 | One marcher, tiny flag, drum on the ground | cardboard frame; 1 confetto |
| 2 | Three marchers + hanging banner «رژه نجات», bunting, cymbals | coupon frame; sunburst behind banner |
| 3 | Street procession: baguette float with donut queen, string lights, balloons, **crowd of gloved hands waving from the bottom edge** | ticket frame + barcode |
| Final | Golden-hour grand parade: full band, storefront with awning (hidden Dibz shop), box-shaped balloon, streamers, spotlights, confetti rain | gold foil frame; ribbon «قهرمان نجات»; gold seal «RESCUE HERO» |

**Animation possibilities:** confetti rain, balloon bob, spotlight beam sway, plane drift. Scale *is* the progression: 1 → 3 → street → city.

### Future families (sketched, not built)

- **کاوشگر — The Explorer** (multi-merchant): a coffee cup with an oversized city map, travel stickers accumulating per tier, neighborhood stamps appearing on the frame itself. Final: the map unfolds off the card edges.
- **دست به دست — Passing It On** (community/referral): a Dibz package passed between a chain of rubber-hose gloved hands; each referral adds a hand. Final: the package is mid-toss between a whole crowd, one hand wearing *your* color.

---

## 8. Deep spec — the strongest family: **The Great Escape**

**Why this one:** every user owns a first rescue, so this is the face of the system; the bag→freedom metaphor gives the clearest five-step visual evolution; one hero = strong silhouette for sharing; the receipt-flag is an ownable icon; and it has the richest animation surface.

### 8.1 Exact composition (Final card, 390×560 art board)

| Element | Position | Notes |
|---|---|---|
| Sunburst | cx 195, cy 236, r0 56, r1 172, 16 rays, gold @50% | slow 90s rotation, ray angles jittered ±3.4° by seed |
| Inner glow | circle r 92, gold @22% | sits under character |
| Hill | quad curve from (30,398) to (360,398), peak ~y292 | `green` @85% + coarse halftone @40% |
| Pizza (summit pose) | x 195, y 262, scale 1.35 | legs apart, left arm up on pole, right fist on hip |
| Receipt flag | pole base x 152, y 224, pole 54, cloth 34×40, waving | jagged bottom edge, 3 dashed "print" lines |
| Emptied bag | x 304, y 366, scale 0.78, rot 10° | story echo of Tier 1–3 |
| Paper planes | (78,136) (288,108) (244,74) | 6.5s float loop |
| Snail + Dibz cap | x 74, y 384 | hidden detail №1 |
| Date microprint | x 288, y 330, 7px | hidden detail №2 — the user's real first-rescue date |
| Confetti | 14 pieces seeded, fall loop | full art box |
| Ribbon banner | cx 195, cy 392, «افسانه‌ی آغاز» | red, folded tails |
| Gold seal | cx 322, cy 88, r 27, «★ DIBZ ★ / FIRST RESCUE» | scalloped, rot −8° |

Header: «مجموعه دیبز» right · `No. 01` left (Oswald). Title 25px/800, sub 13px/500, stats chip 200×27 dashed pill («۵۰ نجات • درجه نهایی»).

### 8.2 Typography direction

- Titles: Vazirmatn 800 — friendly-round Persian that still prints like a poster.
- Numbers on stamps/chips: Persian digits in-product; Latin numerals only for the collectible `No.` and run prints (vintage packaging convention).
- Curved seal text: Latin small caps (Oswald, letter-spacing 2px) — reads as "imported stamp", contrast against Persian art.

### 8.3 Character description — Pitz (production sheet)

- Body: cheese wedge, width 66 → tip at +49 local; fill `gold`, 3px ink outline.
- Crust: band across the top with a slight arc, fill `accentDeep`, 2.6px outline — reads as a beret.
- Pepperoni: three `red` circles r4.6 (two "cheeks", one low) — doubles as blush anchor.
- Face at local (0,−2): pie eyes r5 (wedge cut to panel color), mouth library per mood; blush r3 `red`@50%.
- Limbs: 3.4px ink strokes; gloves r7.4 with 3 stitch lines + cuff; shoes 8×4.6 ink ellipses with paper spat line.
- Pose library: `sealed, peek, flag_leap, cape_sprint, summit_flag, march` — each an explicit arm/leg endpoint table (see `layers.js → CH.pizza`).

### 8.4 Texture treatment

Order is fixed: art → misregistration ghosts → grain (10% multiply) → vignette. Misregistration applies to: character body outline, title text, stub wordmark. Locked cards get kraft tint + coarse halftone patch so "unprinted stock" reads instantly.

### 8.5 SVG group tree (Final card)

```
svg.card-svg
├─ defs (grain filter, halftone patterns ×2, gradients: sky/dibz/foil/shine, art clip)
├─ g.paper
├─ g.frame-underlay        (gold scallop ring + paper panel — foil frames only)
├─ g[clip=art]
│  ├─ g.bg                 (sky gradient, stars, sunburst.a-spin, glow)
│  ├─ g.props-far          (clouds, planes.a-drift, bag)
│  ├─ g.char               (pizza: body / face / limbs)
│  ├─ g.accessories        (receipt.a-flag, ribbon)
│  └─ g.fx                 (confetti.a-fall ×14, snail, microprint)
├─ g.frame                 (gold strokes, corner stars)
├─ g.type                  (header, title, sub, stats chip)
├─ g.stamps                (gold seal)
├─ g.fx-overlay            (shine sweep .a-shimmer, clipped)
└─ g.texture               (grain, vignette)
```

### 8.6 JSON configuration (production contract `dibz.card/1`)

```json
{
  "schema": "dibz.card/1",
  "achievementId": "first_rescue",
  "tier": 4,
  "edition": "base",
  "seed": 4217,
  "issuedAt": "2026-10-03",
  "art": {
    "frame": "foil_final",
    "character": "pizza",
    "pose": "summit_flag",
    "background": "dawn_burst",
    "props": ["bag_empty", "receipt_flagpole", "paper_planes_3", "snail_cap", "confetti_rain"],
    "stamp": "seal_gold",
    "effect": ["foil_sweep", "rays_slow_spin", "flag_wave", "confetti_drift"],
    "hidden": ["snail_cap", "tiny_date"]
  },
  "renderVersion": 1
}
```

Rules: `seed` drives every "imperfection" (rays, confetti, stamp rotation) → the same card renders identically everywhere, including server-side share images. `renderVersion` bumps only when art changes so cached share PNGs invalidate. The owner's name/count never enters the render config (privacy) — counts are supplied at render time, `issuedAt` is the only personal-ish field and it's just a date.

### 8.7 Animation states

| State | Motion | Timing |
|---|---|---|
| Idle (in grid) | none — cards are printed objects at rest | — |
| Idle (in collection, unlocked Final) | shimmer sweep every ~5s, rays 90s spin, confetti drift | ambient, GPU-cheap |
| Hover | tilt ≤9°/11° + glare follows pointer + per-layer parallax (§8.8) | 120ms ease-out |
| Reveal | card back floats (±9px, 3.6s) → flip 0.95s → stamp lands at +950ms → paper burst → CTAs at +950ms | §8.10 |
| Upgrade | before → after morph | §8.10 |
| Reduced motion | all `.a-*` keyframes off; reveal/upgrade swap instantly with caption | `prefers-reduced-motion` |

### 8.8 Hover behavior

Perspective 900px on the wrapper; `rotateX = (0.5−py)·9°`, `rotateY = (px−0.5)·11°`; a 230px radial glare tracks the pointer. Layers translate by `depth × pointer-offset` (depths in §3) so the character floats over the frame — max ±6px, capped to keep the print feeling physical, not glassy.

### 8.9 Upgrade animation — «کارتت رشد کرد» storyboard

One persistent card, morphing in place. Total ~2.2s, skippable, reduced-motion = instant swap.

| Beat | t (ms) | What happens |
|---|---|---|
| 0 | 0 | Old tier card centered; subtle 1.04 scale pulse |
| 1 | 250 | New prop ghost-outlines **draw on** (stroke-dashoffset) — e.g. the receipt flag sketches itself |
| 2 | 500 | Character pose cross-fade + rotate (old pose fades 200ms while new pose rises with a spring) |
| 3 | 800 | Background elements slide/scale in staggered (sunburst rays fan out, skyline pops) |
| 4 | 1100 | Frame parts snap: perforation holes punch in, stub slides, foil ring draws around |
| 5 | 1400 | Tier rosette/seal **slams** with overshoot (scale 2.4→0.94→1) + shockwave ring + paper burst |
| 6 | 1700 | Before/after thumb appears in a corner — tap and hold to compare |
| 7 | 2000 | Stats chip ticks up to the new count; CTA «مجموعه من / اشتراک‌گذاری» |

Copy: header «کارتت رشد کرد», never «کارت جدید گرفتی».

### 8.10 Share-card layout (1080×1920 story)

Rendered by the same renderer, server-side, from the same JSON (deterministic).

- **Background (0–18%):** deep ink with faint diagonal DIBZ microtype pattern (echo of card back).
- **Card (18–78%):** final-tier card at 62% width, rotated −4°, layered drop shadow; edition ring visible.
- **Story band (78–90%):** Vazirmatn 800 headline «افسانه‌ی آغاز من» + one stat line «۵۰ نجات • ۳۲ کیلو غذا نجات یافت» — numbers only, **no name, no avatar, no merchant list**.
- **Footer (90–100%):** DIBZ wordmark + leaf glyph + «تو هم نجات بده · dibz.app» in 28px.
- The share image is the artwork itself, not a marketing banner: no UI chrome, no buttons, no stock gratification text.

---

## 9. Engineering notes

- **Renderer contract:** `renderCard(cardConfig, editionKey) → SVG DOM`. Pure function of (config, palette, seed). The page renders 15 cards + lab + reveal from ~40KB of JS with zero dependencies; per-card SVG weight ≈ 25–45KB.
- **Determinism:** `mulberry32(seed)` — confetti, ray jitter, stamp rotation, barcode widths. No `Math.random` in card code.
- **Accessibility:** every card SVG has `role="img"` + Persian `aria-label` («کارت نجات اول — درجه نهایی — نسخه پایه»); all demo buttons are real `<button>`s with Persian labels; all animation classes die under `prefers-reduced-motion: reduce`; no flashing (>3Hz) effects; reveal is never the only path to card info.
- **Framework fit (when productized):** the layer kit ports 1:1 to React components (`<Frame/>`, `<Stamp/>`, `<Char name pose/>`); keep cards as serialized SVG for share images; render on the client for the collection grid.
- **Prototype hygiene:** no analytics, no network calls (fonts CDN only for the demo page), mock numbers clearly part of a demo, nothing in this folder is wired into the Next.js app.

## 10. Non-goals

No real payments or rewards, no procedural infinite variants, no NFT/blockchain framing, no streak-shaming, no copying of Balatro / Pokémon / Cuphead assets or layouts — the reference points are the *feelings* (progression, collectibility, vintage animation), expressed through original characters, frames and print language.
