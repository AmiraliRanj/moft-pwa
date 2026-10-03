/* ============================================================
   DIBZ — Collectible Achievement Cards · data layer
   15 prototype cards = 3 families × 5 stages (locked → final)
   Every card is described by data; renderer.js + scenes.js draw it.
   ============================================================ */
window.DIBZ = window.DIBZ || {};

/* ------------------------------------------------------------
   Editions. An edition is a *treatment axis*, independent of tier.
   It recolors the whole layer stack and may add overlay layers
   (stars, mastheads, tile ornaments). No procedural randomness.
   ------------------------------------------------------------ */
DIBZ.EDITIONS = {
  base: {
    key: 'base', label: 'پایه', labelEn: 'Base',
    paper: '#F6ECD9', paperShade: '#EADFC6', panel: '#F9F0DE',
    ink: '#2E2418', inkSoft: '#5C4A33',
    accent: '#F87F45', accent2: '#FDA74D', accentDeep: '#E2622F',
    green: '#3E7350', greenDeep: '#2F5B3E',
    gold: '#E9B94E', red: '#DF5A3A', blue: '#8FB6CE',
    skyTop: '#F7E7C4', skyBottom: '#F4CD8C',
    overlay: null,
  },
  midnight: {
    key: 'midnight', label: 'نیمه‌شب', labelEn: 'Midnight',
    paper: '#262C40', paperShade: '#1E2334', panel: '#2C3350',
    ink: '#F2E7D2', inkSoft: '#B9AFCB',
    accent: '#F87F45', accent2: '#FDA74D', accentDeep: '#E2622F',
    green: '#5E8F7C', greenDeep: '#41685B',
    gold: '#EFC766', red: '#E4694C', blue: '#8FB6CE',
    skyTop: '#1B2032', skyBottom: '#333B5C',
    overlay: 'stars',
  },
  news: {
    key: 'news', label: 'روزنامه', labelEn: 'Newspaper',
    paper: '#F0EBE1', paperShade: '#DDD6C7', panel: '#F5F1E8',
    ink: '#2A2620', inkSoft: '#6E675C',
    accent: '#C0402A', accent2: '#C0402A', accentDeep: '#8E2F1E',
    green: '#4A463E', greenDeep: '#33302A',
    gold: '#8F887A', red: '#C0402A', blue: '#8A8478',
    skyTop: '#F0EBE1', skyBottom: '#E2DCCE',
    overlay: 'masthead',
  },
  bazaar: {
    key: 'bazaar', label: 'بازار', labelEn: 'Bazaar',
    paper: '#F2DFC2', paperShade: '#E6CDAA', panel: '#F6E6CC',
    ink: '#3A2418', inkSoft: '#7A5A3E',
    accent: '#C25A3A', accent2: '#E08A4E', accentDeep: '#9E4426',
    green: '#2F6D62', greenDeep: '#235249',
    gold: '#D9A13E', red: '#B03A2E', blue: '#4E8A8F',
    skyTop: '#F4E2BE', skyBottom: '#ECC795',
    overlay: 'tiles',
  },
};

/* ------------------------------------------------------------
   Card families. tierNotes[] = the one-line "what changed" captions
   shown under each card in the prototype page.
   ------------------------------------------------------------ */
