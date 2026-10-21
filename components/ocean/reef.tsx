// Procedural reef art: white sand, corals, sponges, seagrass and fish, as inline SVG.
// Everything is generated from a fixed seed, so the server and browser render the
// exact same markup and there is nothing to download besides two small textures.

import type { ReactNode } from 'react';

// ---------- seeded random ----------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;
const r1 = (n: number) => Math.round(n * 10) / 10;

// ---------- palettes (real reef colours, slightly muted by water) ----------

const PAL = {
  staghorn: [['#F2B48A', '#C9744E'], ['#E9C27B', '#B98A3E'], ['#D9A0C9', '#9C5E8C']],
  brain: [['#E6CF8F', '#A88C4A'], ['#C9D58E', '#7F8E45'], ['#E8B98C', '#A9714A']],
  table: [['#B9D7A0', '#6E9461'], ['#E3C59A', '#A58357']],
  fan: ['#B45AA0', '#D9673E', '#8E4FB0'],
  sponge: [['#E9A23B', '#9C5A14'], ['#B05BB5', '#6A2C79'], ['#E36A55', '#943425']],
  anemone: ['#F4D6A8', '#E9B8D9'],
  grass: ['#5E9E62', '#4B8A57', '#77AE6B'],
};

// ---------- coral builders ----------

/** Branching staghorn / finger coral: recursive rounded branches. */
function staghorn(rand: Rand, x: number, y: number, size: number, idx: number): ReactNode {
  const [light, dark] = PAL.staghorn[idx % PAL.staghorn.length];
  const id = `stg${idx}`;
  const segs: string[] = [];
  const tips: [number, number, number][] = [];
  const grow = (px: number, py: number, ang: number, len: number, w: number, depth: number) => {
    const bend = (rand() - 0.5) * 0.5;
    const nx = px + Math.cos(ang) * len;
    const ny = py + Math.sin(ang) * len;
    const cx = px + Math.cos(ang + bend) * len * 0.55;
    const cy = py + Math.sin(ang + bend) * len * 0.55;
    segs.push(`<path d="M${r1(px)} ${r1(py)} Q${r1(cx)} ${r1(cy)} ${r1(nx)} ${r1(ny)}" stroke-width="${r1(w)}"/>`);
    if (depth <= 0 || len < size * 0.08) { tips.push([nx, ny, w]); return; }
    const kids = 2 + (rand() > 0.6 ? 1 : 0);
    for (let k = 0; k < kids; k++) {
      const spread = (k - (kids - 1) / 2) * (0.45 + rand() * 0.3);
      grow(nx, ny, ang + spread + (rand() - 0.5) * 0.25, len * (0.68 + rand() * 0.15), w * 0.78, depth - 1);
    }
  };
  const trunks = 3 + Math.floor(rand() * 2);
  for (let i = 0; i < trunks; i++) {
    grow(x + (rand() - 0.5) * size * 0.4, y, -Math.PI / 2 + (i - (trunks - 1) / 2) * 0.38, size * (0.34 + rand() * 0.08), size * 0.075, 3);
  }
  return (
    <g key={id}>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={dark} /><stop offset="1" stopColor={light} /></linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id})`} strokeLinecap="round" dangerouslySetInnerHTML={{ __html: segs.join('') }} />
      <g fill={light} opacity=".95">
        {tips.map(([tx, ty, w], i) => <circle key={i} cx={r1(tx)} cy={r1(ty)} r={r1(w * 0.62)} />)}
      </g>
    </g>
  );
}

/** Brain coral: a dome with meandering grooves. */
function brain(rand: Rand, x: number, y: number, size: number, idx: number): ReactNode {
  const [light, dark] = PAL.brain[idx % PAL.brain.length];
  const id = `brn${idx}`;
  const rx = size * 0.55, ry = size * 0.38;
  const grooves: string[] = [];
  for (let row = 0; row < 7; row++) {
    const yy = y - ry * 1.6 + row * (ry * 1.6 / 7) + ry * 0.1;
    const half = Math.sqrt(Math.max(0, 1 - ((yy - (y - ry * 0.8)) / (ry * 0.95)) ** 2)) * rx * 0.92;
    if (half < 6) continue;
    let d = `M${r1(x - half)} ${r1(yy)}`;
    const steps = Math.max(3, Math.round(half / 7));
    for (let s = 1; s <= steps; s++) {
      const xx = x - half + (2 * half * s) / steps;
      d += ` Q${r1(xx - half / steps)} ${r1(yy + (s % 2 ? -1 : 1) * (3 + rand() * 4))} ${r1(xx)} ${r1(yy + (rand() - 0.5) * 2)}`;
    }
    grooves.push(d);
  }
  return (
    <g key={id}>
      <defs>
        <radialGradient id={id} cx=".4" cy=".25" r=".9"><stop offset="0" stopColor={light} /><stop offset=".7" stopColor={dark} /><stop offset="1" stopColor="#3D3A26" /></radialGradient>
      </defs>
      <path d={`M${x - rx} ${y} C${x - rx} ${y - ry * 2.1} ${x + rx} ${y - ry * 2.1} ${x + rx} ${y} Z`} fill={`url(#${id})`} />
      <g fill="none" stroke={dark} strokeOpacity=".55" strokeWidth={r1(size * 0.025)} strokeLinecap="round">
        {grooves.map((d, i) => <path key={i} d={d} />)}
      </g>
    </g>
  );
}

