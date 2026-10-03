/* ============================================================
   DIBZ — Collectible Achievement Cards · scenes + boot
   15 art-directed compositions built from the layer kit,
   the card renderer, and the prototype page wiring.
   ============================================================ */
window.DIBZ = window.DIBZ || {};
(function () {
  const L = DIBZ.L;
  const el = L.el, g = L.g, T = L.T, U = L.U, W = L.W, H = L.H;

  /* ---------- small scene helpers ---------- */
  function sky(ctx, parent) {
    parent.appendChild(el('rect', { x: ctx.artBox.x, y: ctx.artBox.y, width: ctx.artBox.w, height: ctx.artBox.h, fill: `url(#${ctx.grad.sky})` }));
  }
  function panelFlat(ctx, parent, color, op) {
    parent.appendChild(el('rect', { x: ctx.artBox.x, y: ctx.artBox.y, width: ctx.artBox.w, height: ctx.artBox.h, fill: color || ctx.P.paperShade, opacity: op == null ? 1 : op }));
  }
  function htPatch(ctx, parent, x, y, w, h, op = 0.5, fine = false) {
    parent.appendChild(el('rect', { x, y, width: w, height: h, fill: `url(#${U(ctx, fine ? 'htF' : 'htC')})`, opacity: op }));
  }
  function htShadow(ctx, parent, cx, cy, rx, ry) {
    parent.appendChild(el('ellipse', { cx, cy, rx, ry, fill: `url(#${U(ctx, 'htC')})`, opacity: 0.85 }));
  }
  function groundFill(ctx, parent, y) {
    parent.appendChild(el('rect', { x: ctx.artBox.x, y, width: ctx.artBox.w, height: ctx.artBox.y + ctx.artBox.h - y, fill: ctx.P.paperShade, opacity: 0.45 }));
  }
  function baton(ctx, parent, x, y, rot = -35) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) rotate(${rot})`, class: 'lyr', 'data-depth': 1 });
    gg.appendChild(el('rect', { x: -15, y: -2.2, width: 30, height: 4.4, rx: 2.2, fill: P.paper, stroke: P.ink, 'stroke-width': 1.6 }));
    parent.appendChild(gg);
  }
  function drum(ctx, parent, x, y, s = 1) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) scale(${s})`, class: 'lyr', 'data-depth': 0.8 });
    gg.appendChild(el('path', { d: 'M -15 -8 L 15 -8 L 12 10 L -12 10 Z', fill: P.red, stroke: P.ink, 'stroke-width': 2 }));
    gg.appendChild(el('ellipse', { cx: 0, cy: -8, rx: 15, ry: 4.5, fill: P.paper, stroke: P.ink, 'stroke-width': 2 }));
    gg.appendChild(el('path', { d: 'M -12 -2 l 8 8 M -4 -6 l 8 8 M 4 -6 l 8 8', stroke: P.paper, 'stroke-width': 1.2, opacity: 0.7 }));
    parent.appendChild(gg);
  }
  function cymbal(ctx, parent, x, y, rot = 0) {
    const P = ctx.P;
    parent.appendChild(el('ellipse', { cx: x, cy: y, rx: 10, ry: 3, fill: P.gold, stroke: P.ink, 'stroke-width': 1.6, transform: `rotate(${rot} ${x} ${y})`, class: 'lyr', 'data-depth': 1 }));
  }
  function ribbon(ctx, parent, { cx, cy, w = 186, txt }) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.95 });
    gg.appendChild(el('path', { d: `M ${cx - w / 2 - 16} ${cy - 2} l 16 -8 v 26 l -16 -8 l 8 -5 Z`, fill: P.red, stroke: P.ink, 'stroke-width': 1.6 }));
    gg.appendChild(el('path', { d: `M ${cx + w / 2 + 16} ${cy - 2} l -16 -8 v 26 l 16 -8 l -8 -5 Z`, fill: P.red, stroke: P.ink, 'stroke-width': 1.6 }));
    gg.appendChild(el('rect', { x: cx - w / 2, y: cy - 10, width: w, height: 26, rx: 4, fill: P.red, stroke: P.ink, 'stroke-width': 2 }));
    gg.appendChild(el('path', { d: `M ${cx - w / 2} ${cy - 10} l -6 6 M ${cx + w / 2} ${cy - 10} l 6 6`, stroke: P.ink, 'stroke-width': 1.2, opacity: 0.5 }));
    T(gg, cx, cy + 8, txt, { size: 15, w: 800, fill: P.paper });
    parent.appendChild(gg);
  }
  function pendulum(ctx, parent, x, topY, len) {
    const P = ctx.P, outer = g({ transform: `translate(${x} ${topY})` });
    const swing = g({ class: 'a-pendulum' });
    swing.appendChild(el('line', { x1: 0, y1: 0, x2: 0, y2: len, stroke: P.gold, 'stroke-width': 2.6 }));
    swing.appendChild(el('circle', { cx: 0, cy: len + 7, r: 8.5, fill: P.gold, stroke: P.ink, 'stroke-width': 2 }));
    outer.appendChild(swing); parent.appendChild(outer);
  }
  function shopWindow(ctx, parent, x, y, w = 56, h = 58) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.4 });
    gg.appendChild(el('ellipse', { cx: x + w / 2, cy: y + h / 2, rx: w * 0.95, ry: h * 0.8, fill: P.gold, opacity: 0.28 }));
    gg.appendChild(el('rect', { x, y, width: w, height: h, rx: 4, fill: P.gold, stroke: P.ink, 'stroke-width': 2.4, opacity: 0.92 }));
    gg.appendChild(el('line', { x1: x + w / 2, y1: y, x2: x + w / 2, y2: y + h, stroke: P.ink, 'stroke-width': 1.6 }));
    gg.appendChild(el('line', { x1: x, y1: y + h / 2, x2: x + w, y2: y + h / 2, stroke: P.ink, 'stroke-width': 1.6 }));
    parent.appendChild(gg);
  }
  function storefront(ctx, parent, x, y) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.3 });
    gg.appendChild(el('rect', { x, y, width: 64, height: 86, fill: P.panel, stroke: P.ink, 'stroke-width': 2.4 }));
    for (let i = 0; i < 6; i++) gg.appendChild(el('rect', { x: x + i * 10.7, y: y + 16, width: 10.7, height: 14, fill: i % 2 ? P.paper : P.accent, stroke: P.ink, 'stroke-width': 1.2 }));
    T(gg, x + 32, y + 12, 'DIBZ', { size: 9, font: 'Alfa Slab One,Georgia,serif', fill: P.accentDeep, fa: false });
    gg.appendChild(el('rect', { x: x + 20, y: y + 44, width: 24, height: 42, fill: P.inkSoft, stroke: P.ink, 'stroke-width': 1.6 }));
    gg.appendChild(el('circle', { cx: x + 40, cy: y + 66, r: 1.8, fill: P.gold }));
    parent.appendChild(gg);
  }
  function mouse(ctx, parent, x, y) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y})`, class: 'lyr', 'data-depth': 0.6 });
    gg.appendChild(el('path', { d: 'M 4 4 q 10 2 14 8', fill: 'none', stroke: P.ink, 'stroke-width': 1.4 }));
    gg.appendChild(el('circle', { cx: 0, cy: 0, r: 6, fill: P.paperShade, stroke: P.ink, 'stroke-width': 1.8 }));
    gg.appendChild(el('circle', { cx: -4, cy: -6, r: 2.4, fill: P.paperShade, stroke: P.ink, 'stroke-width': 1.4 }));
    gg.appendChild(el('circle', { cx: 3, cy: -7, r: 2.4, fill: P.paperShade, stroke: P.ink, 'stroke-width': 1.4 }));
    gg.appendChild(el('circle', { cx: -1.5, cy: -1, r: 0.9, fill: P.ink }));
    gg.appendChild(el('circle', { cx: 2.5, cy: -1, r: 0.9, fill: P.ink }));
    parent.appendChild(gg);
  }

  /* ============================================================
     FAMILY 1 · THE GREAT ESCAPE (first rescue)
     ============================================================ */
  const escapeScenes = [
    // 0 · LOCKED — sealed bag, glowing seam, peeking silhouette
    (ctx, a) => {
      const P = ctx.P;
      panelFlat(ctx, a, P.paperShade);
      htPatch(ctx, a, 200, 64, 160, 334, 0.5);
      L.questionMark(ctx, a, 108, 158, 1.1);
      L.questionMark(ctx, a, 292, 132, 0.9);
      L.questionMark(ctx, a, 84, 322, 0.8);
      // pizza silhouette peeking from behind the bag
      L.CH.pizza(ctx, a, { x: 195, y: 208, s: 0.85, pose: 'sealed', ghost: true, ghostColor: P.ink, cls: '' });
      const bag = L.CH.bag(ctx, a, { x: 195, y: 292, s: 1.5, ghost: true, ghostColor: P.inkSoft });
      bag.setAttribute('opacity', 0.72);
      // glowing seam + rays
      const gl = g({ class: 'lyr', 'data-depth': 0.5 });
      gl.appendChild(el('path', { d: 'M 150 216 Q 195 200 240 216 L 236 222 Q 195 208 154 222 Z', fill: P.gold, opacity: 0.9 }));
      for (let i = -1; i <= 1; i++) gl.appendChild(el('path', { d: `M ${195 + i * 26} 212 L ${195 + i * 44} ${168 - Math.abs(i) * 8} L ${195 + i * 26 + 8} 212 Z`, fill: P.gold, opacity: 0.5 }));
      a.appendChild(gl);
      T(a, 195, 376, 'چه چیزی داخل است؟', { size: 11, w: 600, fill: P.inkSoft, op: 0.8 });
    },
    // 1 · TIER 1 — head out of the bag, timid smile
    (ctx, a) => {
      sky(ctx, a);
      groundFill(ctx, a, 352); L.groundLine(ctx, a, 352);
      htShadow(ctx, a, 152, 372, 46, 8);
      L.CH.pizza(ctx, a, { x: 150, y: 212, s: 1.1, pose: 'peek', expr: 'happy', blush: true });
      L.CH.bag(ctx, a, { x: 150, y: 316, s: 1.25, open: true });
      L.confetti(ctx, a, 1, { x: 260, y: 120, w: 70, h: 70 });
      L.cloud(ctx, a, 300, 116, 0.75);
    },
    // 2 · TIER 2 — leap with receipt flag, coupon frame
    (ctx, a) => {
      sky(ctx, a);
      L.sunburst(ctx, a, { cx: 340, cy: 96, r0: 18, r1: 115, n: 8, op: 0.4 });
      L.skyline(ctx, a, { y: 354, seed: ctx.seed + 11, op: 0.32, hMax: 30 });
      groundFill(ctx, a, 356); L.groundLine(ctx, a, 356);
      L.CH.bag(ctx, a, { x: 148, y: 330, s: 1.15, open: true });
      L.steam(ctx, a, 128, 268);
      htShadow(ctx, a, 150, 368, 40, 7);
      L.CH.pizza(ctx, a, { x: 232, y: 224, s: 1.2, rot: -10, pose: 'flag_leap', expr: 'grin' });
      L.receiptFlag(ctx, a, { x: 259, y: 189, pole: 44, w: 30, h: 36, wave: true });
      L.bird(ctx, a, 86, 122); L.bird(ctx, a, 116, 142);
      L.cloud(ctx, a, 66, 168, 0.7);
      L.confetti(ctx, a, 4, { x: 60, y: 90, w: 250, h: 130 });
    },
    // 3 · TIER 3 — cape sprint, freed friend, ticket frame
    (ctx, a) => {
      sky(ctx, a);
      L.halfSun(ctx, a, { cx: 96, cy: 208, r: 34 });
      L.skyline(ctx, a, { y: 352, seed: ctx.seed + 21, op: 0.3, hMax: 26 });
      L.lamp(ctx, a, 336, 352);
      groundFill(ctx, a, 354); L.groundLine(ctx, a, 354);
      L.CH.bag(ctx, a, { x: 302, y: 328, s: 1.05, rot: 14, open: true });
      L.CH.roll(ctx, a, { x: 312, y: 262, s: 1.05, pose: 'cheer', expr: 'grin' });
      htShadow(ctx, a, 168, 366, 52, 8);
      L.dust(ctx, a, 238, 344, 1);
      L.CH.pizza(ctx, a, { x: 170, y: 292, s: 1.25, rot: -8, pose: 'cape_sprint', expr: 'grin' });
      L.receiptFlag(ctx, a, { x: 226, y: 288, w: 40, h: 36, cape: true, rot: -12, wave: true });
      L.bird(ctx, a, 70, 112); L.bird(ctx, a, 100, 96); L.bird(ctx, a, 132, 120);
      L.cloud(ctx, a, 290, 108, 0.85);
      L.confetti(ctx, a, 6, { x: 50, y: 80, w: 280, h: 160 });
    },
    // 4 · FINAL — summit, planted flag, dawn burst, gold frame
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      L.stars(ctx, a, 4, { x: 40, y: 70, w: 310, h: 70 }, { twinkle: false });
      L.sunburst(ctx, a, { cx: 195, cy: 236, r0: 56, r1: 172, n: 16, color: P.gold, op: 0.5, cls: 'lyr a-spin' });
      a.appendChild(el('circle', { cx: 195, cy: 236, r: 92, fill: P.gold, opacity: 0.22 }));
      L.cloud(ctx, a, 76, 128, 0.9); L.cloud(ctx, a, 316, 158, 0.8);
      // hill
      a.appendChild(el('path', { d: `M ${ctx.artBox.x} 398 Q 195 292 360 398 Z`, fill: P.green, opacity: 0.85 }));
      a.appendChild(el('path', { d: `M ${ctx.artBox.x} 398 Q 195 292 360 398 Z`, fill: `url(#${U(ctx, 'htC')})`, opacity: 0.4 }));
      htShadow(ctx, a, 195, 306, 46, 8);
      // emptied bag at the hill base
      L.CH.bag(ctx, a, { x: 304, y: 366, s: 0.78, rot: 10 });
      // hero + planted receipt flag
      L.CH.pizza(ctx, a, { x: 195, y: 262, s: 1.35, pose: 'summit_flag', expr: 'grin' });
      L.receiptFlag(ctx, a, { x: 152, y: 224, pole: 54, w: 34, h: 40, wave: true });
      L.plane(ctx, a, 78, 136, 1, -8, 'lyr a-drift');
      L.plane(ctx, a, 288, 108, 0.85, 10, 'lyr a-drift');
      L.plane(ctx, a, 244, 74, 0.7, 0, 'lyr a-drift');
      L.CH.snail(ctx, a, { x: 74, y: 384, s: 1.1 });
      T(a, 288, 330, 'اولین نجات ۱۴۰۵/۰۷/۱۱', { size: 7, w: 600, fill: P.paper, op: 0.85 });
      L.confetti(ctx, a, 14, { x: 34, y: 66, w: 322, h: 300 }, { fall: true });
    },
  ];

  /* ============================================================
     FAMILY 2 · AGAINST THE CLOCK (last-minute rescue)
     ============================================================ */
  const clockScenes = [
    // 0 · LOCKED — silhouette clock, runner in the fog
    (ctx, a) => {
      const P = ctx.P;
      panelFlat(ctx, a, P.paperShade);
      htPatch(ctx, a, 30, 64, 330, 140, 0.45, true);
      L.questionMark(ctx, a, 300, 122, 1);
      L.questionMark(ctx, a, 72, 158, 0.85);
      L.CH.alarmClock(ctx, a, { x: 195, y: 212, s: 1.5, r: 56, ghost: true, ghostColor: P.ink, cls: '' });
      // paper hands on the silhouette
      a.appendChild(el('line', { x1: 195, y1: 212, x2: 195, y2: 178, stroke: P.paperShade, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      a.appendChild(el('line', { x1: 195, y1: 212, x2: 222, y2: 224, stroke: P.paperShade, 'stroke-width': 4, 'stroke-linecap': 'round' }));
      const run = L.CH.croissant(ctx, a, { x: 106, y: 330, s: 1.15, rot: -14, pose: 'sprint', ghost: true, ghostColor: P.inkSoft, cls: '' });
      run.setAttribute('opacity', 0.75);
      L.dust(ctx, a, 148, 352, 1.1);
      T(a, 195, 380, 'قبل از نیمه‌شب…', { size: 11, w: 600, fill: P.inkSoft, op: 0.85 });
    },
    // 1 · TIER 1 — sprint begins, pocket watch on the frame
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      L.halfSun(ctx, a, { cx: 328, cy: 344, r: 28 });
      groundFill(ctx, a, 352); L.groundLine(ctx, a, 352);
      htShadow(ctx, a, 176, 366, 52, 8);
      L.speedLines(ctx, a, { x: 252, y: 288, n: 3, len: 44 });
      L.CH.croissant(ctx, a, { x: 180, y: 302, s: 1.3, rot: -12, pose: 'sprint', expr: 'determined' });
      L.dust(ctx, a, 246, 330, 1);
      // crumbs trailing
      [[252, 318], [268, 326], [284, 320]].forEach(([x, y]) => a.appendChild(el('circle', { cx: x, cy: y, r: 2.4, fill: P.gold, stroke: P.inkSoft, 'stroke-width': 0.8 })));
      L.CH.pocketWatch(ctx, a, { x: 316, y: 96, chainX: 350, chainY: 66 });
    },
    // 2 · TIER 2 — the clock grows legs and chases
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      a.appendChild(el('rect', { x: ctx.artBox.x, y: 246, width: ctx.artBox.w, height: 60, fill: P.accent2, opacity: 0.3 }));
      L.skyline(ctx, a, { y: 352, seed: ctx.seed + 31, op: 0.35, hMax: 30 });
      groundFill(ctx, a, 354); L.groundLine(ctx, a, 354);
      L.CH.alarmClock(ctx, a, { x: 298, y: 268, s: 1.15, rot: 8, legs: true, face: 'angry', hands: [354, 300] });
      htShadow(ctx, a, 146, 366, 50, 8);
      L.speedLines(ctx, a, { x: 226, y: 284, n: 5, len: 52, gap: 8 });
      L.CH.croissant(ctx, a, { x: 148, y: 300, s: 1.3, rot: -14, pose: 'glance_back', expr: 'worried', sweat: true });
      L.dust(ctx, a, 214, 336, 1); L.dust(ctx, a, 246, 344, 0.8);
      [[212, 320], [230, 328], [246, 318], [262, 330], [276, 322]].forEach(([x, y]) => a.appendChild(el('circle', { cx: x, cy: y, r: 2.2, fill: P.gold, stroke: P.inkSoft, 'stroke-width': 0.8 })));
    },
    // 3 · TIER 3 — the gloved hand reaches in at 23:59
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      L.halfSun(ctx, a, { cx: 262, cy: 316, r: 54 });
      L.skyline(ctx, a, { y: 366, seed: ctx.seed + 41, op: 0.32, hMax: 34 });
      groundFill(ctx, a, 368); L.groundLine(ctx, a, 368);
      L.CH.alarmClock(ctx, a, { x: 318, y: 142, s: 1.45, face: 'angry', hands: [354, 356] });
      L.CH.donut(ctx, a, { x: 282, y: 334, s: 0.8, pose: 'cheer', expr: 'grin' });
      L.CH.gloveHand(ctx, a, { x: 92, y: 126, rot: 150, s: 1.15 });
      // shockwave arcs between hand and croissant
      a.appendChild(el('path', { d: 'M 138 200 q 12 12 2 26', fill: 'none', stroke: P.inkSoft, 'stroke-width': 2, 'stroke-linecap': 'round' }));
      a.appendChild(el('path', { d: 'M 152 192 q 16 16 3 36', fill: 'none', stroke: P.inkSoft, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.6 }));
      htShadow(ctx, a, 182, 380, 54, 8);
      L.speedLines(ctx, a, { x: 258, y: 250, n: 4, len: 46 });
      L.CH.croissant(ctx, a, { x: 188, y: 268, s: 1.3, rot: -12, pose: 'leap', expr: 'grin' });
      L.dust(ctx, a, 236, 352, 1); L.dust(ctx, a, 264, 344, 0.75);
    },
    // 4 · FINAL — the midnight catch, pendulum, foil navy frame
    (ctx, a) => {
      const P = ctx.P;
      a.appendChild(el('rect', { x: ctx.artBox.x, y: ctx.artBox.y, width: ctx.artBox.w, height: ctx.artBox.h, fill: 'url(#' + ctx.grad.night + ')' }));
      L.stars(ctx, a, 14, { x: 36, y: 66, w: 318, h: 170 }, { twinkle: true });
      L.CH.moon(ctx, a, { x: 76, y: 122, s: 1 });
      L.CH.alarmClock(ctx, a, { x: 314, y: 192, s: 1.3, r: 42, face: 'angry', hands: [358, 354] });
      pendulum(ctx, a, 314, 240, 30);
      mouse(ctx, a, 352, 254);
      shopWindow(ctx, a, 300, 312, 54, 56);
      L.CH.gloveHand(ctx, a, { x: 140, y: 175, rot: 150, s: 1.25 });
      a.appendChild(el('path', { d: 'M 142 196 q 14 12 3 28', fill: 'none', stroke: P.gold, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.8 }));
      a.appendChild(el('path', { d: 'M 156 188 q 18 17 4 40', fill: 'none', stroke: P.gold, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.5 }));
      L.CH.croissant(ctx, a, { x: 196, y: 254, s: 1.35, rot: -14, pose: 'catch', expr: 'grin' });
      // small paper "23:59" tag pinned to the moment
      a.appendChild(el('rect', { x: 236, y: 210, width: 52, height: 22, rx: 3, fill: P.paper, stroke: P.ink, 'stroke-width': 1.6, transform: 'rotate(-8 262 221)' }));
      T(a, 262, 226, '23:59', { size: 12, font: 'Oswald,Arial,sans-serif', w: 600, fill: P.ink, fa: false, rot: -8 });
    },
  ];

  /* ============================================================
     FAMILY 3 · THE RESCUE PARADE (milestone)
     ============================================================ */
  const paradeScenes = [
    // 0 · LOCKED — dark stage, one spotlight, a silhouette with a baton
    (ctx, a) => {
      const P = ctx.P;
      panelFlat(ctx, a, P.ink, 0.92);
      L.spotlight(ctx, a, { cx: 195, topY: 64, stageY: 386, spread: 132 });
      L.CH.pizza(ctx, a, { x: 195, y: 288, s: 1.25, pose: 'march', ghost: true, ghostColor: P.paper, cls: '' });
      baton(ctx, a, 142, 242, -38);
      // paper-colored stars
      L.stars(ctx, a, 6, { x: 40, y: 70, w: 310, h: 120 }, { seed: ctx.seed + 5 });
      T(a, 302, 160, '؟', { size: 24, w: 800, fill: P.paper, op: 0.9 });
      T(a, 195, 384, 'چراغ‌ها هنوز خاموش‌اند', { size: 11, w: 600, fill: P.paper, op: 0.75 });
    },
    // 1 · TIER 1 — one marcher, one drum, one flag
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      a.appendChild(el('circle', { cx: 320, cy: 122, r: 20, fill: P.gold, stroke: P.ink, 'stroke-width': 2 }));
      groundFill(ctx, a, 356); L.groundLine(ctx, a, 356);
      htShadow(ctx, a, 172, 368, 52, 8);
      L.CH.pizza(ctx, a, { x: 175, y: 296, s: 1.3, pose: 'march', expr: 'grin' });
      baton(ctx, a, 122, 276, -36);
      L.receiptFlag(ctx, a, { x: 218, y: 262, pole: 36, w: 24, h: 28, wave: true });
      drum(ctx, a, 284, 340, 1);
      L.confetti(ctx, a, 1, { x: 86, y: 150, w: 40, h: 40 });
      L.cloud(ctx, a, 60, 172, 0.75);
    },
    // 2 · TIER 2 — three marchers and a banner
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      L.sunburst(ctx, a, { cx: 195, cy: 130, r0: 24, r1: 96, n: 10, op: 0.3 });
      L.bunting(ctx, a, 74, 7);
      // banner on two poles
      a.appendChild(el('line', { x1: 112, y1: 104, x2: 112, y2: 356, stroke: P.ink, 'stroke-width': 2.6 }));
      a.appendChild(el('line', { x1: 278, y1: 104, x2: 278, y2: 356, stroke: P.ink, 'stroke-width': 2.6 }));
      a.appendChild(el('path', { d: 'M 112 104 Q 195 132 278 104 L 278 148 Q 195 176 112 148 Z', fill: P.paper, stroke: P.ink, 'stroke-width': 2.4 }));
      T(a, 195, 143, 'رژه نجات', { size: 17, w: 800, fill: P.accentDeep });
      groundFill(ctx, a, 356); L.groundLine(ctx, a, 356);
      htShadow(ctx, a, 122, 368, 44, 7); htShadow(ctx, a, 202, 368, 44, 7); htShadow(ctx, a, 282, 368, 44, 7);
      L.CH.pizza(ctx, a, { x: 120, y: 300, s: 1.15, pose: 'march', expr: 'grin' });
      baton(ctx, a, 74, 282, -36);
      L.CH.loaf(ctx, a, { x: 202, y: 296, s: 1.05, pose: 'march', expr: 'happy' });
      drum(ctx, a, 202, 322, 0.8);
      L.CH.cup(ctx, a, { x: 280, y: 300, s: 1.05, pose: 'cymbal', expr: 'happy' });
      cymbal(ctx, a, 242, 280, -14); cymbal(ctx, a, 318, 280, 14);
      L.confetti(ctx, a, 6, { x: 40, y: 190, w: 310, h: 130 });
    },
    // 3 · TIER 3 — street procession with a baguette float
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      L.skyline(ctx, a, { y: 308, seed: ctx.seed + 61, op: 0.4, hMax: 44 });
      L.stringLights(ctx, a, 86);
      groundFill(ctx, a, 372); L.groundLine(ctx, a, 372);
      // float
      a.appendChild(el('circle', { cx: 216, cy: 374, r: 8, fill: P.ink }));
      a.appendChild(el('circle', { cx: 286, cy: 374, r: 8, fill: P.ink }));
      L.CH.baguette(ctx, a, { x: 251, y: 352, s: 1.05, pose: 'cheer' });
      L.CH.donut(ctx, a, { x: 251, y: 316, s: 0.8, pose: 'wave', expr: 'grin' });
      // marchers
      L.CH.pizza(ctx, a, { x: 100, y: 308, s: 1.1, pose: 'march', expr: 'grin' });
      baton(ctx, a, 56, 290, -36);
      L.CH.croissant(ctx, a, { x: 162, y: 330, s: 0.9, rot: -6, pose: 'sprint', expr: 'happy' });
      L.CH.roll(ctx, a, { x: 128, y: 352, s: 0.75, pose: 'cheer' });
      // crowd gloved hands from the bottom edge
      L.CH.gloveHand(ctx, a, { x: 52, y: 424, rot: -18, s: 0.78, depth: 1.2 });
      L.CH.gloveHand(ctx, a, { x: 195, y: 430, rot: -4, s: 0.88, depth: 1.2 });
      L.CH.gloveHand(ctx, a, { x: 338, y: 424, rot: 14, s: 0.78, depth: 1.2 });
      L.balloon(ctx, a, 66, 148, 1, P.red, { cls: 'lyr a-bob' });
      L.balloon(ctx, a, 306, 128, 0.9, P.green, { cls: 'lyr a-bob' });
      L.balloon(ctx, a, 338, 176, 0.8, P.gold, { cls: 'lyr a-bob' });
      L.confetti(ctx, a, 10, { x: 36, y: 100, w: 320, h: 220 });
    },
    // 4 · FINAL — golden-hour grand parade over the city
    (ctx, a) => {
      const P = ctx.P;
      sky(ctx, a);
      L.sunburst(ctx, a, { cx: 195, cy: 196, r0: 60, r1: 180, n: 16, color: P.gold, op: 0.45, cls: 'lyr a-spin' });
      L.skyline(ctx, a, { y: 330, seed: ctx.seed + 71, op: 0.42, hMax: 52 });
      storefront(ctx, a, 292, 292);
      L.stringLights(ctx, a, 78);
      L.streamer(ctx, a, 62, 70, 1, P.accent); L.streamer(ctx, a, 336, 70, -1, P.green);
      groundFill(ctx, a, 378); L.groundLine(ctx, a, 378);
      L.spotlight(ctx, a, { cx: 84, topY: 64, stageY: 250, spread: 74, cls: 'lyr a-beam' });
      L.spotlight(ctx, a, { cx: 306, topY: 64, stageY: 250, spread: 74, cls: 'lyr a-beam' });
      // the band
      L.CH.pizza(ctx, a, { x: 74, y: 312, s: 1.15, pose: 'march', expr: 'grin' });
      baton(ctx, a, 30, 292, -36);
      L.CH.loaf(ctx, a, { x: 140, y: 328, s: 1, pose: 'march', expr: 'happy' });
      drum(ctx, a, 140, 352, 0.85);
      L.CH.cup(ctx, a, { x: 196, y: 330, s: 1, pose: 'cymbal', expr: 'happy' });
      cymbal(ctx, a, 160, 310, -12); cymbal(ctx, a, 232, 310, 12);
      L.CH.croissant(ctx, a, { x: 252, y: 346, s: 0.9, rot: -8, pose: 'sprint', expr: 'happy' });
      // float + queen
      a.appendChild(el('circle', { cx: 272, cy: 380, r: 8, fill: P.ink }));
      a.appendChild(el('circle', { cx: 334, cy: 380, r: 8, fill: P.ink }));
      L.CH.baguette(ctx, a, { x: 303, y: 358, s: 1, pose: 'cheer' });
      L.CH.donut(ctx, a, { x: 303, y: 322, s: 0.78, pose: 'wave', expr: 'grin' });
      // balloons (one is a Dibz box)
      L.balloon(ctx, a, 56, 138, 1, P.red, { cls: 'lyr a-bob' });
      L.balloon(ctx, a, 102, 116, 0.85, P.green, { cls: 'lyr a-bob' });
      L.balloon(ctx, a, 284, 118, 0.95, P.accent, { box: true, cls: 'lyr a-bob' });
      L.balloon(ctx, a, 344, 158, 0.9, P.gold, { cls: 'lyr a-bob' });
      L.balloon(ctx, a, 356, 214, 0.7, P.red, { cls: 'lyr a-bob' });
      L.plane(ctx, a, 152, 108, 0.9, -6, 'lyr a-drift');
      L.plane(ctx, a, 248, 92, 0.75, 8, 'lyr a-drift');
      L.confetti(ctx, a, 16, { x: 34, y: 66, w: 322, h: 300 }, { fall: true });
    },
  ];

  const SCENES = { escape: escapeScenes, clock: clockScenes, parade: paradeScenes };

  /* ---------- stamps per tier (drawn over the frame) ---------- */
  function stampsFor(ctx, root, card) {
    const t = card.tier;
    const stampTxt = card.family === 'clock' ? 'فوری!' : 'نجات شد';
    if (t === 0) L.lockSeal(ctx, root, 328, 372, 24);
    else if (t === 1) { L.tierRosette(ctx, root, 62, 94, 'I'); L.dotStamp(ctx, root, 330, 371, 20); }
    else if (t === 2) { L.tierRosette(ctx, root, 62, 94, 'II'); L.rubberStamp(ctx, root, 318, 106, stampTxt, -11); }
    else if (t === 3) {
      L.tierRosette(ctx, root, 62, 94, 'III');
      const pos = card.family === 'escape' ? [82, 362] : card.family === 'clock' ? [84, 358] : [140, 118];
      L.rubberStamp(ctx, root, pos[0], pos[1], 'نجات شد', -8);
    }
    else {
      const bottom = card.family === 'escape' ? 'FIRST RESCUE' : card.family === 'clock' ? 'JUST IN TIME' : 'RESCUE HERO';
      L.sealStamp(ctx, root, 322, 88, 27, { top: '★ DIBZ ★', bottom, fill: ctx.P.gold, tc: '#2E2418', rot: -8 });
      const stubCx = ctx.stub ? 168 : 195;
      const ribbonTxt = card.family === 'escape' ? 'افسانه‌ی آغاز' : card.family === 'clock' ? 'دقیقه‌ی نهایی' : 'قهرمان نجات';
      ribbon(ctx, root, { cx: stubCx, cy: 392, txt: ribbonTxt });
    }
  }

  /* ---------- renderer: JSON → layered SVG ---------- */
  function renderCard(card, editionKey) {
    const P = DIBZ.EDITIONS[editionKey || 'base'];
    const root = el('svg', {
      viewBox: `0 0 ${W} ${H}`, class: 'card-svg', role: 'img',
      'aria-label': `کارت ${card.title} — ${DIBZ.TIER_LABELS[card.tier].fa} — نسخه ${P.labelFa || P.label}`,
      xmlns: 'http://www.w3.org/2000/svg',
    });
    const frameKind = card.json.art.frame;
    const ctx = {
      root, uid: `${card.id}_${P.key}`, seed: card.json.seed, P,
      no: card.no, title: card.title, sub: card.sub, stats: card.stats, hint: card.hint,
      frame: frameKind, stub: frameKind === 'ticket_03',
    };
    root.appendChild(L.defs(ctx));
    L.paper(ctx, root);
    L.frameUnderlay(ctx, root);
    const art = g({ clipPath: `url(#${ctx.clip})` });
    root.appendChild(art);
    SCENES[card.family][card.tier](ctx, art);
    L.frames(ctx, root);
    L.header(ctx, root);
    L.titleBlock(ctx, root);
    stampsFor(ctx, root, card);
    if (card.tier === 4) L.foilSweep(ctx, root);
    L.finishCard(ctx, root);
    return root;
  }

  /* ---------- collectible card back ---------- */
  function cardBack() {
    const P = DIBZ.EDITIONS.base;
    const root = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'card-svg', role: 'img', 'aria-label': 'پشت کارت مجموعه دیبز' });
    root.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, rx: 22, fill: P.accent }));
    root.appendChild(el('rect', { x: 16, y: 16, width: W - 32, height: H - 32, rx: 16, fill: P.paper, stroke: P.ink, 'stroke-width': 3 }));
    root.appendChild(el('rect', { x: 24, y: 24, width: W - 48, height: H - 48, rx: 12, fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }));
    const pat = el('pattern', { id: 'backpat', width: 74, height: 74, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-24)' });
    pat.appendChild(el('text', { x: 6, y: 30, 'font-size': 26, 'font-family': 'Alfa Slab One,Georgia,serif', fill: P.accent2, opacity: 0.5, 'letter-spacing': '2px' }));
    pat.firstChild.textContent = 'DIBZ';
    root.appendChild(el('rect', { x: 24, y: 24, width: W - 48, height: H - 48, rx: 12, fill: 'url(#backpat)', opacity: 0.35 }));
    const cx = W / 2, cy = H / 2 - 10;
    root.appendChild(el('path', { d: L.scallopCircle(cx, cy, 92, 26, 5), fill: P.accent, stroke: P.ink, 'stroke-width': 3 }));
    root.appendChild(el('circle', { cx, cy, r: 74, fill: P.paper, stroke: P.ink, 'stroke-width': 2.4 }));
    root.appendChild(el('circle', { cx, cy, r: 64, fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }));
    L.leafGlyph(root, cx, cy - 8, 26, P.accentDeep);
    T(root, cx, cy + 44, 'DIBZ', { size: 24, font: 'Alfa Slab One,Georgia,serif', fill: P.ink, fa: false, ls: '3px' });
    T(root, cx, cy + 64, 'کارت‌های دستاورد', { size: 11, w: 600, fill: P.inkSoft });
    T(root, cx, 86, '★ مجموعه دیبز ★', { size: 13, w: 700, fill: P.paper, rot: 0 });
    T(root, cx, H - 78, 'RESUE CLUB • EST. 1405', { size: 9, font: 'Oswald,Arial,sans-serif', fill: P.paper, fa: false, ls: '2px' });
    return root;
  }

  /* ============================================================
     page boot
     ============================================================ */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mountFamilies() {
    const wrap = document.getElementById('families');
    Object.values(DIBZ.FAMILIES).forEach(fam => {
      const sec = document.createElement('section');
      sec.className = 'family';
      const head = document.createElement('div');
      head.className = 'fam-head';
      head.innerHTML = `<span class="fam-tag">${fam.archetype}</span>
        <h2><span class="fa" dir="rtl">${fam.fa}</span> <span class="en">· ${fam.name}</span></h2>
        <p>${fam.story}</p>`;
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'card-row';
      const cards = DIBZ.CARDS.filter(c => c.family === fam.id);
      cards.forEach((c, i) => {
        const slot = document.createElement('div');
        slot.className = 'card-slot';
        slot.dataset.cardId = c.id;
        const holder = document.createElement('div');
        holder.className = 'tilt';
        holder.appendChild(renderCard(c, 'base'));
        const cap = document.createElement('div');
        cap.className = 'cap';
        cap.innerHTML = `<span class="tier t${i}">${DIBZ.TIER_LABELS[i].en} · <bdi dir="rtl">${DIBZ.TIER_LABELS[i].fa}</bdi></span><p>${fam.tiers[i]}</p>`;
        slot.append(holder, cap);
        grid.appendChild(slot);
      });
      sec.appendChild(grid);
      wrap.appendChild(sec);
    });
  }

  /* edition lab + JSON inspector */
  const lab = { card: DIBZ.CARDS.find(c => c.id === 'escape_4'), edition: 'base' };
  function renderLab() {
    const mount = document.getElementById('labMount');
    mount.innerHTML = '';
    mount.appendChild(renderCard(lab.card, lab.edition));
    const cfg = JSON.parse(JSON.stringify(lab.card.json));
    cfg.edition = lab.edition;
    document.getElementById('jsonView').textContent = JSON.stringify(cfg, null, 2);
    document.querySelectorAll('#labTabs button').forEach(b => b.classList.toggle('on', b.dataset.ed === lab.edition));
    document.getElementById('labCardName').textContent = `${lab.card.title} · ${DIBZ.TIER_LABELS[lab.card.tier].fa}`;
  }

  /* tilt + glare */
  function bindTilt() {
    if (reduceMotion) return;
    document.querySelectorAll('.tilt').forEach(w => {
      let glare = w.querySelector('.glare');
      if (!glare) { glare = document.createElement('div'); glare.className = 'glare'; w.appendChild(glare); }
      w.addEventListener('pointermove', e => {
        const r = w.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        w.style.setProperty('--rx', ((0.5 - py) * 9).toFixed(2) + 'deg');
        w.style.setProperty('--ry', ((px - 0.5) * 11).toFixed(2) + 'deg');
        w.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        w.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      w.addEventListener('pointerleave', () => {
        w.style.setProperty('--rx', '0deg'); w.style.setProperty('--ry', '0deg');
        w.style.setProperty('--gx', '50%'); w.style.setProperty('--gy', '30%');
      });
    });
  }

  /* reveal demo */
  function bindReveal() {
    const back = document.getElementById('revealBack');
    back.appendChild(cardBack());
    document.getElementById('revealFront').appendChild(renderCard(lab.card, 'base'));
    const btn = document.getElementById('revealBtn');
    const flip = document.getElementById('flipCard');
    const pop = document.getElementById('stampPop');
    const ctas = document.getElementById('revealCtas');
    const burst = document.getElementById('burstLayer');
    function spawnBurst() {
      burst.innerHTML = '';
      const colors = ['#F87F45', '#3E7350', '#DF5A3A', '#E9B94E'];
      for (let i = 0; i < 18; i++) {
        const s = document.createElement('span');
        const ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 130;
        s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(ang) * dist + 60 + 'px');
        s.style.setProperty('--rot', (Math.random() * 360 | 0) + 'deg');
        s.style.background = colors[i % colors.length];
        s.style.animationDelay = (Math.random() * 120) + 'ms';
        burst.appendChild(s);
      }
      setTimeout(() => { burst.innerHTML = ''; }, 1800);
    }
    btn.addEventListener('click', () => {
      flip.classList.add('is-flipped');
      const at = reduceMotion ? 0 : 950; // flip takes .95s
      setTimeout(() => {
        pop.classList.add('show');
        ctas.classList.add('show');
        if (!reduceMotion) spawnBurst();
      }, at);
    });
    document.getElementById('resetReveal').addEventListener('click', () => {
      flip.classList.remove('is-flipped');
      pop.classList.remove('show'); ctas.classList.remove('show'); burst.innerHTML = '';
    });
  }

  function boot() {
    mountFamilies();
    // edition tabs
    const tabs = document.getElementById('labTabs');
    Object.values(DIBZ.EDITIONS).forEach(ed => {
      const b = document.createElement('button');
      b.textContent = `${ed.label} · ${ed.labelEn}`;
      b.dataset.ed = ed.key;
      b.addEventListener('click', () => { lab.edition = ed.key; renderLab(); });
      tabs.appendChild(b);
    });
    // clicking any card loads it into the lab
    document.getElementById('families').addEventListener('click', e => {
      const slot = e.target.closest('.card-slot');
      if (!slot) return;
      lab.card = DIBZ.CARDS.find(c => c.id === slot.dataset.cardId);
      renderLab();
      document.getElementById('lab').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    renderLab();
    bindTilt();
    bindReveal();
  }

  window.addEventListener('error', e => {
    const b = document.getElementById('errBanner');
    if (b) { b.textContent = '⚠ ' + e.message; b.style.display = 'block'; }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  DIBZ.renderCard = renderCard;
  DIBZ.cardBack = cardBack;
})();