DIBZ.FAMILIES = {
  escape: {
    id: 'escape',
    name: 'The Great Escape',
    fa: 'فرار بزرگ',
    archetype: 'First Rescue',
    range: [1, 10, 25, 50],
    story: 'Your very first rescue, retold as a prison-break: a pizza slice slips out of a Dibz paper bag with the receipt raised like a victory flag. As your journey grows, the legend of that first escape grows with it.',
    tiers: ['Sealed kraft card: a bag silhouette with a glowing seam and a peeking tip.',
            'Head peeks out of the bag — timid smile, bare cardboard frame.',
            'Full leap, receipt flag raised, coupon frame, first ink stamp.',
            'A freed friend cheers from the bag — full ticket with stub and No. 001.',
            'Summit scene: flag planted, dawn sunburst, gold foil frame, living animation.'],
  },
  clock: {
    id: 'clock',
    name: 'Against the Clock',
    fa: 'علیه ساعت',
    archetype: 'Last-minute rescue',
    range: [1, 3, 7, 15],
    story: 'A croissant sprints away from a clock that has grown legs. The pickup window is closing; your gloved hand reaches in at 23:59. The card celebrates calm speed, not panic.',
    tiers: ['A frozen silhouette clock in the fog, a runner-shaped shadow below.',
            'Sprint begins — pocket watch dangles from the frame, dust puffs trail.',
            'The clock grows legs and gives chase — torn-paper coupon edge, sunset band.',
            'Your gloved hand reaches in at 23:59 — the leap of faith, ticket frame.',
            'Midnight catch under a swinging pendulum — navy foil frame, ticking animation.'],
  },
  parade: {
    id: 'parade',
    name: 'The Rescue Parade',
    fa: 'رژه نجات',
    archetype: 'Rescue milestone',
    range: [10, 25, 50, 100],
    story: 'Every confirmed pickup is one more character joining the parade. One lonely marcher becomes a street festival — the crowd is literally made of the food you saved.',
    tiers: ['A dark stage, one spotlight, a silhouette holding a baton.',
            'One marcher, one drum, one flag — the parade exists.',
            'Three marchers and a banner — bunting, cymbals, coupon frame.',
            'A street procession with a baguette float — crowd hands wave from the edge.',
            'Golden-hour grand parade over the city — ribbon frame, confetti rain, gold seal.'],
  },
};

/* ------------------------------------------------------------
   The 15 cards. `json` mirrors the production config schema
   (see README §schema) — the prototype renders straight from it.
   ------------------------------------------------------------ */