/** Table coral: a flat plate on a short stalk. */
function table(rand: Rand, x: number, y: number, size: number, idx: number): ReactNode {
  const [light, dark] = PAL.table[idx % PAL.table.length];
  const id = `tbl${idx}`;
  const w = size * 1.1, top = y - size * 0.55;
  return (
    <g key={id}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient>
      </defs>
      <path d={`M${x - size * 0.06} ${y} L${x - size * 0.04} ${top} L${x + size * 0.05} ${top} L${x + size * 0.07} ${y}Z`} fill={dark} />
      <path d={`M${x - w / 2} ${top + 6} Q${x} ${top - size * 0.18 - rand() * 6} ${x + w / 2} ${top + 4} Q${x + w * 0.2} ${top + size * 0.1} ${x} ${top + size * 0.08} Q${x - w * 0.25} ${top + size * 0.1} ${x - w / 2} ${top + 6}Z`} fill={`url(#${id})`} />
      <path d={`M${x - w / 2 + 4} ${top + 4} Q${x} ${top - size * 0.14} ${x + w / 2 - 4} ${top + 2}`} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
    </g>
  );
}

/** Gorgonian sea fan: fine, flat branching lattice that sways. */
function seaFan(rand: Rand, x: number, y: number, size: number, idx: number): ReactNode {
  const color = PAL.fan[idx % PAL.fan.length];
  const segs: string[] = [];
  const grow = (px: number, py: number, ang: number, len: number, w: number, depth: number) => {
    const nx = px + Math.cos(ang) * len, ny = py + Math.sin(ang) * len;
    segs.push(`<path d="M${r1(px)} ${r1(py)} L${r1(nx)} ${r1(ny)}" stroke-width="${r1(w)}"/>`);
    if (depth <= 0) return;
    grow(nx, ny, ang - 0.32 - rand() * 0.2, len * 0.8, w * 0.75, depth - 1);
    grow(nx, ny, ang + 0.32 + rand() * 0.2, len * 0.8, w * 0.75, depth - 1);
  };
  grow(x, y, -Math.PI / 2, size * 0.24, size * 0.035, 5);
  return (
    <g key={`fan${idx}`} className="reef-sway" style={{ animationDelay: `${-rand() * 6}s` }}>
      <g fill="none" stroke={color} strokeLinecap="round" opacity=".92" dangerouslySetInnerHTML={{ __html: segs.join('') }} />
    </g>
  );
}

/** Tube sponges: a cluster of open cylinders. */
function sponge(rand: Rand, x: number, y: number, size: number, idx: number): ReactNode {
  const [light, dark] = PAL.sponge[idx % PAL.sponge.length];
  const id = `spg${idx}`;
  const tubes = 3 + Math.floor(rand() * 2);
  return (
    <g key={id}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={dark} /><stop offset=".45" stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient>
      </defs>
      {Array.from({ length: tubes }, (_, i) => {
        const tx = x + (i - (tubes - 1) / 2) * size * 0.2 + (rand() - 0.5) * 6;
        const h = size * (0.55 + rand() * 0.55), w = size * (0.14 + rand() * 0.05);
        const lean = (i - (tubes - 1) / 2) * 6;
        return (
          <g key={i}>
            <path d={`M${r1(tx - w / 2)} ${y} L${r1(tx - w / 2 + lean)} ${r1(y - h)} L${r1(tx + w / 2 + lean)} ${r1(y - h)} L${r1(tx + w / 2)} ${y}Z`} fill={`url(#${id})`} />
            <ellipse cx={r1(tx + lean)} cy={r1(y - h)} rx={r1(w / 2)} ry={r1(w * 0.22)} fill="#2A0F14" opacity=".75" />
            <ellipse cx={r1(tx + lean)} cy={r1(y - h)} rx={r1(w / 2)} ry={r1(w * 0.22)} fill="none" stroke={light} strokeWidth="1.5" />
          </g>
        );
      })}
    </g>
  );
}

