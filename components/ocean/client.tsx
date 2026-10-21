'use client';

// Living water: rising bubbles, drifting particles, a depth gauge that follows the scroll,
// and the page's "depth" (0..1) exposed as a CSS variable so light fades as you go down.
// Everything stops for prefers-reduced-motion and when the tab is hidden.

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Depth from 0 (surface) to 1 (bottom of the dive), based on scroll through `#dive`. */
function useDepth(maxMeters: number) {
  const [depth, setDepth] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const dive = document.getElementById('dive');
      if (!dive) return;
      const rect = dive.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.4;
      const progressed = window.innerHeight * 0.6 - rect.top;
      const d = Math.min(1, Math.max(0, progressed / Math.max(1, total)));
      document.documentElement.style.setProperty('--depth', d.toFixed(3));
      setDepth(d);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [maxMeters]);
  return depth;
}

export function DepthGauge({ maxMeters = 30 }: { maxMeters?: number }) {
  const depth = useDepth(maxMeters);
  const meters = Math.round(depth * maxMeters);
  const ticks = [0, 5, 10, 15, 20, 25, 30].filter(t => t <= maxMeters);
  return (
    <div className={`gauge${depth > 0.01 ? ' gauge--on' : ''}`} aria-hidden="true">
      <div className="gauge__read"><strong>{meters}</strong><span>m</span></div>
      <div className="gauge__track">
        {ticks.map(t => <i key={t} style={{ top: `${(t / maxMeters) * 100}%` }}><b>{t}</b></i>)}
        <span className="gauge__dot" style={{ top: `${depth * 100}%` }} />
      </div>
    </div>
  );
}

interface Bubble { x: number; y: number; r: number; vy: number; phase: number; wob: number; life: number }
interface Speck { x: number; y: number; r: number; vx: number; vy: number; a: number }

/**
 * Full-viewport canvas of bubbles and suspended particles. Fixed behind the content
 * of `#dive`; denser bubbles near the surface, more particles deeper down.
 */
export function OceanParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true, last = performance.now(), nextBurst = 2500;
    const bubbles: Bubble[] = [];
    const specks: Speck[] = [];

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      specks.length = 0;
      const n = Math.round((w * h) / 9000);
      for (let i = 0; i < n; i++) {
        specks.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 1, a: Math.random() * 0.5 + 0.15 });
      }
    };
    const spawn = (x: number, y: number, r: number) => {
      bubbles.push({ x, y, r, vy: 22 + r * 9 + Math.random() * 12, phase: Math.random() * Math.PI * 2, wob: 6 + Math.random() * 10, life: 0 });
    };
    // A diver exhaling below you: a tight column of mixed-size bubbles.
    const burst = () => {
      const x = w * (0.12 + Math.random() * 0.76);
      const n = 14 + Math.floor(Math.random() * 14);
      for (let i = 0; i < n; i++) spawn(x + (Math.random() - 0.5) * 30, h + 10 + i * (6 + Math.random() * 10), 1.5 + Math.random() ** 2 * 9);
    };
    const drawBubble = (b: Bubble, x: number) => {
      const g = ctx.createRadialGradient(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, x, b.y, b.r);
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.45, 'rgba(255,255,255,0.06)');
      g.addColorStop(0.85, 'rgba(210,250,255,0.18)');
      g.addColorStop(1, 'rgba(255,255,255,0.75)');
      ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      if (b.r > 3) { // specular highlight
        ctx.beginPath(); ctx.ellipse(x - b.r * 0.38, b.y - b.r * 0.42, b.r * 0.28, b.r * 0.16, -0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const depth = parseFloat(document.documentElement.style.getPropertyValue('--depth')) || 0;
      ctx.clearRect(0, 0, w, h);

      // particles: more visible as it gets darker
      ctx.fillStyle = '#E6FBFF';
      for (const s of specks) {
        s.x += s.vx * dt; s.y += s.vy * dt;
        if (s.y > h) { s.y = -2; s.x = Math.random() * w; }
        if (s.x < 0) s.x = w; if (s.x > w) s.x = 0;
        ctx.globalAlpha = s.a * (0.35 + depth * 0.65);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ambient bubbles, plus periodic bursts
      if (Math.random() < dt * (3.2 - depth * 1.6)) spawn(Math.random() * w, h + 10, 1 + Math.random() ** 3 * 6);
      nextBurst -= dt * 1000;
      if (nextBurst <= 0) { burst(); nextBurst = 5000 + Math.random() * 5000; }

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.life += dt; b.y -= b.vy * dt; b.r *= 1 + dt * 0.02; // expand slightly as pressure drops
        const x = b.x + Math.sin(b.life * 2.4 + b.phase) * b.wob * Math.min(1, b.life);
        if (b.y < -20) { bubbles.splice(i, 1); continue; }
        drawBubble(b, x);
      }
      raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      running = document.visibilityState === 'visible';
      if (running) { last = performance.now(); raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf);
    };
    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return <canvas ref={ref} className="ocean-particles" aria-hidden="true" />;
}