DIBZ.CARDS = [
  /* ——— Family 1 · The Great Escape ——— */
  {
    id: 'escape_0', family: 'escape', tier: 0, no: '01',
    title: 'نجات اول', sub: 'هنوز توی کیسه است…',
    hint: 'اولین جعبه‌ات را نجات بده', stats: null,
    json: {
      schema: 'dibz.card/1', achievementId: 'first_rescue', tier: 0, edition: 'base',
      seed: 4217, issuedAt: null,
      art: { frame: 'locked_seal', character: 'pizza', pose: 'sealed', background: 'kraft_blank',
             props: ['bag_closed', 'seam_glow', 'question_marks'], stamp: 'lock', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'escape_1', family: 'escape', tier: 1, no: '01',
    title: 'نجات اول', sub: 'اولین جعبه، آزاد شد',
    stats: '۱ نجات • درجه ۱',
    json: {
      schema: 'dibz.card/1', achievementId: 'first_rescue', tier: 1, edition: 'base',
      seed: 4217, issuedAt: '2026-10-03',
      art: { frame: 'cardboard_01', character: 'pizza', pose: 'peek', background: 'flat_horizon',
             props: ['bag_open', 'blush', 'confetti_1'], stamp: 'dibz_dot', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'escape_2', family: 'escape', tier: 2, no: '01',
    title: 'نجات اول', sub: 'رسید، پرچم آزادی شد',
    stats: '۱۰ نجات • درجه ۲',
    json: {
      schema: 'dibz.card/1', achievementId: 'first_rescue', tier: 2, edition: 'base',
      seed: 4217, issuedAt: '2026-10-03',
      art: { frame: 'coupon_02', character: 'pizza', pose: 'flag_leap', background: 'quarter_burst',
             props: ['bag_open', 'receipt_flag', 'steam', 'birds_2', 'confetti_4'], stamp: 'rescued', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'escape_3', family: 'escape', tier: 3, no: '01',
    title: 'نجات اول', sub: 'یک رفیق هم نجات پیدا کرد',
    stats: '۲۵ نجات • درجه ۳',
    json: {
      schema: 'dibz.card/1', achievementId: 'first_rescue', tier: 3, edition: 'base',
      seed: 4217, issuedAt: '2026-10-03',
      art: { frame: 'ticket_03', character: 'pizza', pose: 'cape_sprint', background: 'street_dawn',
             props: ['bag_tilted', 'roll_friend', 'receipt_cape', 'lamp', 'birds_3', 'clouds_2', 'confetti_6'],
             stamp: 'rescued', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'escape_4', family: 'escape', tier: 4, no: '01',
    title: 'نجات اول', sub: 'افسانه‌ی آغاز تو',
    stats: '۵۰ نجات • درجه نهایی',
    json: {
      schema: 'dibz.card/1', achievementId: 'first_rescue', tier: 4, edition: 'base',
      seed: 4217, issuedAt: '2026-10-03',
      art: { frame: 'foil_final', character: 'pizza', pose: 'summit_flag', background: 'dawn_burst',
             props: ['bag_empty', 'receipt_flagpole', 'paper_planes_3', 'snail_cap', 'confetti_rain'],
             stamp: 'seal_gold', effect: ['foil_sweep', 'rays_slow_spin', 'flag_wave', 'confetti_drift'],
             hidden: ['snail_cap', 'tiny_date'] },
      renderVersion: 1,
    },
  },

  /* ——— Family 2 · Against the Clock ——— */
  {
    id: 'clock_0', family: 'clock', tier: 0, no: '02',
    title: 'علیه ساعت', sub: 'تا نیمه‌شب خیلی وقت نیست…',
    hint: 'یک نجات در آخرین دقیقه', stats: null,
    json: {
      schema: 'dibz.card/1', achievementId: 'last_minute', tier: 0, edition: 'base',
      seed: 9091, issuedAt: null,
      art: { frame: 'locked_seal', character: 'croissant', pose: 'sealed', background: 'clock_fog',
             props: ['clock_face', 'dust_cloud', 'question_marks'], stamp: 'lock', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'clock_1', family: 'clock', tier: 1, no: '02',
    title: 'علیه ساعت', sub: '۲۳:۴۷ — هنوز شدنی است',
    stats: '۱ نجات پایانی • درجه ۱',
    json: {
      schema: 'dibz.card/1', achievementId: 'last_minute', tier: 1, edition: 'base',
      seed: 9091, issuedAt: '2026-10-03',
      art: { frame: 'cardboard_01', character: 'croissant', pose: 'sprint', background: 'low_sun',
             props: ['pocket_watch', 'dust_2', 'speed_2'], stamp: 'dibz_dot', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'clock_2', family: 'clock', tier: 2, no: '02',
    title: 'علیه ساعت', sub: 'ساعت هم دوید!',
    stats: '۳ نجات پایانی • درجه ۲',
    json: {
      schema: 'dibz.card/1', achievementId: 'last_minute', tier: 2, edition: 'base',
      seed: 9091, issuedAt: '2026-10-03',
      art: { frame: 'coupon_02', character: 'croissant', pose: 'glance_back', background: 'sunset_band',
             props: ['clock_legs', 'sweat', 'crumbs', 'speed_5', 'city_line'], stamp: 'urgent', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'clock_3', family: 'clock', tier: 3, no: '02',
    title: 'علیه ساعت', sub: 'دست تو، دقیقه قبل',
    stats: '۷ نجات پایانی • درجه ۳',
    json: {
      schema: 'dibz.card/1', achievementId: 'last_minute', tier: 3, edition: 'base',
      seed: 9091, issuedAt: '2026-10-03',
      art: { frame: 'ticket_03', character: 'croissant', pose: 'leap', background: 'big_sunset',
             props: ['clock_loom', 'glove_reach', 'donut_cheer', 'speed_4', 'dust_3'],
             stamp: 'rescued', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'clock_4', family: 'clock', tier: 4, no: '02',
    title: 'علیه ساعت', sub: 'قهرمان دقیقه نهایی',
    stats: '۱۵ نجات پایانی • درجه نهایی',
    json: {
      schema: 'dibz.card/1', achievementId: 'last_minute', tier: 4, edition: 'base',
      seed: 9091, issuedAt: '2026-10-03',
      art: { frame: 'foil_final_navy', character: 'croissant', pose: 'catch', background: 'midnight_sky',
             props: ['clock_ornate_pendulum', 'glove_catch', 'shockwave', 'stars', 'moon_face', 'shop_glow'],
             stamp: 'seal_gold', effect: ['pendulum_swing', 'tick_hand', 'star_twinkle', 'foil_sweep'],
             hidden: ['waistcoat_mouse'] },
      renderVersion: 1,
    },
  },

  /* ——— Family 3 · The Rescue Parade ——— */
  {
    id: 'parade_0', family: 'parade', tier: 0, no: '03',
    title: 'رژه نجات', sub: 'چراغ‌ها هنوز خاموش‌اند',
    hint: '۱۰ نجات تا شروع رژه', stats: null,
    json: {
      schema: 'dibz.card/1', achievementId: 'rescue_milestone', tier: 0, edition: 'base',
      seed: 7734, issuedAt: null,
      art: { frame: 'locked_seal', character: 'pizza', pose: 'sealed', background: 'dark_stage',
             props: ['spotlight', 'silhouette_baton', 'stars_3'], stamp: 'lock', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'parade_1', family: 'parade', tier: 1, no: '03',
    title: 'رژه نجات', sub: 'قدم اول، تک‌نفره',
    stats: '۱۰ نجات • درجه ۱',
    json: {
      schema: 'dibz.card/1', achievementId: 'rescue_milestone', tier: 1, edition: 'base',
      seed: 7734, issuedAt: '2026-10-03',
      art: { frame: 'cardboard_01', character: 'pizza', pose: 'march', background: 'flat_ground',
             props: ['tiny_flag', 'drum_ground', 'confetti_1'], stamp: 'dibz_dot', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'parade_2', family: 'parade', tier: 2, no: '03',
    title: 'رژه نجات', sub: 'حالا سه نفرند',
    stats: '۲۵ نجات • درجه ۲',
    json: {
      schema: 'dibz.card/1', achievementId: 'rescue_milestone', tier: 2, edition: 'base',
      seed: 7734, issuedAt: '2026-10-03',
      art: { frame: 'coupon_02', character: 'pizza', pose: 'drum_major', background: 'banner_burst',
             props: ['loaf_drum', 'cup_cymbal', 'banner', 'bunting', 'confetti_6'], stamp: 'rescued', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'parade_3', family: 'parade', tier: 3, no: '03',
    title: 'رژه نجات', sub: 'خیابان مال ما شد',
    stats: '۵۰ نجات • درجه ۳',
    json: {
      schema: 'dibz.card/1', achievementId: 'rescue_milestone', tier: 3, edition: 'base',
      seed: 7734, issuedAt: '2026-10-03',
      art: { frame: 'ticket_03', character: 'pizza', pose: 'drum_major', background: 'street_festival',
             props: ['baguette_float', 'donut_wave', 'croissant', 'balloons_3', 'crowd_hands_3', 'confetti_10', 'string_lights'],
             stamp: 'rescued', effect: [], hidden: [] },
      renderVersion: 1,
    },
  },
  {
    id: 'parade_4', family: 'parade', tier: 4, no: '03',
    title: 'رژه نجات', sub: 'شهر، میزبان قهرمان',
    stats: '۱۰۰ نجات • درجه نهایی',
    json: {
      schema: 'dibz.card/1', achievementId: 'rescue_milestone', tier: 4, edition: 'base',
      seed: 7734, issuedAt: '2026-10-03',
      art: { frame: 'foil_final', character: 'pizza', pose: 'drum_major', background: 'golden_city',
             props: ['baguette_float', 'full_band_5', 'balloons_5', 'streamers', 'dibz_storefront', 'paper_planes_2', 'confetti_rain'],
             stamp: 'seal_gold', effect: ['foil_sweep', 'confetti_drift', 'balloon_bob', 'beam_sway'],
             hidden: ['dibz_storefront', 'box_balloon'] },
      renderVersion: 1,
    },
  },
];

/* Tier metadata shared by the page chrome + reveal demo */
DIBZ.TIER_LABELS = [
  { key: 'locked', en: 'LOCKED', fa: 'قفل شده' },
  { key: 't1', en: 'TIER 1', fa: 'درجه ۱' },
  { key: 't2', en: 'TIER 2', fa: 'درجه ۲' },
  { key: 't3', en: 'TIER 3', fa: 'درجه ۳' },
  { key: 'final', en: 'FINAL', fa: 'درجه نهایی' },
];