/** Anemone with swaying tentacles (and sometimes a clownfish). */
function anemone(rand: Rand, x: number, y: number, size: number, idx: number, clown: boolean): ReactNode {
  const color = PAL.anemone[idx % PAL.anemone.length];
  const tent: string[] = [];
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI + (i / 25) * Math.PI;
    const len = size * (0.4 + rand() * 0.25);
    const ex = x + Math.cos(a) * len * 0.9, ey = y - size * 0.15 + Math.sin(a) * len;
    tent.push(`<path d="M${r1(x + Math.cos(a) * size * 0.2)} ${r1(y - size * 0.12)} Q${r1((x + ex) / 2 + (rand() - 0.5) * 10)} ${r1((y + ey) / 2 - 6)} ${r1(ex)} ${r1(ey)}"/>`);
  }
  return (
    <g key={`anm${idx}`}>
      <ellipse cx={x} cy={y - size * 0.06} rx={size * 0.28} ry={size * 0.12} fill="#8C5A6E" />
      <g className="reef-sway reef-sway--fast" fill="none" stroke={color} strokeWidth={r1(size * 0.05)} strokeLinecap="round" opacity=".95" dangerouslySetInnerHTML={{ __html: tent.join('') }} />
      {clown ? (
        <g transform={`translate(${r1(x + size * 0.25)} ${r1(y - size * 0.6)}) scale(${r1(size / 90)})`}><g className="fish-hover">
          <path d="M0 0 C10 -12 34 -12 44 0 C34 12 10 12 0 0Z" fill="#F07C1F" />
          <path d="M44 0 L56 -9 L54 0 L56 9Z" fill="#F07C1F" />
          <path d="M12 -9 C15 -3 15 3 12 9 M28 -10 C31 -3 31 3 28 10" stroke="#fff" strokeWidth="4" fill="none" />
          <circle cx="6" cy="-2" r="1.8" fill="#111" />
        </g></g>
      ) : null}
    </g>
  );
}

function seagrass(rand: Rand, x: number, y: number, size: number, idx: number): ReactNode {
  const blades = 5 + Math.floor(rand() * 5);
  return (
    <g key={`grs${idx}`} className="reef-sway" style={{ animationDelay: `${-rand() * 5}s`, animationDuration: `${5 + rand() * 3}s` }}>
      {Array.from({ length: blades }, (_, i) => {
        const bx = x + (i - blades / 2) * 4, h = size * (0.5 + rand() * 0.6), lean = (rand() - 0.5) * 30;
        return <path key={i} d={`M${r1(bx)} ${y} Q${r1(bx + lean * 0.3)} ${r1(y - h * 0.5)} ${r1(bx + lean)} ${r1(y - h)} Q${r1(bx + lean * 0.3 + 3)} ${r1(y - h * 0.5)} ${r1(bx + 3)} ${y}Z`} fill={PAL.grass[(i + idx) % 3]} />;
      })}
    </g>
  );
}

// ---------- fish ----------

export function Fish({ kind, x, y, scale = 1, flip = false }: { kind: 'tang' | 'chromis' | 'butterfly' | 'wrasse'; x: number; y: number; scale?: number; flip?: boolean }) {
  const t = `translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`;
  if (kind === 'tang') {
    return (
      <g transform={t}>
        <path d="M0 0 C6 -16 30 -18 40 0 C30 18 6 16 0 0Z" fill="#F5D33A" />
        <path d="M40 0 L52 -10 L50 0 L52 10Z" fill="#F5D33A" />
        <path d="M6 -10 C16 -19 30 -16 34 -6" stroke="#E9BE1C" strokeWidth="2" fill="none" />
        <circle cx="7" cy="-3" r="2" fill="#1B1B1B" />
      </g>
    );
  }
  if (kind === 'butterfly') {
    return (
      <g transform={t}>
        <path d="M0 0 C4 -18 30 -20 36 0 C30 20 4 18 0 0Z" fill="#FBF6E8" />
        <path d="M14 -16 L14 16 M22 -17 L22 17" stroke="#1E1E1E" strokeWidth="2.4" />
        <path d="M30 -12 C36 -6 36 6 30 12" stroke="#F2B21C" strokeWidth="5" fill="none" />
        <path d="M36 0 L46 -7 L44 0 L46 7Z" fill="#F2B21C" />
        <path d="M5 -4 L9 4" stroke="#1E1E1E" strokeWidth="3" />
      </g>
    );
  }
  if (kind === 'wrasse') {
    return (
      <g transform={t}>
        <path d="M0 0 C8 -7 34 -8 46 0 C34 8 8 7 0 0Z" fill="#3FB0C9" />
        <path d="M46 0 L56 -6 L54 0 L56 6Z" fill="#E86FA8" />
        <path d="M6 0 L42 0" stroke="#E86FA8" strokeWidth="2" />
        <circle cx="5" cy="-1.5" r="1.4" fill="#111" />
      </g>
    );
  }
  return (
    <g transform={t}>
      <path d="M0 0 C6 -7 18 -8 26 0 C18 8 6 7 0 0Z" fill="#5DA8E6" />
      <path d="M26 0 L33 -6 L32 0 L33 6Z" fill="#5DA8E6" />
      <circle cx="4" cy="-1" r="1.2" fill="#0B1E33" />
    </g>
  );
}

