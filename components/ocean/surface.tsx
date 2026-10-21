// The hero: an "over-under" view, half above the waterline (sky, island, glittering sea)
// and half below (light rays, caustics, a sea turtle, white sand and coral).

import { School } from './reef';

function wavePath(amp: number, len: number, width: number, phase = 0) {
  // A smooth repeating swell built from cubic segments; drawn 2x wide so it can loop.
  let d = `M0 ${amp}`;
  for (let x = 0; x < width; x += len) {
    const h1 = Math.round(amp * 10 * (0.75 + 0.25 * Math.sin((2 * Math.PI * x * 2) / 1440 + phase))) / 10; // periodic over 1440 so the loop is seamless
    d += ` C${x + len * 0.25} ${amp - h1} ${x + len * 0.25} ${amp - h1} ${x + len * 0.5} ${amp}`;
    d += ` S${x + len * 0.75} ${amp + h1 * 0.6} ${x + len} ${amp}`;
  }
  return d;
}

// Sun glitter on the far water: deterministic scatter, denser and longer near the sun's path.
const GLITTER: [number, number, number, number][] = (() => {
  let a = 1234567;
  const rnd = () => ((a = (a * 1103515245 + 12345) % 2147483648) / 2147483648);
  return Array.from({ length: 90 }, () => {
    const y = Math.round(rnd() ** 1.4 * 100 * 10) / 10;
    const spread = 90 + y * 3.2;
    const x = Math.round((560 + (rnd() - 0.5) * 2 * spread) * 10) / 10;
    const rx = Math.round((1.5 + rnd() * 3 + (y / 100) * 6) * 10) / 10;
    return [x, y, rx, -Math.round(rnd() * 30) / 10];
  });
})();

export function Turtle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 160" aria-hidden="true">
      <defs>
        <radialGradient id="tShell" cx=".45" cy=".4" r=".7"><stop offset="0" stopColor="#8A7A45" /><stop offset=".7" stopColor="#5C5130" /><stop offset="1" stopColor="#3B3420" /></radialGradient>
        <linearGradient id="tSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9C9467" /><stop offset="1" stopColor="#5F5A3C" /></linearGradient>
      </defs>
      <g className="turtle__flip turtle__flip--front">
        <path d="M128 58 C150 30 190 18 214 22 C196 38 170 54 140 68Z" fill="url(#tSkin)" />
      </g>
      <g className="turtle__flip turtle__flip--front2">
        <path d="M128 102 C150 130 190 142 214 138 C196 122 170 106 140 92Z" fill="url(#tSkin)" />
      </g>
      <g className="turtle__flip turtle__flip--back">
        <path d="M58 64 C44 50 26 46 14 50 C26 60 40 68 56 72Z" fill="url(#tSkin)" />
        <path d="M58 96 C44 110 26 114 14 110 C26 100 40 92 56 88Z" fill="url(#tSkin)" />
      </g>
      <path d="M168 80 C168 68 178 62 190 64 C202 66 206 74 206 80 C206 86 202 94 190 96 C178 98 168 92 168 80Z" fill="url(#tSkin)" />
      <circle cx="196" cy="72" r="2.4" fill="#1A170E" /><circle cx="196" cy="88" r="2.4" fill="#1A170E" />
      <ellipse cx="108" cy="80" rx="66" ry="46" fill="url(#tShell)" />
      <g fill="none" stroke="#C9B77A" strokeOpacity=".55" strokeWidth="2">
        <path d="M88 80 L104 66 L124 66 L136 80 L124 94 L104 94Z" />
        <path d="M104 66 L98 44 M124 66 L132 44 M136 80 L166 80 M124 94 L132 116 M104 94 L98 116 M88 80 L48 80" />
        <path d="M98 44 C80 50 66 62 60 80 C66 98 80 110 98 116" />
      </g>
      <ellipse cx="96" cy="64" rx="26" ry="12" fill="#fff" opacity=".08" />
    </svg>
  );
}

