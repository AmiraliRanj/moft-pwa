/* ============================================================
   DIBZ — Collectible Achievement Cards · layer library
   Reusable SVG layers: paper, frames, stamps, scene primitives
   and the rubber-hose character kit. Everything reads colors
   from the active edition palette (ctx.P) so editions recolor
   the artwork instead of overlaying it.
   ============================================================ */
window.DIBZ = window.DIBZ || {};
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const FA_FONT = "'Vazirmatn','Segoe UI',Tahoma,sans-serif";
  const DISP = "'Alfa Slab One',Georgia,serif";
  const SMALL = "'Oswald','Arial Narrow',Arial,sans-serif";
  const W = 390, H = 560;
  const ART = { x: 30, y: 64, w: 330, h: 334 }; // default illustration panel
  let uidCounter = 0;

  /* ---------- tiny helpers ---------- */
  function el(tag, attrs, ...kids) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined) continue;
      if (k === 'text') n.textContent = v;
      else if (k === 'style') n.style.cssText = v;
      else n.setAttribute(k, v);
    }
    for (const c of kids.flat(9)) if (c) n.appendChild(c);
    return n;
  }
  function g(attrs, ...kids) { return el('g', attrs, ...kids); }
  function faNum(s) { return String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]); }
  function rng(seed) { // mulberry32 — deterministic vintage "imperfection"
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function T(parent, x, y, text, o = {}) { // text node
    const t = el('text', {
      x, y, fill: o.fill || 'currentColor',
      'font-size': o.size || 13,
      'font-family': o.font || FA_FONT,
      'font-weight': o.w || 400,
      'text-anchor': o.anchor || 'middle',
      'letter-spacing': o.ls || null,
      transform: o.rot ? `rotate(${o.rot} ${x} ${y})` : null,
      style: (o.fa === false ? '' : 'direction:rtl;') + (o.op != null ? `opacity:${o.op}` : ''),
      class: o.cls || null,
    }, ).valueOf();
    t.textContent = text;
    parent.appendChild(t);
    return t;
  }
  // wavy "stamp edge" rectangle path (stamp perforation / foil scallop); bumps point outward
  function scallopPath(x, y, w, h, step, amp) {
    let d = `M ${x} ${y}`;
    const seg = (x1, y1, x2, y2, nx, ny) => {
      d += ` Q ${(x1 + x2) / 2 + nx} ${(y1 + y2) / 2 + ny} ${x2} ${y2}`;
    };
    for (let px = x; px < x + w - 0.1; px += step) seg(px, y, Math.min(px + step, x + w), y, 0, -amp);
    for (let py = y; py < y + h - 0.1; py += step) seg(x + w, py, x + w, Math.min(py + step, y + h), amp, 0);
    for (let px = x + w; px > x + 0.1; px -= step) seg(px, y + h, Math.max(px - step, x), y + h, 0, amp);
    for (let py = y + h; py > y + 0.1; py -= step) seg(x, py, x, Math.max(py - step, y), -amp, 0);
    return d + ' Z';
  }
  function U(ctx, name) { return `${ctx.uid}_${name}`; }

  /* ---------- card scaffold: paper, defs, header, title ---------- */
  function defs(ctx) {
    const P = ctx.P, r = rng(ctx.seed + 7);
    const d = el('defs');
    // halftone dot patterns (fine + coarse), colored per edition
    for (const [nm, size, rr, op] of [['htF', 5.5, 1.05, 0.20], ['htC', 9, 2.3, 0.26]]) {
      const pat = el('pattern', { id: U(ctx, nm), width: size, height: size, patternUnits: 'userSpaceOnUse' });
      pat.appendChild(el('circle', { cx: size / 2, cy: size / 2, r: rr, fill: P.ink, opacity: op }));
      d.appendChild(pat);
    }
    // paper grain
    const f = el('filter', { id: U(ctx, 'grain'), x: '-5%', y: '-5%', width: '110%', height: '110%' });
    f.appendChild(el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.82', numOctaves: '2', seed: Math.floor(r() * 99), result: 'n' }));
    f.appendChild(el('feColorMatrix', { in: 'n', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0' }));
    d.appendChild(f);
    // gradients
    const grad = (id, stops, rot = 90) => {
      const gr = el('linearGradient', { id: U(ctx, id), x1: 0, y1: 0, x2: rot === 90 ? 0 : 1, y2: rot === 90 ? 1 : 0 });
      stops.forEach(s => gr.appendChild(el('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] == null ? 1 : s[2] })));
      d.appendChild(gr); return U(ctx, id);
    };
    ctx.grad = {
      sky: grad('sky', [[0, P.skyTop], [1, P.skyBottom]]),
      dibz: grad('dibz', [[0, P.accent2], [1, P.accent]]),
      foil: grad('foil', [[0, '#F6DA8B'], [0.5, '#D9A13E'], [1, '#B47F22']], 0),
      night: grad('night', [[0, P.skyTop], [1, P.skyBottom]]),
      shine: grad('shine', [[0, '#FFFFFF', 0], [0.5, '#FFFFFF', 0.38], [1, '#FFFFFF', 0]], 0),
    };
    // art clip
    const artBox = ctx.stub ? { ...ART, w: ART.w - 54 } : ART;
    const cp = el('clipPath', { id: U(ctx, 'artClip') });
    cp.appendChild(el('rect', { x: artBox.x, y: artBox.y, width: artBox.w, height: artBox.h, rx: 12 }));
    d.appendChild(cp);
    ctx.artBox = artBox;
    ctx.clip = U(ctx, 'artClip');
    return d;
  }

  function paper(ctx, parent) {
    const P = ctx.P;
    parent.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, rx: 22, fill: P.paper }));
  }

  function finishCard(ctx, parent) { // grain + vignette on top of everything
    parent.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, rx: 22, filter: `url(#${U(ctx, 'grain')})`, opacity: 0.10, style: 'mix-blend-mode:multiply;pointer-events:none' }));
    const vg = el('radialGradient', { id: U(ctx, 'vig'), cx: 0.5, cy: 0.45, r: 0.75 });
    vg.appendChild(el('stop', { offset: 0.62, 'stop-color': '#000', 'stop-opacity': 0 }));
    vg.appendChild(el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': 0.14 }));
    parent.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, rx: 22, fill: `url(#${U(ctx, 'vig')})`, style: 'pointer-events:none' }));
  }

  function header(ctx, parent) {
    const P = ctx.P;
    const right = ctx.stub ? 292 : 368, left = 22, y = 41;
    const gg = g({ class: 'lyr', 'data-depth': 0.1 });
    T(gg, right, y, 'مجموعه دیبز', { size: 11.5, w: 700, fill: P.inkSoft, anchor: 'end' });
    T(gg, left, y, `No. ${ctx.no}`, { size: 11.5, w: 600, font: SMALL, fill: P.inkSoft, anchor: 'start', fa: false, ls: '1px' });
    parent.appendChild(gg);
    parent.appendChild(el('line', { x1: left, y1: 50, x2: right, y2: 50, stroke: P.inkSoft, 'stroke-width': 1, opacity: 0.5, 'stroke-dasharray': '1 0' }));
  }

  function titleBlock(ctx, parent) {
    const P = ctx.P, cx = ctx.stub ? 168 : 195;
    const gg = g({ class: 'lyr', 'data-depth': 0.15 });
    T(gg, cx, 438, ctx.title, { size: 25, w: 800, fill: P.ink });
    if (ctx.sub) T(gg, cx, 466, ctx.sub, { size: 13, w: 500, fill: P.inkSoft });
    if (ctx.stats) {
      const chipW = 200, chipX = cx - chipW / 2;
      gg.appendChild(el('rect', { x: chipX, y: 486, width: chipW, height: 27, rx: 13.5, fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }));
      T(gg, cx, 504.5, ctx.stats, { size: 12.5, w: 700, fill: P.accentDeep });
    } else if (ctx.hint) {
      T(gg, cx, 502, `✦ ${ctx.hint}`, { size: 12.5, w: 700, fill: P.accentDeep });
    }
    parent.appendChild(gg);
  }

  /* ---------- FRAMES ---------- */
  // foil frames need a gold ring + paper panel UNDER the artwork
  function frameUnderlay(ctx, parent) {
    const P = ctx.P;
    if (ctx.frame === 'foil_final' || ctx.frame === 'foil_final_navy') {
      const navy = ctx.frame === 'foil_final_navy';
      parent.appendChild(el('path', { d: scallopPath(9, 9, W - 18, H - 18, 21, 4.6), fill: navy ? '#20263A' : P.gold, stroke: P.ink, 'stroke-width': 2 }));
      parent.appendChild(el('rect', { x: 20, y: 20, width: W - 40, height: H - 40, rx: 15, fill: P.paper }));
    }
  }
  function frames(ctx, parent) {
    const P = ctx.P, kind = ctx.frame;
    const fr = g({ class: 'lyr', 'data-depth': 0.05 });
    const outer = { x: 14, y: 14, w: W - 28, h: H - 28, rx: 20 };
    const punch = (cx, cy) => fr.appendChild(el('circle', { cx, cy, r: 5, fill: P.paper, stroke: P.ink, 'stroke-width': 1.4 }));

    if (kind === 'locked_seal') {
      fr.appendChild(el('rect', { ...r0(outer), fill: 'none', stroke: P.inkSoft, 'stroke-width': 2.2, 'stroke-dasharray': '7 5' }));
      fr.appendChild(el('rect', { x: 22, y: 22, width: W - 44, height: H - 44, rx: 14, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1, 'stroke-dasharray': '3 4', opacity: 0.7 }));
      punch(14, 14); punch(W - 14, 14); punch(14, H - 14); punch(W - 14, H - 14);
    } else if (kind === 'cardboard_01') {
      fr.appendChild(el('rect', { ...r0(outer), fill: 'none', stroke: P.ink, 'stroke-width': 3 }));
      fr.appendChild(el('rect', { x: 21, y: 21, width: W - 42, height: H - 42, rx: 15, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1, opacity: 0.6 }));
    } else if (kind === 'coupon_02') {
      fr.appendChild(el('rect', { ...r0(outer), fill: 'none', stroke: P.ink, 'stroke-width': 3 }));
      for (let y = 40; y < H - 30; y += 26) { punch(14, y); punch(W - 14, y); }
      fr.appendChild(el('rect', { x: 21, y: 21, width: W - 42, height: H - 42, rx: 15, fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.4, 'stroke-dasharray': '5 4', opacity: 0.85 }));
    } else if (kind === 'ticket_03') {
      ctx.stub = true; // orchestrator sized the art clip for the stub before defs()
      fr.appendChild(el('rect', { ...r0(outer), fill: 'none', stroke: P.ink, 'stroke-width': 3 }));
      // stub panel
      fr.appendChild(el('rect', { x: 306, y: 15.5, width: 68.5, height: H - 31, rx: 14, fill: P.paperShade, opacity: 0.8 }));
      fr.appendChild(el('line', { x1: 306, y1: 16, x2: 306, y2: H - 16, stroke: P.ink, 'stroke-width': 2, 'stroke-dasharray': '6 5' }));
      punch(306, 14); punch(306, H - 14);
      // stub content
      const sg = g({});
      T(sg, 340, 96, 'DIBZ', { size: 13, font: DISP, fill: P.accentDeep, fa: false, rot: 90 });
      T(sg, 346, 120, `No. ${ctx.no}`, { size: 10, font: SMALL, fill: P.inkSoft, fa: false, rot: 90, ls: '1px' });
      barcode(sg, 318, 496, 42, 12, ctx.seed, P);
      fr.appendChild(sg);
      fr.appendChild(el('rect', { x: 21, y: 21, width: 277, height: H - 42, rx: 15, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1, opacity: 0.55 }));
    } else if (kind === 'foil_final' || kind === 'foil_final_navy') {
      const navy = kind === 'foil_final_navy';
      fr.appendChild(el('rect', { x: 20, y: 20, width: W - 40, height: H - 40, rx: 15, fill: 'none', stroke: `url(#${ctx.grad.foil})`, 'stroke-width': 3.4 }));
      fr.appendChild(el('rect', { x: 25.5, y: 25.5, width: W - 51, height: H - 51, rx: 12, fill: 'none', stroke: navy ? P.gold : P.accentDeep, 'stroke-width': 1, opacity: 0.75 }));
      [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]].forEach(([x, y]) => star4(fr, x, y, 6.5, navy ? P.gold : '#B47F22'));
    }
    parent.appendChild(fr);
    function r0(o) { return { x: o.x, y: o.y, width: o.w, height: o.h, rx: o.rx }; }
  }

  /* ---------- STAMPS ---------- */
  function star4(parent, x, y, r, fill, cls) {
    const p = `M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`;
    parent.appendChild(el('path', { d: p, fill, class: cls || null }));
  }
  function leafGlyph(parent, cx, cy, s, color) { // original Dibz mark: leaf in a box
    parent.appendChild(el('rect', { x: cx - s, y: cy - s, width: 2 * s, height: 2 * s, rx: s * 0.3, fill: 'none', stroke: color, 'stroke-width': s * 0.22 }));
    parent.appendChild(el('path', { d: `M ${cx - s * 0.42} ${cy + s * 0.45} Q ${cx - s * 0.5} ${cy - s * 0.5} ${cx + s * 0.5} ${cy - s * 0.42} Q ${cx + s * 0.52} ${cy + s * 0.5} ${cx - s * 0.42} ${cy + s * 0.45} Z`, fill: color }));
    parent.appendChild(el('line', { x1: cx - s * 0.42, y1: cy + s * 0.45, x2: cx + s * 0.28, y2: cy - s * 0.3, stroke: color, 'stroke-width': s * 0.16 }));
  }
  function dotStamp(ctx, parent, cx, cy, r = 21) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.9 });
    gg.appendChild(el('circle', { cx, cy, r, fill: P.paper, stroke: P.ink, 'stroke-width': 2 }));
    gg.appendChild(el('circle', { cx, cy, r: r - 4.5, fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.2 }));
    leafGlyph(gg, cx, cy - 2.5, r * 0.3, P.accentDeep);
    T(gg, cx, cy + r * 0.55, 'DIBZ', { size: 6.5, font: SMALL, fill: P.ink, fa: false, ls: '1.5px' });
    parent.appendChild(gg);
  }
  function rubberStamp(ctx, parent, cx, cy, txt, rot = -10, color) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.9 });
    const c = color || P.red;
    gg.appendChild(el('ellipse', { cx, cy, rx: 42, ry: 19, fill: 'none', stroke: c, 'stroke-width': 2.6, opacity: 0.9, transform: `rotate(${rot} ${cx} ${cy})` }));
    gg.appendChild(el('ellipse', { cx: cx + 1, cy: cy + 0.8, rx: 42, ry: 19, fill: 'none', stroke: c, 'stroke-width': 1, opacity: 0.5, transform: `rotate(${rot + 0.7} ${cx} ${cy})`, class: 'misreg' }));
    T(gg, cx, cy + 4.5, txt, { size: 14, w: 800, fill: c, rot });
    parent.appendChild(gg);
  }
  function sealStamp(ctx, parent, cx, cy, r, { top = '★ DIBZ ★', bottom = 'RESCUE CO', center = 'leaf', fill, tc, rot = -8 } = {}) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.9 });
    const f = fill || P.red, c = tc || P.paper, id = U(ctx, 'sealArc' + (uidCounter++));
    const d = el('defs');
    const arc = el('path', { id, d: `M ${cx - r * 0.72} ${cy} A ${r * 0.72} ${r * 0.72} 0 1 1 ${cx + r * 0.72} ${cy}`, fill: 'none' });
    d.appendChild(arc); gg.appendChild(d);
    gg.appendChild(el('path', { d: scallopCircle(cx, cy, r, 20, 2.6), fill: f, stroke: P.ink, 'stroke-width': 2, transform: `rotate(${rot} ${cx} ${cy})` }));
    gg.appendChild(el('circle', { cx, cy, r: r * 0.8, fill: 'none', stroke: c, 'stroke-width': 1.4 }));
    gg.appendChild(el('circle', { cx, cy, r: r * 0.56, fill: 'none', stroke: c, 'stroke-width': 1 }));
    T(gg, cx, cy - r * 0.62, top, { size: 7.5, font: SMALL, fill: c, fa: false, ls: '2px' });
    const tp = el('text', { 'font-size': 7.5, 'font-family': SMALL, fill: c, 'letter-spacing': '2px' });
    const tpRef = el('textPath', { href: `#${id}`, startOffset: '50%', 'text-anchor': 'middle' });
    tpRef.textContent = bottom; tp.appendChild(tpRef); gg.appendChild(tp);
    if (center === 'leaf') leafGlyph(gg, cx, cy + 1, r * 0.2, c);
    else T(gg, cx, cy + r * 0.18, center, { size: r * 0.4, w: 800, fill: c, fa: false });
    parent.appendChild(gg);
  }
  function scallopCircle(cx, cy, r, n, amp) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
      const am = (a0 + a1) / 2, rm = r + amp;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      if (i === 0) d += `M ${x0} ${y0}`;
      d += ` Q ${cx + rm * Math.cos(am)} ${cy + rm * Math.sin(am)} ${x1} ${y1}`;
    }
    return d + ' Z';
  }
  function tierRosette(ctx, parent, cx, cy, roman, color) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.9 });
    const f = color || P.gold;
    gg.appendChild(el('path', { d: `M ${cx - 9} ${cy + 14} L ${cx - 16} ${cy + 34} L ${cx - 7} ${cy + 29} L ${cx - 2} ${cy + 36} L ${cx + 2} ${cy + 28} L ${cx + 9} ${cy + 33} L ${cx + 8} ${cy + 15} Z`, fill: P.red, stroke: P.ink, 'stroke-width': 1.4, opacity: 0.95 }));
    gg.appendChild(el('path', { d: scallopCircle(cx, cy, 15, 14, 2.4), fill: f, stroke: P.ink, 'stroke-width': 1.8 }));
    gg.appendChild(el('circle', { cx, cy, r: 10.5, fill: 'none', stroke: P.ink, 'stroke-width': 0.9, opacity: 0.5 }));
    T(gg, cx, cy + 4, roman, { size: 11, font: DISP, fill: P.ink, fa: false });
    parent.appendChild(gg);
  }
  function lockSeal(ctx, parent, cx, cy, r = 24) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.9 });
    gg.appendChild(el('path', { d: scallopCircle(cx, cy, r, 18, 2.8), fill: P.ink, opacity: 0.92 }));
    gg.appendChild(el('circle', { cx, cy, r: r * 0.78, fill: 'none', stroke: P.paper, 'stroke-width': 1.2, 'stroke-dasharray': '3 2.5' }));
    gg.appendChild(el('rect', { x: cx - 8, y: cy - 3, width: 16, height: 12, rx: 2.5, fill: 'none', stroke: P.paper, 'stroke-width': 2 }));
    gg.appendChild(el('path', { d: `M ${cx - 4.5} ${cy - 3} v -4 a 4.5 4.5 0 0 1 9 0 v 4`, fill: 'none', stroke: P.paper, 'stroke-width': 2 }));
    T(gg, cx, cy + r * 0.72, 'قفل', { size: 8, w: 700, fill: P.paper });
    parent.appendChild(gg);
  }
  function barcode(parent, x, y, w, h, seed, P, rot = 0) {
    const r = rng(seed), gg = g({ transform: rot ? `rotate(${rot} ${x} ${y})` : null });
    let bx = x;
    while (bx < x + w - 2) {
      const bw = 1 + r() * 2.4;
      gg.appendChild(el('rect', { x: bx, y, width: bw, height: h, fill: P.ink, opacity: 0.85 }));
      bx += bw + 1.2 + r() * 1.6;
    }
    parent.appendChild(gg);
    return gg;
  }

  /* ---------- SCENE PRIMITIVES ---------- */
  function sunburst(ctx, parent, { cx, cy, r0 = 30, r1 = 140, n = 12, color, op = 0.5, jitter = 0.06, cls, seed = ctx.seed }) {
    const P = ctx.P, r = rng(seed), gg = g({ class: cls ? cls : 'lyr', 'data-depth': 0.3 });
    const off = r() * Math.PI;
    for (let i = 0; i < n; i++) {
      const a = off + (i / n) * Math.PI * 2, half = (Math.PI / n) * 0.62, j = (r() - 0.5) * jitter;
      const p = `M ${cx + r0 * Math.cos(a - half + j)} ${cy + r0 * Math.sin(a - half + j)} L ${cx + r1 * Math.cos(a + j)} ${cy + r1 * Math.sin(a + j)} L ${cx + r1 * Math.cos(a + half + j)} ${cy + r1 * Math.sin(a + half + j)} Z`;
      gg.appendChild(el('path', { d: p, fill: color || P.accent2, opacity: i % 2 ? op * 0.45 : op }));
    }
    parent.appendChild(gg); return gg;
  }
  function halfSun(ctx, parent, { cx, cy, r = 42, color }) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.3 });
    gg.appendChild(el('path', { d: `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`, fill: color || P.accent2, stroke: P.ink, 'stroke-width': 2.4 }));
    for (let i = -2; i <= 2; i++) {
      const a = -Math.PI / 2 + i * 0.42;
      gg.appendChild(el('line', { x1: cx + (r + 5) * Math.cos(a), y1: cy + (r + 5) * Math.sin(a), x2: cx + (r + 13) * Math.cos(a), y2: cy + (r + 13) * Math.sin(a), stroke: P.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
    }
    parent.appendChild(gg); return gg;
  }
  function cloud(ctx, parent, x, y, s = 1, cls) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) scale(${s})`, class: cls || 'lyr', 'data-depth': 0.35 });
    gg.appendChild(el('path', { d: 'M -22 6 Q -26 -4 -14 -6 Q -12 -14 0 -13 Q 12 -15 14 -6 Q 25 -5 22 5 Q 12 9 0 8 Q -12 9 -22 6 Z', fill: P.panel, stroke: P.ink, 'stroke-width': 2.2 }));
    parent.appendChild(gg); return gg;
  }
  function bird(ctx, parent, x, y, s = 1) {
    const P = ctx.P;
    parent.appendChild(el('path', { d: `M ${x - 7 * s} ${y} Q ${x - 3 * s} ${y - 5 * s} ${x} ${y} Q ${x + 3 * s} ${y - 5 * s} ${x + 7 * s} ${y}`, fill: 'none', stroke: P.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round', class: 'lyr', 'data-depth': 0.35 }));
  }
  function groundLine(ctx, parent, y, x0 = 34, x1 = 356) {
    const P = ctx.P;
    parent.appendChild(el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: P.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    const r = rng(ctx.seed + y);
    for (let i = 0; i < 4; i++) {
      const x = x0 + 10 + r() * (x1 - x0 - 20);
      parent.appendChild(el('line', { x1: x, y1: y + 4, x2: x + 7, y2: y + 4, stroke: P.inkSoft, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.6 }));
    }
  }
  function skyline(ctx, parent, { y, seed, hMax = 44, fill, op = 0.5 }) {
    const P = ctx.P, r = rng(seed), gg = g({ class: 'lyr', 'data-depth': 0.25, opacity: op });
    let x = 36;
    while (x < 350) {
      const w = 22 + r() * 26, h = 14 + r() * hMax;
      gg.appendChild(el('rect', { x, y: y - h, width: w, height: h, fill: fill || P.inkSoft }));
      if (r() > 0.4) gg.appendChild(el('rect', { x: x + w + 3, y: y - h * 0.6 - 8, width: 4, height: 8, fill: fill || P.inkSoft })); // chimney
      for (let k = 0; k < 2; k++) if (r() > 0.5) gg.appendChild(el('rect', { x: x + 5 + k * 10, y: y - h + 6, width: 5, height: 5, fill: P.paper, opacity: 0.7 }));
      x += w + 8 + r() * 10;
    }
    parent.appendChild(gg); return gg;
  }
  function confetti(ctx, parent, n, box, { seed = ctx.seed, fall = false, scale = 1 } = {}) {
    const P = ctx.P, r = rng(seed * 3 + n), cols = [P.accent, P.green, P.red, P.gold, P.accentDeep];
    const gg = g({ class: 'lyr', 'data-depth': 1.1 });
    for (let i = 0; i < n; i++) {
      const x = box.x + r() * box.w, y = box.y + r() * box.h, c = cols[i % cols.length], kind = r();
      let node;
      if (kind < 0.4) node = el('rect', { x: -3.4, y: -2.1, width: 6.8, height: 4.2, rx: 1, fill: c });
      else if (kind < 0.7) node = el('circle', { r: 2.3, fill: c });
      else if (kind < 0.88) node = el('path', { d: 'M -3 2.4 L 0 -2.6 L 3 2.4 Z', fill: c });
      else node = el('path', { d: 'M -3 0 Q -1 -3 0 0 Q 1 3 3 0', fill: 'none', stroke: c, 'stroke-width': 1.4 });
      // wrapper carries the CSS fall animation; the node keeps its own attribute transform
      const rot0 = Math.round(r() * 360), rot1 = rot0 + 220 + Math.round(r() * 120);
      const wrap = g({ transform: `translate(${x} ${y})` });
      const inner = g({ transform: `rotate(${rot0}) scale(${scale})` });
      if (fall) {
        inner.setAttribute('class', 'a-fall');
        inner.setAttribute('style', `--dur:${(5 + r() * 5).toFixed(2)}s;--del:${(-r() * 9).toFixed(2)}s;--sway:${(r() * 24 - 12).toFixed(1)}px;--drift:${(box.h + 70).toFixed(0)}px;--r0:${rot0}deg;--r1:${rot1}deg`);
      }
      inner.appendChild(node); wrap.appendChild(inner); gg.appendChild(wrap);
    }
    parent.appendChild(gg); return gg;
  }
  function speedLines(ctx, parent, { x, y, n = 4, len = 46, gap = 9 }) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.6, opacity: 0.75 });
    for (let i = 0; i < n; i++) {
      const yy = y + i * gap, l = len * (0.7 + 0.4 * ((i * 37) % 3) / 2);
      gg.appendChild(el('path', { d: `M ${x} ${yy} q ${-l * 0.5} ${-2} ${-l} 0`, fill: 'none', stroke: P.inkSoft, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
    }
    parent.appendChild(gg); return gg;
  }
  function dust(ctx, parent, x, y, s = 1) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) scale(${s})`, class: 'lyr', 'data-depth': 0.55 });
    gg.appendChild(el('circle', { cx: -8, cy: 2, r: 4.5, fill: P.paperShade, stroke: P.inkSoft, 'stroke-width': 1.4 }));
    gg.appendChild(el('circle', { cx: 0, cy: -2, r: 6, fill: P.paperShade, stroke: P.inkSoft, 'stroke-width': 1.4 }));
    gg.appendChild(el('circle', { cx: 9, cy: 2.5, r: 3.6, fill: P.paperShade, stroke: P.inkSoft, 'stroke-width': 1.4 }));
    parent.appendChild(gg); return gg;
  }
  function steam(ctx, parent, x, y, cls) {
    const P = ctx.P, gg = g({ class: cls || 'lyr', 'data-depth': 0.7 });
    gg.appendChild(el('path', { d: `M ${x} ${y} q -6 -8 0 -15 q 6 -7 0 -14`, fill: 'none', stroke: P.inkSoft, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.8 }));
    gg.appendChild(el('path', { d: `M ${x + 12} ${y + 2} q -5 -7 0 -13 q 5 -6 0 -12`, fill: 'none', stroke: P.inkSoft, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.55 }));
    parent.appendChild(gg); return gg;
  }
  function stars(ctx, parent, n, box, { seed = ctx.seed, twinkle = false } = {}) {
    const P = ctx.P, r = rng(seed + n), gg = g({ class: 'lyr', 'data-depth': 0.2 });
    for (let i = 0; i < n; i++) {
      const x = box.x + r() * box.w, y = box.y + r() * box.h, s = 2 + r() * 3.2;
      const cls = twinkle && r() > 0.45 ? 'a-twinkle' : null;
      if (r() > 0.55) star4(gg, x, y, s * 1.7, P.gold, cls);
      else gg.appendChild(el('circle', { cx: x, cy: y, r: s * 0.5, fill: P.gold, opacity: 0.9, class: cls }));
    }
    parent.appendChild(gg); return gg;
  }
  function spotlight(ctx, parent, { cx = 195, topY = 66, stageY = 380, spread = 120, cls }) {
    const P = ctx.P, gg = g({ class: cls || 'lyr', 'data-depth': 0.15 });
    gg.appendChild(el('path', { d: `M ${cx - 9} ${topY} L ${cx + 9} ${topY} L ${cx + spread} ${stageY} L ${cx - spread} ${stageY} Z`, fill: P.gold, opacity: 0.16 }));
    gg.appendChild(el('ellipse', { cx, cy: stageY, rx: spread * 0.72, ry: 13, fill: P.gold, opacity: 0.2 }));
    parent.appendChild(gg); return gg;
  }
  function bunting(ctx, parent, y, n = 6, sag = 14) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.25 });
    const x0 = 34, x1 = 356;
    gg.appendChild(el('path', { d: `M ${x0} ${y} Q ${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`, fill: 'none', stroke: P.ink, 'stroke-width': 1.6 }));
    const cols = [P.accent, P.green, P.gold, P.red];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.7) / (n + 0.4), x = x0 + (x1 - x0) * t, yy = y + sag * 2 * 4 * t * (1 - t) * 0.62;
      gg.appendChild(el('path', { d: `M ${x - 6} ${yy} L ${x + 6} ${yy} L ${x} ${yy + 11} Z`, fill: cols[i % 4], stroke: P.ink, 'stroke-width': 1.2 }));
    }
    parent.appendChild(gg); return gg;
  }
  function stringLights(ctx, parent, y) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.25 });
    gg.appendChild(el('path', { d: `M 32 ${y} Q 195 ${y + 26} 358 ${y}`, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1.4 }));
    for (let i = 1; i <= 7; i++) {
      const t = i / 8, x = 32 + 326 * t, yy = y + 26 * 4 * t * (1 - t) * 0.62;
      gg.appendChild(el('circle', { cx: x, cy: yy + 4, r: 3.4, fill: i % 2 ? P.gold : P.accent, stroke: P.ink, 'stroke-width': 1.1 }));
    }
    parent.appendChild(gg); return gg;
  }
  function balloon(ctx, parent, x, y, s, color, { box = false, cls } = {}) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) scale(${s})` });
    const inner = g({ class: cls || 'lyr', 'data-depth': 0.5 });
    inner.appendChild(el('path', { d: `M 0 16 q -4 14 -10 26`, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1.3 }));
    if (box) {
      inner.appendChild(el('rect', { x: -11, y: -13, width: 22, height: 24, rx: 4, fill: color, stroke: P.ink, 'stroke-width': 2 }));
      inner.appendChild(el('line', { x1: -11, y1: -4, x2: 11, y2: -4, stroke: P.ink, 'stroke-width': 1.4 }));
      leafGlyph(inner, 0, 1, 4, P.paper);
    } else {
      inner.appendChild(el('ellipse', { cx: 0, cy: 0, rx: 10.5, ry: 12.5, fill: color, stroke: P.ink, 'stroke-width': 2 }));
      inner.appendChild(el('path', { d: 'M -3 12.5 L 3 12.5 L 0 16.5 Z', fill: color, stroke: P.ink, 'stroke-width': 1.2 }));
      inner.appendChild(el('path', { d: 'M -4 -7 q 2 -3 4 -1', stroke: P.paper, 'stroke-width': 1.4, fill: 'none', opacity: 0.8 }));
    }
    gg.appendChild(inner);
    parent.appendChild(gg); return gg;
  }
  function plane(ctx, parent, x, y, s, rot, cls) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });
    const inner = g({ class: cls || 'lyr', 'data-depth': 0.55 });
    inner.appendChild(el('path', { d: 'M 0 0 L 26 7 L 3 13 L 6 7 Z', fill: P.paper, stroke: P.ink, 'stroke-width': 1.8 }));
    inner.appendChild(el('path', { d: 'M 0 0 L 6 7 L 3 13', fill: 'none', stroke: P.inkSoft, 'stroke-width': 1.2 }));
    gg.appendChild(inner);
    parent.appendChild(gg); return gg;
  }
  function lamp(ctx, parent, x, y) {
    const P = ctx.P, gg = g({ class: 'lyr', 'data-depth': 0.3 });
    gg.appendChild(el('line', { x1: x, y1: y, x2: x, y2: y - 66, stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    gg.appendChild(el('path', { d: `M ${x - 9} ${y - 66} h 18 l -4 -8 h -10 Z`, fill: P.gold, stroke: P.ink, 'stroke-width': 1.8 }));
    gg.appendChild(el('path', { d: `M ${x - 12} ${y - 74} q 12 -8 24 0`, fill: 'none', stroke: P.ink, 'stroke-width': 2 }));
    parent.appendChild(gg); return gg;
  }
  function questionMark(ctx, parent, x, y, s, cls) {
    const P = ctx.P;
    T(parent, x, y, '؟', { size: 22 * s, w: 800, fill: P.inkSoft, cls, op: 0.85 });
  }
  function streamer(ctx, parent, x, y, dir, color) {
    const P = ctx.P;
    parent.appendChild(el('path', { d: `M ${x} ${y} q ${18 * dir} 18 ${4 * dir} 34 q ${-12 * dir} 16 ${6 * dir} 30`, fill: 'none', stroke: color || P.accent, 'stroke-width': 3.4, 'stroke-linecap': 'round', class: 'lyr', 'data-depth': 0.5 }));
  }
  function foilSweep(ctx, parent) {
    const gg = g({ style: 'pointer-events:none' });
    gg.appendChild(el('clipPath', { id: U(ctx, 'sweepClip') }, el('rect', { x: 10, y: 10, width: W - 20, height: H - 20, rx: 18 })));
    const rotG = g({ transform: 'rotate(18 0 0)', clipPath: `url(#${U(ctx, 'sweepClip')})` });
    rotG.appendChild(el('rect', { x: -90, y: -40, width: 90, height: H + 120, fill: `url(#${ctx.grad.shine})`, class: 'a-shimmer' }));
    gg.appendChild(rotG);
    parent.appendChild(gg);
  }

  /* ---------- RUBBER-HOSE CHARACTER KIT ---------- */
  function pieEye(parent, x, y, r, P, variant) {
    if (variant === 'happy' || variant === 'wink') {
      parent.appendChild(el('path', { d: `M ${x - r} ${y + 1} Q ${x} ${y - r * 1.7} ${x + r} ${y + 1}`, fill: 'none', stroke: P.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
      return;
    }
    if (variant === 'shock') {
      parent.appendChild(el('circle', { cx: x, cy: y, r, fill: 'none', stroke: P.ink, 'stroke-width': 2.6 }));
      parent.appendChild(el('circle', { cx: x, cy: y, r: r * 0.3, fill: P.ink }));
      return;
    }
    parent.appendChild(el('circle', { cx: x, cy: y, r, fill: P.ink }));
  }
  // pie-cut eye with true wedge: draw on top of panel color
  function eye(parent, x, y, r, P, variant = 'open') {
    if (variant === 'happy' || variant === 'wink') { pieEye(parent, x, y, r, P, variant); return; }
    if (variant === 'shock') { pieEye(parent, x, y, r, P, variant); return; }
    parent.appendChild(el('circle', { cx: x, cy: y, r, fill: P.ink }));
    parent.appendChild(el('path', { d: `M ${x + 0.5} ${y - 0.5} L ${x + r * 1.8} ${y - r * 1.8} L ${x + r * 1.8} ${y + 0.5} Z`, fill: P.panel }));
  }
  function brows(parent, x1, x2, y, P, mood = 'determined') {
    const rot = mood === 'angry' ? 14 : mood === 'worried' ? -12 : 4;
    parent.appendChild(el('line', { x1: x1 - 6, y1: y - rot * 0.4, x2: x1 + 6, y2: y + rot * 0.4, stroke: P.ink, 'stroke-width': 2.8, 'stroke-linecap': 'round' }));
    parent.appendChild(el('line', { x1: x2 - 6, y1: y + rot * 0.4, x2: x2 + 6, y2: y - rot * 0.4, stroke: P.ink, 'stroke-width': 2.8, 'stroke-linecap': 'round' }));
  }
  function mouth(parent, x, y, P, kind = 'smile') {
    if (kind === 'smile') parent.appendChild(el('path', { d: `M ${x - 8} ${y} Q ${x} ${y + 7} ${x + 8} ${y}`, fill: 'none', stroke: P.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    else if (kind === 'grin') {
      parent.appendChild(el('path', { d: `M ${x - 9} ${y} Q ${x} ${y + 12} ${x + 9} ${y} Z`, fill: P.ink }));
      parent.appendChild(el('path', { d: `M ${x - 4} ${y + 6.5} Q ${x} ${y + 9.5} ${x + 4} ${y + 6.5} Z`, fill: P.red }));
    } else if (kind === 'grim') parent.appendChild(el('line', { x1: x - 7, y1: y + 2, x2: x + 7, y2: y, stroke: P.ink, 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
    else if (kind === 'ooh') parent.appendChild(el('ellipse', { cx: x, cy: y + 2, rx: 4, ry: 5, fill: P.ink }));
  }
  function glove(parent, x, y, rot = 0, P) {
    const gg = g({ transform: `translate(${x} ${y}) rotate(${rot})` });
    gg.appendChild(el('circle', { cx: 0, cy: 0, r: 7.4, fill: P.paper, stroke: P.ink, 'stroke-width': 2.4 }));
    [-3, 0, 3].forEach(dx => gg.appendChild(el('line', { x1: dx, y1: -6.8, x2: dx, y2: -3.2, stroke: P.ink, 'stroke-width': 1.4 })));
    gg.appendChild(el('path', { d: 'M -5.5 6.5 h 11', stroke: P.ink, 'stroke-width': 1.4 }));
    parent.appendChild(gg); return gg;
  }
  function shoe(parent, x, y, P, rot = 0) {
    const gg = g({ transform: `translate(${x} ${y}) rotate(${rot})` });
    gg.appendChild(el('ellipse', { cx: 0, cy: 0, rx: 8, ry: 4.6, fill: P.ink }));
    gg.appendChild(el('path', { d: 'M -2 -4 q 4 1.6 6 0', stroke: P.paper, 'stroke-width': 1.5, fill: 'none' }));
    parent.appendChild(gg); return gg;
  }
  function limb(parent, d, P, w = 3.4) {
    parent.appendChild(el('path', { d, fill: 'none', stroke: P.ink, 'stroke-width': w, 'stroke-linecap': 'round' }));
  }

  /* characters: local space, facing LEFT by default. opts: {x,y,s,rot,flip,pose,expr,ghost,cls,depth} */
  function place(ctx, parent, opts) {
    const gg = g({
      transform: `translate(${opts.x} ${opts.y}) rotate(${opts.rot || 0}) ${opts.flip ? 'scale(-1,1)' : ''} scale(${opts.s || 1})`,
      class: (opts.cls || 'lyr') + (opts.ghost ? '' : ''),
      'data-depth': opts.depth != null ? opts.depth : 1,
    });
    parent.appendChild(gg); return gg;
  }

  const CH = {};
  CH.pizza = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    const S = o.ghost ? { fill: o.ghostColor || P.ink, stroke: 'none' } : null;
    // legs behind body — explicit per-pose foot anchors so shoes land on the ankles
    if (!o.ghost) {
      const LEGS = {
        peek: null,
        summit_flag: { d: ['M -9 34 q -4 10 -12 12', 'M 9 34 q 4 10 12 12'], f: [[-21, 46, -8], [21, 46, 8]] },
        sprint: { d: ['M -9 34 q -12 8 -20 6', 'M 9 34 q 8 12 16 14'], f: [[-29, 40, -24], [25, 48, 18]] },
        cape_sprint: { d: ['M -9 34 q -12 8 -20 6', 'M 9 34 q 8 12 16 14'], f: [[-29, 40, -24], [25, 48, 18]] },
        flag_leap: { d: ['M -9 34 q -10 4 -18 2', 'M 9 34 q 6 12 14 16'], f: [[-27, 36, -28], [23, 50, 20]] },
        march: { d: ['M -9 34 q -6 10 -14 10', 'M 9 34 q 4 10 10 12'], f: [[-23, 44, -12], [19, 46, 12]] },
      };
      const legset = LEGS[o.pose] || { d: ['M -9 34 q -3 9 -9 11', 'M 9 34 q 3 9 9 11'], f: [[-18, 45, -10], [18, 45, 10]] };
      legset.d.forEach((d, i) => { limb(gg, d, P); shoe(gg, legset.f[i][0], legset.f[i][1], P, legset.f[i][2]); });
    }
    // body (cheese wedge, crust on top)
    gg.appendChild(el('path', { d: 'M -33 -20 L 33 -20 L 10 42 Q 0 49 -10 42 Z', fill: o.ghost ? S.fill : P.gold, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      gg.appendChild(el('path', { d: 'M -36 -20 Q 0 -31 36 -20 L 34 -10 Q 0 -20 -34 -10 Z', fill: P.accentDeep, stroke: P.ink, 'stroke-width': 2.6 }));
      [[-16, 0], [15, -1], [0, 17]].forEach(([px, py]) => gg.appendChild(el('circle', { cx: px, cy: py, r: 4.6, fill: P.red, stroke: P.ink, 'stroke-width': 1.1 })));
      // misregistration ghost of the body outline
      gg.appendChild(el('path', { d: 'M -33 -20 L 33 -20 L 10 42 Q 0 49 -10 42 Z', fill: 'none', stroke: P.accent, 'stroke-width': 1.6, opacity: 0.5, transform: 'translate(2 1.5)', style: 'mix-blend-mode:multiply' }));
      const ex = o.expr || 'happy', eyeV = ex === 'shock' ? 'shock' : ex === 'determined' ? 'open' : 'open';
      eye(gg, -11, -5, 5, P, eyeV); eye(gg, 11, -5, 5, P, ex === 'wink' ? 'happy' : eyeV);
      if (ex === 'determined') brows(gg, -11, 11, -14, P, 'determined');
      if (ex === 'worried') brows(gg, -11, 11, -13, P, 'worried');
      mouth(gg, 0, 6, P, ex === 'grin' ? 'grin' : ex === 'shock' ? 'ooh' : ex === 'determined' ? 'grim' : 'smile');
      if (o.blush) { gg.appendChild(el('circle', { cx: -17, cy: 4, r: 3, fill: P.red, opacity: 0.5 })); gg.appendChild(el('circle', { cx: 17, cy: 4, r: 3, fill: P.red, opacity: 0.5 })); }
      // arms — explicit per-pose glove anchors
      const ARMS = {
        peek: { d: ['M -24 -8 Q -34 -16 -31 -27', 'M 24 -8 Q 34 -16 31 -27'], gv: [[-31, -27, -30], [31, -27, 30]] },
        flag_leap: { d: ['M -24 -6 Q -36 2 -30 12', 'M 24 -8 Q 34 -18 30 -30'], gv: [[-30, 12, 24], [30, -30, 42]] },
        cape_sprint: { d: ['M -24 -6 Q -36 -2 -42 -12', 'M 24 -6 Q 34 0 40 -6'], gv: [[-42, -12, -52], [40, -6, 52]] },
        summit_flag: { d: ['M -24 -6 Q -34 -14 -32 -26', 'M 24 -6 Q 32 2 24 8'], gv: [[-32, -26, -32], [24, 8, -72]] },
        march: { d: ['M -24 -6 Q -34 0 -40 -8', 'M 24 -8 Q 32 -16 30 -28'], gv: [[-40, -8, -42], [30, -28, 42]] },
        sealed: { d: ['M -24 -6 Q -30 -2 -26 2', 'M 24 -6 Q 30 -2 26 2'], gv: [[-26, 2, 0], [26, 2, 0]] },
      };
      const arms = ARMS[o.pose] || ARMS.sealed;
      limb(gg, arms.d[0], P); glove(gg, arms.gv[0][0], arms.gv[0][1], arms.gv[0][2], P);
      limb(gg, arms.d[1], P); glove(gg, arms.gv[1][0], arms.gv[1][1], arms.gv[1][2], P);
    }
    return gg;
  };

  CH.croissant = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    const fill = o.ghost ? (o.ghostColor || P.ink) : P.accent2;
    const body = g({});
    body.appendChild(el('path', { d: 'M -20 -8 Q -44 -18 -50 -2 Q -44 8 -20 8 Q -8 12 0 12 Q 8 12 20 8 Q 44 8 50 -2 Q 44 -18 20 -8 Q 10 -18 0 -18 Q -10 -18 -20 -8 Z', fill, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      body.appendChild(el('path', { d: 'M -16 -10 Q -22 0 -16 9', fill: 'none', stroke: P.accentDeep, 'stroke-width': 2 }));
      body.appendChild(el('path', { d: 'M 16 -10 Q 22 0 16 9', fill: 'none', stroke: P.accentDeep, 'stroke-width': 2 }));
      body.appendChild(el('path', { d: 'M -30 -9 Q -35 -2 -30 5', fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.6 }));
      body.appendChild(el('path', { d: 'M 30 -9 Q 35 -2 30 5', fill: 'none', stroke: P.accentDeep, 'stroke-width': 1.6 }));
      body.appendChild(el('path', { d: 'M -33 -20 L 33 -20 L 10 42 Q 0 49 -10 42 Z', fill: P.accent, opacity: 0.5, transform: 'translate(2 1.5) scale(0.5)', style: 'mix-blend-mode:multiply;display:none' }));
      const ex = o.expr || 'determined';
      eye(body, -9, -4, 4.2, P, 'open'); eye(body, 9, -4, 4.2, P, ex === 'glance' ? 'open' : 'open');
      if (ex === 'determined' || ex === 'glance') brows(body, -9, 9, -12, P, 'determined');
      if (ex === 'worried') brows(body, -9, 9, -11, P, 'worried');
      mouth(body, 0, 5, P, ex === 'grin' ? 'grin' : ex === 'happy' ? 'smile' : 'grim');
      if (o.sweat) body.appendChild(el('path', { d: 'M 16 -14 q 3 5 0 8 q -3 -3 0 -8', fill: P.blue, stroke: P.ink, 'stroke-width': 1 }));
      gg.appendChild(body);
      // per-pose limb paths with explicit glove/foot anchors
      const P2 = {
        sprint: {
          a: [['M -18 8 Q -28 14 -34 8', -34, 8, -40], ['M 16 10 Q 24 16 30 12', 30, 12, 40]],
          l: [['M -7 14 q -10 8 -18 8', -25, 22, -12], ['M 7 14 q 8 10 16 12', 23, 26, 14]],
        },
        glance_back: {
          a: [['M -18 8 Q -28 14 -34 8', -34, 8, -40], ['M 16 10 Q 24 16 30 12', 30, 12, 40]],
          l: [['M -7 14 q -10 8 -18 8', -25, 22, -12], ['M 7 14 q 8 10 16 12', 23, 26, 14]],
        },
        leap: {
          a: [['M -18 4 Q -30 -2 -36 -10', -36, -10, -52], ['M 16 10 Q 26 14 34 10', 34, 10, 52]],
          l: [['M -7 14 q -12 6 -20 4', -27, 18, -24], ['M 7 14 q 10 10 18 14', 25, 28, 20]],
        },
        catch: {
          a: [['M -18 2 Q -30 -6 -34 -16', -34, -16, -58], ['M 16 2 Q 28 -6 32 -16', 32, -16, 58]],
          l: [['M -7 14 q -14 4 -22 0', -29, 14, -30], ['M 7 14 q 12 8 20 12', 27, 26, 22]],
        },
      };
      const pp = P2[o.pose] || P2.sprint;
      pp.l.forEach(([d, gx, gy, gr]) => { limb(gg, d, P); shoe(gg, gx, gy, P, gr); });
      pp.a.forEach(([d, gx, gy, gr]) => { limb(gg, d, P); glove(gg, gx, gy, gr, P); });
    } else gg.appendChild(body);
    return gg;
  };

  CH.loaf = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    if (!o.ghost) {
      limb(gg, 'M -9 14 q -4 9 -10 11', P); shoe(gg, -19, 25, P, -10);
      limb(gg, 'M 9 14 q 4 9 10 11', P); shoe(gg, 19, 25, P, 10);
    }
    gg.appendChild(el('path', { d: 'M -34 16 Q -36 -22 0 -22 Q 36 -22 34 16 Q 0 21 -34 16 Z', fill: o.ghost ? (o.ghostColor || P.ink) : P.gold, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      [-16, 0, 16].forEach(dx => gg.appendChild(el('path', { d: `M ${dx - 4} ${-13 + Math.abs(dx) * 0.12} q 6 -4 9 2`, fill: 'none', stroke: P.accentDeep, 'stroke-width': 2.4, 'stroke-linecap': 'round' })));
      gg.appendChild(el('path', { d: 'M -34 8 Q 0 13 34 8 L 34 16 Q 0 21 -34 16 Z', fill: P.accent2, opacity: 0.5 }));
      const ex = o.expr || 'happy';
      eye(gg, -9, -1, 4.4, P); eye(gg, 9, -1, 4.4, P);
      mouth(gg, 0, 9, P, ex === 'grin' ? 'grin' : 'smile');
      const arms = o.pose === 'cheer' ? ['M -26 4 Q -36 -4 -38 -14', 'M 26 4 Q 36 -4 38 -14'] : ['M -26 4 Q -34 8 -38 2', 'M 26 4 Q 34 0 38 8'];
      limb(gg, arms[0], P); glove(gg, -38, arms[0].includes('-14') ? -14 : 2, -30, P);
      limb(gg, arms[1], P); glove(gg, 38, arms[1].includes('-14') ? -14 : 8, 30, P);
    }
    return gg;
  };

  CH.cup = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    if (!o.ghost) {
      limb(gg, 'M -8 24 q -4 8 -10 10', P); shoe(gg, -18, 34, P, -10);
      limb(gg, 'M 8 24 q 4 8 10 10', P); shoe(gg, 18, 34, P, 10);
    }
    gg.appendChild(el('path', { d: 'M -27 -22 L 27 -22 L 21 26 Q 0 30 -21 26 Z', fill: o.ghost ? (o.ghostColor || P.ink) : P.paper, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      gg.appendChild(el('ellipse', { cx: 0, cy: -23, rx: 29, ry: 6.5, fill: P.panel, stroke: P.ink, 'stroke-width': 2.6 }));
      gg.appendChild(el('circle', { cx: 0, cy: -31, r: 4.5, fill: P.accent, stroke: P.ink, 'stroke-width': 2 }));
      gg.appendChild(el('path', { d: 'M -22 2 L 22 2 L 20 14 Q 0 17 -20 14 Z', fill: P.accent, stroke: P.ink, 'stroke-width': 2.2 }));
      T(gg, 0, 11.5, 'DIBZ', { size: 6.5, font: DISP, fill: P.paper, fa: false, ls: '1px' });
      eye(gg, -9, -9, 4, P); eye(gg, 9, -9, 4, P);
      mouth(gg, 0, -1, P, 'smile');
      const arms = o.pose === 'cymbal' ? ['M -24 -6 Q -34 -12 -36 -20', 'M 24 -6 Q 34 -12 36 -20'] : ['M -24 -4 Q -32 2 -36 -4', 'M 24 -4 Q 32 -10 36 -2'];
      limb(gg, arms[0], P); glove(gg, -36, arms[0].includes('-20') ? -20 : -4, -30, P);
      limb(gg, arms[1], P); glove(gg, 36, arms[1].includes('-20') ? -20 : -2, 30, P);
    }
    return gg;
  };

  CH.donut = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    if (!o.ghost) {
      limb(gg, 'M -8 24 q -4 8 -10 10', P); shoe(gg, -18, 34, P, -10);
      limb(gg, 'M 8 24 q 4 8 10 10', P); shoe(gg, 18, 34, P, 10);
    }
    gg.appendChild(el('circle', { cx: 0, cy: 0, r: 28, fill: o.ghost ? (o.ghostColor || P.ink) : P.gold, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      gg.appendChild(el('circle', { cx: 0, cy: 0, r: 28, fill: P.accent, opacity: 0.45 }));
      gg.appendChild(el('circle', { cx: 0, cy: 0, r: 8.5, fill: P.paper, stroke: P.ink, 'stroke-width': 2.6 }));
      gg.appendChild(el('path', { d: 'M -27 -6 Q -20 -18 -8 -14 Q 0 -22 10 -13 Q 22 -16 26 -4 Q 20 4 12 1 Q 4 8 -6 2 Q -18 6 -27 -6 Z', fill: P.accent2, stroke: P.ink, 'stroke-width': 2.2 }));
      [[-18, -10], [-6, -16], [8, -12], [18, -8], [-12, -6], [14, -2]].forEach(([sx, sy], i) => gg.appendChild(el('rect', { x: sx - 2.6, y: sy - 1, width: 5.2, height: 2, rx: 1, fill: [P.red, P.green, P.paper][i % 3], transform: `rotate(${i * 33} ${sx} ${sy})` })));
      eye(gg, -10, 8, 4.2, P); eye(gg, 10, 8, 4.2, P);
      mouth(gg, 0, 16, P, o.expr === 'grin' ? 'grin' : 'smile');
      const arms = o.pose === 'cheer' ? ['M -26 10 Q -36 4 -38 -6', 'M 26 10 Q 36 4 38 -6'] : ['M -26 12 Q -34 16 -36 8', 'M 26 12 Q 34 16 36 8'];
      limb(gg, arms[0], P); glove(gg, -38, arms[0].includes('-6') ? -6 : 8, -30, P);
      limb(gg, arms[1], P); glove(gg, 38, arms[1].includes('-6') ? -6 : 8, 30, P);
    }
    return gg;
  };

  CH.baguette = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    gg.appendChild(el('ellipse', { cx: 0, cy: 0, rx: 66, ry: 15, fill: o.ghost ? (o.ghostColor || P.ink) : P.gold, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      [-42, -20, 2, 24].forEach(dx => gg.appendChild(el('line', { x1: dx, y1: -11, x2: dx + 9, y2: -3, stroke: P.accentDeep, 'stroke-width': 2.2, 'stroke-linecap': 'round' })));
      eye(gg, -50, -4, 4, P); eye(gg, -38, -2, 4, P);
      mouth(gg, -44, 5, P, 'grin');
      limb(gg, 'M -56 6 Q -64 0 -66 -8', P); glove(gg, -66, -8, -40, P);
    }
    return gg;
  };

  CH.roll = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    gg.appendChild(el('ellipse', { cx: 0, cy: 0, rx: 16, ry: 13, fill: o.ghost ? (o.ghostColor || P.ink) : P.gold, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 2.6 }));
    if (!o.ghost) {
      eye(gg, -5, -2, 3, P); eye(gg, 5, -2, 3, P);
      mouth(gg, 0, 5, P, 'grin');
      limb(gg, 'M -13 2 Q -19 -4 -20 -10', P); glove(gg, -20, -10, -30, P);
      limb(gg, 'M 13 2 Q 19 -4 20 -10', P); glove(gg, 20, -10, 30, P);
    }
    return gg;
  };

  CH.bag = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    const open = o.open;
    if (open && !o.ghost) { // open flap behind
      gg.appendChild(el('path', { d: 'M -40 -44 Q -52 -74 -30 -78 Q -6 -84 12 -76 Q 30 -70 40 -44 Z', fill: P.accentDeep, stroke: P.ink, 'stroke-width': 2.6 }));
      gg.appendChild(el('ellipse', { cx: 0, cy: -46, rx: 38, ry: 9, fill: P.inkSoft, opacity: 0.5 }));
    }
    gg.appendChild(el('path', { d: 'M -34 -46 L 34 -46 L 27 46 L -27 46 Z', fill: o.ghost ? (o.ghostColor || P.ink) : P.paper, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      // folded zigzag top
      gg.appendChild(el('path', { d: 'M -34 -46 L -26 -38 L -17 -46 L -8 -38 L 1 -46 L 10 -38 L 19 -46 L 28 -38 L 34 -46', fill: 'none', stroke: P.inkSoft, 'stroke-width': 2 }));
      gg.appendChild(el('path', { d: 'M -34 -46 L 34 -46 L 33 -38 L -33 -38 Z', fill: P.paperShade, stroke: P.ink, 'stroke-width': 1.6 }));
      gg.appendChild(el('path', { d: 'M -24 -20 L 24 -20 L 22 8 L -22 8 Z', fill: P.accent, stroke: P.ink, 'stroke-width': 2 }));
      T(gg, 0, -1, 'DIBZ', { size: 12, font: DISP, fill: P.paper, fa: false, ls: '1px' });
      leafGlyph(gg, 0, 20, 5, P.accentDeep);
      if (open) { // crinkle lines
        gg.appendChild(el('path', { d: 'M -18 -30 q 4 8 0 14 M 6 -32 q 4 8 0 14', fill: 'none', stroke: P.inkSoft, 'stroke-width': 1.4 }));
        // peeking light
        gg.appendChild(el('path', { d: 'M -30 -46 L 30 -46 L 26 -30 L -26 -30 Z', fill: P.gold, opacity: 0.4 }));
      }
    }
    return gg;
  };

  CH.alarmClock = function (ctx, parent, o) {
    const P = ctx.P, gg = place(ctx, parent, o);
    const r = o.r || 34;
    if (o.legs && !o.ghost) {
      limb(gg, 'M -16 30 q -6 10 -14 12', P); shoe(gg, -30, 42, P, -14);
      limb(gg, 'M 16 30 q 6 10 14 12', P); shoe(gg, 30, 42, P, 14);
    }
    if (!o.ghost) {
      [-1, 1].forEach(s => {
        gg.appendChild(el('circle', { cx: s * (r * 0.72), cy: -r - 6, r: r * 0.22, fill: P.accent, stroke: P.ink, 'stroke-width': 2.2 }));
        gg.appendChild(el('line', { x1: s * r * 0.6, y1: -r + 1, x2: s * r * 0.74, y2: -r - 3, stroke: P.ink, 'stroke-width': 2.2 }));
      });
    }
    gg.appendChild(el('circle', { cx: 0, cy: 0, r, fill: o.ghost ? (o.ghostColor || P.ink) : P.panel, stroke: o.ghost ? 'none' : P.ink, 'stroke-width': 3 }));
    if (!o.ghost) {
      gg.appendChild(el('circle', { cx: 0, cy: 0, r: r - 5, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1 }));
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, big = i % 3 === 0;
        gg.appendChild(el('line', {
          x1: (r - (big ? 10 : 7)) * Math.cos(a), y1: (r - (big ? 10 : 7)) * Math.sin(a),
          x2: (r - 3) * Math.cos(a), y2: (r - 3) * Math.sin(a), stroke: P.ink, 'stroke-width': big ? 2 : 1.2,
        }));
      }
      if (o.hands) {
        const [ha, ma] = o.hands;
        const hand = (ang, len, w, cls) => gg.appendChild(el('line', {
          x1: 0, y1: 0, x2: len * Math.sin(ang * Math.PI / 180), y2: -len * Math.cos(ang * Math.PI / 180),
          stroke: P.ink, 'stroke-width': w, 'stroke-linecap': 'round', class: cls || null,
        }));
        hand(ha, r * 0.45, 4); hand(ma, r * 0.66, 3, o.tick ? 'a-tick' : null);
        gg.appendChild(el('circle', { r: 2.6, fill: P.ink }));
      }
      if (o.face) {
        brows(gg, -11, 11, -r * 0.52, P, o.face === 'angry' ? 'angry' : 'worried');
        eye(gg, -11, -r * 0.3, 4.6, P); eye(gg, 11, -r * 0.3, 4.6, P);
        mouth(gg, 0, r * 0.2, P, o.face === 'angry' ? 'grim' : 'ooh');
      }
      if (o.legs) { /* legs drawn pre-body above */ }
    }
    return gg;
  };

  CH.pocketWatch = function (ctx, parent, o) {
    const P = ctx.P, gg = g({ transform: `translate(${o.x} ${o.y})`, class: 'lyr', 'data-depth': 0.4 });
    gg.appendChild(el('path', { d: `M 0 0 q ${o.chainDx || 14} ${o.chainDy || -10} ${o.chainX || 30} ${o.chainY || -40}`, fill: 'none', stroke: P.inkSoft, 'stroke-width': 1.4, 'stroke-dasharray': '2.5 2' }));
    gg.appendChild(el('circle', { cx: 0, cy: 26, r: 14, fill: P.gold, stroke: P.ink, 'stroke-width': 2.4 }));
    gg.appendChild(el('circle', { cx: 0, cy: 26, r: 10.5, fill: P.paper, stroke: P.inkSoft, 'stroke-width': 1 }));
    gg.appendChild(el('line', { x1: 0, y1: 26, x2: 0, y2: 20, stroke: P.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }));
    gg.appendChild(el('line', { x1: 0, y1: 26, x2: 5, y2: 28, stroke: P.ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' }));
    gg.appendChild(el('rect', { x: -2.5, y: 9, width: 5, height: 4, rx: 1, fill: P.ink }));
    parent.appendChild(gg); return gg;
  };

  CH.gloveHand = function (ctx, parent, o) {
    const P = ctx.P, gg = g({ transform: `translate(${o.x} ${o.y}) rotate(${o.rot || 0}) scale(${o.s || 1})`, class: o.cls || 'lyr', 'data-depth': o.depth != null ? o.depth : 0.8 });
    [-26, -9, 8, 25].forEach((a, i) => {
      gg.appendChild(el('rect', { x: -5, y: -34 - (i === 1 || i === 2 ? 8 : 0), width: 10, height: 30, rx: 5, fill: P.paper, stroke: P.ink, 'stroke-width': 2.4, transform: `rotate(${a * 0.45}) translate(${a * 0.24} 0)` }));
    });
    gg.appendChild(el('circle', { cx: 0, cy: 0, r: 16, fill: P.paper, stroke: P.ink, 'stroke-width': 2.6 }));
    gg.appendChild(el('rect', { x: -17, y: 12, width: 34, height: 12, rx: 4, fill: P.accent, stroke: P.ink, 'stroke-width': 2.4 }));
    gg.appendChild(el('line', { x1: -17, y1: 18, x2: 17, y2: 18, stroke: P.ink, 'stroke-width': 1.2, opacity: 0.6 }));
    parent.appendChild(gg); return gg;
  };

  CH.moon = function (ctx, parent, o) {
    const P = ctx.P, gg = g({ transform: `translate(${o.x} ${o.y}) scale(${o.s || 1})`, class: 'lyr', 'data-depth': 0.3 });
    gg.appendChild(el('path', { d: 'M 8 -22 A 23 23 0 1 0 8 22 A 28 28 0 0 1 8 -22 Z', fill: P.gold, stroke: P.ink, 'stroke-width': 2.4 }));
    gg.appendChild(el('path', { d: 'M -12 -6 Q -8 -1 -12 3', fill: 'none', stroke: P.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }));
    gg.appendChild(el('path', { d: 'M -14 10 Q -9 14 -4 11', fill: 'none', stroke: P.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }));
    parent.appendChild(gg); return gg;
  };

  CH.snail = function (ctx, parent, o) {
    const P = ctx.P, gg = g({ transform: `translate(${o.x} ${o.y}) scale(${o.s || 1})`, class: 'lyr', 'data-depth': 0.5 });
    gg.appendChild(el('path', { d: 'M -14 8 Q -12 2 -4 3 L 12 6 Q 16 8 14 9 L -12 10 Z', fill: P.accent2, stroke: P.ink, 'stroke-width': 1.8 }));
    gg.appendChild(el('circle', { cx: 2, cy: -3, r: 9, fill: P.gold, stroke: P.ink, 'stroke-width': 2 }));
    gg.appendChild(el('path', { d: 'M 2 -3 m -5 0 a 5 5 0 1 1 5 5', fill: 'none', stroke: P.ink, 'stroke-width': 1.2 }));
    gg.appendChild(el('line', { x1: -10, y1: 2, x2: -13, y2: -8, stroke: P.ink, 'stroke-width': 1.6 }));
    gg.appendChild(el('line', { x1: -6, y1: 1, x2: -6, y2: -9, stroke: P.ink, 'stroke-width': 1.6 }));
    eye(gg, -13, -10, 2.2, P); eye(gg, -6, -11, 2.2, P);
    gg.appendChild(el('path', { d: 'M -17 -13 a 5 5 0 0 1 9 -1 l -9 1 Z', fill: P.accent, stroke: P.ink, 'stroke-width': 1 })); // dibz cap
    parent.appendChild(gg); return gg;
  };

  /* receipt: flag on a pole / cape / plain — inner group carries the wave animation */
  function receiptFlag(ctx, parent, { x, y, pole = 0, w = 30, h = 34, wave = false, cape = false, rot = 0 }) {
    const P = ctx.P, gg = g({ transform: `translate(${x} ${y}) rotate(${rot})` });
    const inner = g({ class: wave ? 'lyr a-flag' : 'lyr', 'data-depth': 0.85 });
    if (pole) inner.appendChild(el('line', { x1: 0, y1: 2, x2: 0, y2: -pole, stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }));
    const top = cape ? 0 : -(pole || 0);
    const jag = cape
      ? `M 0 0 L ${w} 2 L ${w} ${h} l -5 -6 l -5 6 l -5 -6 l -5 6 l -5 -6 l -5 6 l -5 -6 l -5 6 Z`
      : `M 0 ${top} L ${w} ${top + 2} L ${w} ${top + h} l -5 -6 l -5 6 l -5 -6 l -5 6 l -5 -6 l -5 6 Z`;
    inner.appendChild(el('path', { d: jag, fill: P.paper, stroke: P.ink, 'stroke-width': 2.2 }));
    for (let i = 1; i <= 3; i++) inner.appendChild(el('line', { x1: 4, y1: (cape ? 0 : top) + i * (h / 4.4), x2: w - 5, y2: (cape ? 0 : top) + i * (h / 4.4), stroke: P.inkSoft, 'stroke-width': 1.2, 'stroke-dasharray': '3 2.5' }));
    gg.appendChild(inner);
    parent.appendChild(gg); return gg;
  }

  DIBZ.L = {
    el, g, T, U, faNum, rng, W, H, ART, scallopPath, scallopCircle,
    defs, paper, finishCard, header, titleBlock, frames,
    star4, leafGlyph, dotStamp, rubberStamp, sealStamp, tierRosette, lockSeal, barcode, frameUnderlay,
    sunburst, halfSun, cloud, bird, groundLine, skyline, confetti, speedLines, dust, steam,
    stars, spotlight, bunting, stringLights, balloon, plane, lamp, questionMark, streamer, foilSweep,
    eye, brows, mouth, glove, shoe, limb, receiptFlag, CH,
  };
})();