/** A school of small fish swimming across the scene. */
export function School({ count = 14, top, duration = 46, delay = 0, scale = 1, color = '#BFD6DE', reverse = false }: { count?: number; top: string; duration?: number; delay?: number; scale?: number; color?: string; reverse?: boolean }) {
  const rand = mulberry32(count * 97 + Math.round(scale * 10));
  return (
    <div className={`school${reverse ? ' school--rev' : ''}`} style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s` }} aria-hidden="true">
      <svg viewBox="0 0 220 90" width={220 * scale} height={90 * scale}>
        {Array.from({ length: count }, (_, i) => {
          const fx = rand() * 190, fy = 10 + rand() * 70, s = 0.6 + rand() * 0.5;
          return (
            <g key={i} transform={`translate(${r1(fx)} ${r1(fy)}) scale(${r1(s)})`}>
              <g className="school__fish" style={{ animationDelay: `${-rand() * 2}s` }}>
                <path d="M0 0 C5 -5 14 -5 20 0 C14 5 5 5 0 0Z" fill={color} />
                <path d="M20 0 L26 -4 L25 0 L26 4Z" fill={color} />
                <path d="M3 -1 C8 -3 13 -3 17 -1" stroke="#fff" strokeOpacity=".7" strokeWidth=".8" fill="none" />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------- the reef floor ----------

type Piece = { t: 'stag' | 'brain' | 'table' | 'fan' | 'sponge' | 'anemone' | 'grass'; x: number; s: number };

/**
 * White-sand reef floor, 1600 units wide. `deep` renders the same reef as it looks at
 * 25 m: blue-shifted, darker, with less light.
 */
export function ReefFloor({ seed = 11, height = 380, deep = false, id = 'reef' }: { seed?: number; height?: number; deep?: boolean; id?: string }) {
  const rand = mulberry32(seed);
  const W = 1600, H = 400, base = 236;
  // Layout: clusters left and right, an open sand patch in the middle so the floor reads as "white sand".
  const back: Piece[] = [];
  const front: Piece[] = [];
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  for (let x = 20; x < W; x += 60 + rand() * 70) {
    const centerGap = x > 700 && x < 920;
    if (centerGap && rand() > 0.6) continue;
    back.push({ t: pick(['fan', 'stag', 'table', 'sponge', 'grass'] as const), x, s: 90 + rand() * 90 });
  }
  for (let x = 0; x < W; x += 80 + rand() * 90) {
    const centerGap = x > 680 && x < 940;
    if (centerGap && rand() > 0.7) { front.push({ t: 'grass', x, s: 40 + rand() * 30 }); continue; }
    front.push({ t: pick(['brain', 'stag', 'sponge', 'anemone', 'brain', 'grass', 'stag'] as const), x, s: 85 + rand() * 80 });
  }
  let n = 0, clownUsed = false;
  const draw = (p: Piece, yBase: number) => {
    const i = n++;
    switch (p.t) {
      case 'stag': return staghorn(rand, p.x, yBase, p.s, i);
      case 'brain': return brain(rand, p.x, yBase, p.s, i);
      case 'table': return table(rand, p.x, yBase, p.s, i);
      case 'fan': return seaFan(rand, p.x, yBase, p.s * 1.3, i);
      case 'sponge': return sponge(rand, p.x, yBase, p.s * 0.8, i);
      case 'anemone': { const c = !clownUsed && p.x > 300; if (c) clownUsed = true; return anemone(rand, p.x, yBase, p.s, i, c); }
      default: return seagrass(rand, p.x, yBase, p.s, i);
    }
  };
  const rocks = Array.from({ length: 9 }, () => ({ x: rand() * W, w: 40 + rand() * 90, h: 14 + rand() * 22 }));
  const sandTop = `M0 ${base - 12} C200 ${base - 30} 380 ${base} 600 ${base - 14} S1000 ${base - 34} 1200 ${base - 10} S1480 ${base - 26} 1600 ${base - 16} V${H} H0Z`;

  return (
    <div className={`reef-floor${deep ? ' reef-floor--deep' : ''}`} style={{ ['--reef-h' as string]: `${height}px` }} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" width="100%" height="100%">
        <defs>
          <pattern id={`${id}-sand`} patternUnits="userSpaceOnUse" width="420" height="420">
            <image href="/textures/sand.jpg" width="420" height="420" preserveAspectRatio="none" />
          </pattern>
          <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5FC2CC" stopOpacity=".6" />
            <stop offset=".3" stopColor="#BFEDEE" stopOpacity=".18" />
            <stop offset=".7" stopColor="#ffffff" stopOpacity=".12" />
            <stop offset="1" stopColor="#ffffff" stopOpacity=".05" />
          </linearGradient>
          <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1890A6" stopOpacity=".85" />
            <stop offset=".55" stopColor="#1890A6" stopOpacity=".18" />
            <stop offset="1" stopColor="#1890A6" stopOpacity="0" />
          </linearGradient>
          <pattern id={`${id}-caustic`} patternUnits="userSpaceOnUse" width="300" height="300">
            <image href="/textures/caustics.png" width="300" height="300" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="300 150" dur="22s" repeatCount="indefinite" />
          </pattern>
          <pattern id={`${id}-caustic2`} patternUnits="userSpaceOnUse" width="460" height="460">
            <image href="/textures/caustics-wide.png" width="460" height="460" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="-460 230" dur="31s" repeatCount="indefinite" />
          </pattern>
          <radialGradient id={`${id}-rock`} cx=".4" cy=".3" r=".9"><stop offset="0" stopColor="#A89F8A" /><stop offset="1" stopColor="#5E5A4E" /></radialGradient>
        </defs>

        {/* back row, softened by distance */}
        <g opacity=".72" filter="url(#reef-dist)">{back.map(p => draw(p, base - 6))}</g>
        <rect x="0" y="0" width={W} height={base} fill={`url(#${id}-haze)`} />

        {/* white sand with ripples, and moving caustic light on it */}
        <path d={sandTop} fill={`url(#${id}-sand)`} />
        <path d={sandTop} fill={`url(#${id}-shade)`} />
        {deep ? null : <path d={sandTop} fill={`url(#${id}-caustic)`} opacity=".5" />}
        {deep ? null : <path d={sandTop} fill={`url(#${id}-caustic2)`} opacity=".35" />}

        {rocks.map((k, i) => <ellipse key={i} cx={r1(k.x)} cy={r1(base + 30 + rand() * 70)} rx={r1(k.w / 2)} ry={r1(k.h / 2)} fill={`url(#${id}-rock)`} opacity=".9" />)}

        {/* front row */}
        <g>{front.map(p => draw(p, base + 40 + rand() * 60))}</g>

        {/* reef fish */}
        <g className="fish-swim" style={{ animationDuration: '38s' }}><Fish kind="tang" x={0} y={150} scale={1.1} /></g>
        <g className="fish-swim fish-swim--rev" style={{ animationDuration: '52s', animationDelay: '-20s' }}><Fish kind="butterfly" x={0} y={110} scale={1} flip /></g>
        <g className="fish-swim" style={{ animationDuration: '30s', animationDelay: '-9s' }}><Fish kind="wrasse" x={0} y={200} scale={.9} /></g>
        <g className="fish-swim fish-swim--rev" style={{ animationDuration: '44s', animationDelay: '-30s' }}><Fish kind="chromis" x={0} y={80} scale={1.2} flip /></g>
        <g className="fish-swim" style={{ animationDuration: '41s', animationDelay: '-14s' }}><Fish kind="chromis" x={0} y={130} scale={1} /></g>
      </svg>
    </div>
  );
}

/** Shared SVG filters, rendered once per page. */
export function ReefFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id="reef-dist" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.6" />
          <feColorMatrix type="matrix" values=".75 0 0 0 .02  0 .85 0 0 .12  0 0 .9 0 .16  0 0 0 1 0" />
        </filter>
      </defs>
    </svg>
  );
}