export function SurfaceScene() {
  const W = 2880;
  return (
    <div className="sea" aria-hidden="true">
      {/* ABOVE THE WATER */}
      <div className="sea__sky">
        <div className="sea__sun" />
        <div className="sea__cloud" style={{ left: '8%', top: '18%', width: 260 }} />
        <div className="sea__cloud" style={{ left: '46%', top: '9%', width: 180, animationDelay: '-30s' }} />
        <div className="sea__cloud" style={{ left: '72%', top: '24%', width: 320, animationDelay: '-55s' }} />
        <svg className="sea__island" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M-10 120 L120 86 C180 70 220 52 290 40 C350 30 400 54 450 66 C520 82 600 100 700 112 C740 116 780 118 820 120Z" fill="#6E9C9A" />
          <path d="M900 120 C980 104 1040 88 1110 84 C1160 82 1200 92 1260 100 L1460 120Z" fill="#86AFAA" />
          <path d="M1010 92 l3 -12 l2 12 M1180 94 l2 -8 l2 8" stroke="#86AFAA" strokeWidth="2" />
        </svg>
        <div className="sea__far" />
        <svg className="sea__glitter" viewBox="0 0 800 100" preserveAspectRatio="none">
          {GLITTER.map(([x, y, rx, d], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={Math.max(0.6, rx / 6)} fill="#fff" style={{ animationDelay: `${d}s` }} />)}
        </svg>
      </div>

      {/* THE WATERLINE */}
      <div className="sea__line">
        <svg className="sea__wave sea__wave--back" viewBox={`0 0 ${W} 60`} preserveAspectRatio="none">
          <defs><linearGradient id="waveBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2B9FB3" /><stop offset=".55" stopColor="#2FAABD" /><stop offset="1" stopColor="#3BBCCA" stopOpacity="0" /></linearGradient></defs>
          <path d={`${wavePath(14, 240, W, 1)} V60 H0Z`} fill="url(#waveBack)" />
        </svg>
        <svg className="sea__wave sea__wave--mid" viewBox={`0 0 ${W} 60`} preserveAspectRatio="none">
          <defs><linearGradient id="waveMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#33B3C1" /><stop offset=".6" stopColor="#38B8C6" /><stop offset="1" stopColor="#3BBCCA" stopOpacity="0" /></linearGradient></defs>
          <path d={`${wavePath(16, 360, W, 2)} V60 H0Z`} fill="url(#waveMid)" />
        </svg>
        <svg className="sea__wave sea__wave--front" viewBox={`0 0 ${W} 60`} preserveAspectRatio="none">
          <defs><linearGradient id="waveFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7BE0E0" /><stop offset=".4" stopColor="#38B9C8" /><stop offset="1" stopColor="#3BBCCA" stopOpacity="0" /></linearGradient></defs>
          <path d={`${wavePath(20, 480, W, 0)} V60 H0Z`} fill="url(#waveFront)" />
          <path d={wavePath(20, 480, W, 0)} fill="none" stroke="#F4FFFF" strokeWidth="2.5" strokeOpacity=".9" />
        </svg>
      </div>

      {/* BELOW THE WATER */}
      <div className="sea__under">
        <div className="sea__mirror" />
        <div className="sea__caustics" />
        <div className="sea__rays">
          {[8, 21, 36, 52, 66, 83].map((l, i) => <span key={l} style={{ left: `${l}%`, animationDelay: `${-i * 1.7}s`, width: `${60 + (i % 3) * 40}px` }} />)}
        </div>
        <School top="38%" duration={60} delay={-10} scale={1.1} />
        <School top="58%" duration={75} delay={-40} scale={.8} reverse color="#9EC9D3" count={20} />
        <div className="turtle-swim"><Turtle className="turtle" /></div>
        {[[14, 7, 11, 0], [27, 4, 9, -4], [58, 9, 13, -7], [74, 5, 10, -2], [88, 6, 12, -9]].map(([l, sz, d, dl]) => (
          <span key={l} className="sea__bubble" style={{ left: `${l}%`, width: sz, height: sz, animationDuration: `${d}s`, animationDelay: `${dl}s` }} />
        ))}
      </div>
    </div>
  );
}
