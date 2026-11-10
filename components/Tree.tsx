import React, { useEffect, useRef } from 'react';

interface TreeProps {
  isVisible: boolean;
}

/* ============ sprite chấm sáng mềm (vẽ 1 lần, dùng lại cả buổi) ============ */
function glowDot(color: string, size = 64): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const r = size / 2;
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, 'rgba(255,255,255,.95)');
  gr.addColorStop(0.28, color);
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return c;
}

const SP = {
  gold: glowDot('rgba(255,205,90,.95)'),
  warm: glowDot('rgba(255,236,190,.9)'),
  red: glowDot('rgba(255,90,110,.95)'),
  cyan: glowDot('rgba(125,232,255,.9)'),
  white: glowDot('rgba(255,255,255,.95)'),
  pink: glowDot('rgba(255,140,190,.9)'),
  blue: glowDot('rgba(150,190,255,.9)'),
};

const TAU = Math.PI * 2;
const R = Math.random;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/* làm tối / sáng màu hex */
function shade(hex: string, mul = 0.55): string {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp(((n >> 16) & 255) * mul, 0, 255) | 0;
  const g = clamp(((n >> 8) & 255) * mul, 0, 255) | 0;
  const b = clamp((n & 255) * mul, 0, 255) | 0;
  return `rgb(${r},${g},${b})`;
}
function rrect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/* ranh giới 5 tầng tán (0 = đỉnh, 1 = đáy) */
const B = [0, 0.18, 0.38, 0.6, 0.82, 1.0];
const ORN_COLORS = ['#ff4d6d', '#ffd36a', '#8ecbff', '#c792ff', '#ffffff', '#ffb1c9'];

type Tier = { yA: number; yB: number; wB: number; droop: number };
type SnowDot = { x: number; y: number; r: number; a: number };
type Light = { ux: number; uy: number; c: HTMLCanvasElement; s: number; ph: number; sp: number };
type Swag = { y0: number; x0: number; x1: number; dip: number; lights: Light[] };
type Orn = { x: number; y: number; r: number; c: string; ph: number };
type Gift = { x: number; y: number; w: number; h: number; c: string; r: string; rot: number };
type Fly = { x: number; y: number; vy: number; sw: number; ph: number; sp: number; sz: number; c: HTMLCanvasElement };
type Burst = { parts: { x: number; y: number; vx: number; vy: number; l: number; c: HTMLCanvasElement; s: number }[] };

const Tree: React.FC<TreeProps> = ({ isVisible }) => {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let W = 0, H = 0, dpr = 1;
    let cx = 0, by = 0, th = 0, bw = 0;
    let tiers: Tier[] = [];
    let tierDots: SnowDot[][] = [];
    let swags: Swag[] = [];
    let orns: Orn[] = [];
    let gifts: Gift[] = [];
    let flies: Fly[] = [];
    let bursts: Burst[] = [];
    let tX = 0, tY = 0, tgX = 0, tgY = 0; // nghiêng 3D theo chuột

    /* ---------- dựng hình học cây (gọi lại khi đổi cỡ màn hình) ---------- */
    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2;
      by = H * 0.9;
      th = H * 0.8;
      bw = Math.min(W * 0.42, th * 0.4);

      tiers = [];
      tierDots = [];
      for (let i = 0; i < 5; i++) {
        tiers.push({
          yA: by - th * (1 - B[i]),
          yB: by - th * (1 - B[i + 1]),
          wB: bw * B[i + 1] * 1.05,
          droop: th * 0.026,
        });
        const dots: SnowDot[] = [];
        for (let k = 0; k < 7; k++) {
          const f = B[i] + (B[i + 1] - B[i]) * R();
          dots.push({
            x: (R() * 2 - 1) * bw * f * 0.86,
            y: by - th * (1 - f),
            r: 0.8 + R() * 1.5,
            a: 0.25 + R() * 0.4,
          });
        }
        tierDots.push(dots);
      }

      /* dây đèn uốn vòng cung qua từng tầng (chủ yếu vàng, điểm xuyết đỏ/cyan) */
      swags = [];
      const cols = [SP.gold, SP.warm, SP.gold, SP.red, SP.gold, SP.cyan, SP.warm];
      for (let i = 0; i < 5; i++) {
        const T = tiers[i];
        for (const f of [0.4, 0.8]) {
          const y0 = T.yA + (T.yB - T.yA) * f;
          const half = T.wB * (1 - f * 0.24);
          if (half < 14) continue;
          const dip = (T.yB - T.yA) * 0.36 + th * 0.012;
          const lights: Light[] = [];
          const n = Math.max(5, Math.round((half * 2) / 24));
          for (let k = 0; k < n; k++) {
            const u = n > 1 ? k / (n - 1) : 0.5;
            lights.push({
              ux: -half + 2 * half * u,
              uy: dip * 2 * u * (1 - u), // đúng cong dây quadratic
              c: cols[(k * 5 + i * 3 + (f > 0.6 ? 1 : 0)) % cols.length],
              s: 13 + R() * 7,
              ph: R() * TAU,
              sp: 0.9 + R() * 1.6,
            });
          }
          swags.push({ y0, x0: -half, x1: half, dip, lights });
        }
      }

      /* quả cầu ánh kim treo trên tán */
      orns = [];
      for (let i = 0; i < 11; i++) {
        const ti = 1 + ((R() * 4) | 0);
        const T = tiers[ti];
        const f = 0.3 + R() * 0.55;
        const halfW = bw * (B[ti] + (B[ti + 1] - B[ti]) * f) * 0.82;
        orns.push({
          x: (R() * 2 - 1) * halfW,
          y: T.yA + (T.yB - T.yA) * f,
          r: (4.2 + R() * 2.8) * (bw / 160),
          c: ORN_COLORS[(R() * ORN_COLORS.length) | 0],
          ph: R() * TAU,
        });
      }

      /* hộp quà dưới gốc */
      gifts = [
        { x: -bw * 0.68, y: th * 0.04, w: bw * 0.4, h: bw * 0.3, c: '#c8102e', r: '#ffd97a', rot: -0.06 },
        { x: bw * 0.6, y: th * 0.038, w: bw * 0.34, h: bw * 0.25, c: '#1f7a44', r: '#fff3d6', rot: 0.05 },
        { x: bw * 0.18, y: th * 0.052, w: bw * 0.26, h: bw * 0.19, c: '#5b2a86', r: '#ffd97a', rot: -0.03 },
        { x: -bw * 0.3, y: th * 0.058, w: bw * 0.2, h: bw * 0.14, c: '#1d5fa8', r: '#ffffff', rot: 0.07 },
      ];

      /* đom đám bay quanh cây */
      flies = [];
      for (let i = 0; i < 22; i++) {
        flies.push({
          x: (R() * 2 - 1) * bw * 1.2,
          y: by - R() * th * 1.05,
          vy: -(4 + R() * 9),
          sw: R() * TAU,
          ph: R() * TAU,
          sp: 0.8 + R() * 1.8,
          sz: 3 + R() * 4,
          c: R() < 0.7 ? SP.gold : SP.white,
        });
      }
      bursts = [];
    }

    /* ---------- path tán lá: hông võng nhẹ, đáy rủ thành từng chùm cành ---------- */
    function traceScallop(T: Tier) {
      const segs = Math.max(4, Math.round(T.wB / 15));
      for (let k = 0; k < segs; k++) {
        const u0 = k / segs, u1 = (k + 1) / segs;
        const xa = cx - T.wB + 2 * T.wB * u0;
        const xb = cx - T.wB + 2 * T.wB * u1;
        const xm = (xa + xb) / 2;
        ctx.quadraticCurveTo(xm, T.yB + T.droop * (k % 2 ? 0.6 : 1), xb, T.yB - T.droop * 0.18);
      }
    }
    function tierPath(T: Tier) {
      ctx.beginPath();
      ctx.moveTo(cx, T.yA);
      ctx.quadraticCurveTo(cx - T.wB * 0.4, T.yA + (T.yB - T.yA) * 0.6, cx - T.wB, T.yB);
      traceScallop(T);
      ctx.quadraticCurveTo(cx + T.wB * 0.4, T.yA + (T.yB - T.yA) * 0.6, cx, T.yA);
      ctx.closePath();
    }

    /* ---------- nổ sáng khi chạm vào cây ---------- */
    function spawnBurst(x: number, y: number) {
      const cols = [SP.gold, SP.white, SP.red, SP.cyan];
      const parts: Burst['parts'] = [];
      for (let i = 0; i < 24; i++) {
        const a = R() * TAU, v = 40 + R() * 140;
        parts.push({
          x, y,
          vx: (Math.cos(a) * v) / 60,
          vy: (Math.sin(a) * v) / 60 - 0.6,
          l: 0.7 + R() * 0.5,
          c: cols[(R() * cols.length) | 0],
          s: 5 + R() * 7,
        });
      }
      bursts.push({ parts });
    }

    /* ---------- vẽ 1 khung hình ---------- */
    function draw(t: number, dt: number) {
      ctx.clearRect(0, 0, W, H);

      /* sáng ấm đổ xuống tuyết + quầng xanh sau cây */
      let g = ctx.createRadialGradient(cx, by, 0, cx, by, bw * 1.7);
      g.addColorStop(0, 'rgba(255,196,110,.22)');
      g.addColorStop(1, 'rgba(255,196,110,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - bw * 1.7, by - bw * 0.9, bw * 3.4, bw * 1.9);
      g = ctx.createRadialGradient(cx, by - th * 0.5, 0, cx, by - th * 0.5, th * 0.62);
      g.addColorStop(0, 'rgba(60,220,140,.10)');
      g.addColorStop(1, 'rgba(60,220,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - th * 0.62, by - th * 1.12, th * 1.24, th * 1.24);

      /* ===== thân cây + toàn bộ tán lá uốn lượn nhẹ theo gió (shear) ===== */
      const k = Math.sin(t * 0.55) * 0.014;
      ctx.save();
      ctx.translate(cx, by);
      ctx.transform(1, 0, k, 1, 0, 0);
      ctx.translate(-cx, -by);

      /* thân */
      const tw = bw * 0.16;
      const tg = ctx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      tg.addColorStop(0, '#4a2f16');
      tg.addColorStop(0.5, '#6f4a24');
      tg.addColorStop(1, '#38220f');
      ctx.fillStyle = tg;
      ctx.fillRect(cx - tw / 2, by - th * 0.055, tw, th * 0.1);

      /* tán lá: vẽ từ tầng DƯỚI lên tầng TRÊN để mép tầng trên đè lên */
      for (let i = 4; i >= 0; i--) {
        const T = tiers[i];
        tierPath(T);
        const gr = ctx.createLinearGradient(0, T.yA, 0, T.yB + T.droop);
        gr.addColorStop(0, '#2f9e5b');
        gr.addColorStop(0.55, '#177741');
        gr.addColorStop(1, '#0b3d22');
        ctx.fillStyle = gr;
        ctx.fill();

        /* bóng hai bên + chấm tuyết trên tán (clip vào hình tán) */
        ctx.save();
        tierPath(T);
        ctx.clip();
        const sh = ctx.createLinearGradient(cx - T.wB, 0, cx + T.wB, 0);
        sh.addColorStop(0, 'rgba(0,22,12,.4)');
        sh.addColorStop(0.5, 'rgba(0,0,0,0)');
        sh.addColorStop(1, 'rgba(0,22,12,.4)');
        ctx.fillStyle = sh;
        ctx.fillRect(cx - T.wB, T.yA - 4, T.wB * 2, T.yB - T.yA + T.droop + 8);
        ctx.fillStyle = '#fff';
        for (const d of tierDots[i]) {
          ctx.globalAlpha = d.a;
          ctx.beginPath();
          ctx.arc(cx + d.x, d.y, d.r, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        /* tuyết phủ trên mép từng chùm cành */
        ctx.beginPath();
        ctx.moveTo(cx - T.wB, T.yB);
        traceScallop(T);
        ctx.strokeStyle = 'rgba(238,247,255,.82)';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      /* dây đèn: dây mảnh + bóng đèn nhấp nháy */
      for (const S of swags) {
        ctx.strokeStyle = 'rgba(15,35,20,.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx + S.x0, S.y0);
        ctx.quadraticCurveTo(cx, S.y0 + S.dip * 1.05, cx + S.x1, S.y0);
        ctx.stroke();
        for (const L of S.lights) {
          const a = 0.5 + 0.5 * Math.sin(t * L.sp + L.ph);
          const px = cx + L.ux + Math.sin(t * 0.9 + L.ph) * 1.2;
          const py = S.y0 + L.uy;
          ctx.globalAlpha = 0.35 + 0.65 * a;
          ctx.drawImage(L.c, px - L.s / 2, py - L.s / 2, L.s, L.s);
          ctx.globalAlpha = 0.5 + 0.5 * a;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, TAU);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      /* quả cầu ánh kim */
      for (const O of orns) {
        const px = cx + O.x + Math.sin(t * 0.8 + O.ph) * 1.5;
        const py = O.y;
        const gs = O.r * 4.4;
        const spr =
          O.c === '#ffd36a' ? SP.gold : O.c === '#ffffff' ? SP.white :
          O.c === '#8ecbff' ? SP.cyan : O.c === '#ff4d6d' ? SP.red :
          O.c === '#ffb1c9' ? SP.pink : SP.blue;
        ctx.globalAlpha = 0.32 + 0.18 * Math.sin(t * 1.3 + O.ph);
        ctx.drawImage(spr, px - gs / 2, py - gs / 2, gs, gs);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,220,150,.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py - O.r - 4);
        ctx.lineTo(px, py - O.r);
        ctx.stroke();
        const og = ctx.createRadialGradient(px - O.r * 0.35, py - O.r * 0.4, O.r * 0.12, px, py, O.r);
        og.addColorStop(0, '#ffffff');
        og.addColorStop(0.35, O.c);
        og.addColorStop(1, shade(O.c, 0.52));
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(px, py, O.r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath();
        ctx.arc(px - O.r * 0.32, py - O.r * 0.38, O.r * 0.24, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#e8b64c';
        ctx.fillRect(px - O.r * 0.22, py - O.r - 2.2, O.r * 0.44, 2.6);
      }

      /* ngôi sao đỉnh: halo + tia xoay + sao 5 cánh */
      const sx = cx, sy = tiers[0].yA - th * 0.035;
      const pulse = 0.72 + 0.28 * Math.sin(t * 2.1);
      ctx.globalAlpha = 0.5 * pulse;
      ctx.drawImage(SP.gold, sx - 46, sy - 46, 92, 92);
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.3);
      ctx.strokeStyle = `rgba(255,220,130,${(0.4 * pulse).toFixed(3)})`;
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const len = 26 + 7 * Math.sin(t * 1.7 + i * 1.3);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 13, Math.sin(a) * 13);
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
        ctx.stroke();
      }
      ctx.restore();
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(Math.sin(t * 0.8) * 0.08);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i / 10) * TAU;
        const rr = i % 2 ? 6.5 : 15.5;
        i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      const sg = ctx.createRadialGradient(0, -2, 1, 0, 0, 16);
      sg.addColorStop(0, '#fffbe8');
      sg.addColorStop(0.5, '#ffe082');
      sg.addColorStop(1, '#f5b93c');
      ctx.fillStyle = sg;
      ctx.shadowColor = 'rgba(255,205,90,.95)';
      ctx.shadowBlur = 20 * pulse;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();

      ctx.restore(); /* hết uốn lượn */

      /* đống tuyết gốc cây */
      const mg = ctx.createRadialGradient(cx, by + th * 0.05, 2, cx, by + th * 0.05, bw * 1.5);
      mg.addColorStop(0, 'rgba(255,255,255,.95)');
      mg.addColorStop(0.6, 'rgba(235,243,255,.5)');
      mg.addColorStop(1, 'rgba(235,243,255,0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.ellipse(cx, by + th * 0.05, bw * 1.5, th * 0.055, 0, 0, TAU);
      ctx.fill();

      /* hộp quà */
      for (const G of gifts) {
        const gx = cx + G.x, gy = by + G.y;
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(G.rot);
        ctx.fillStyle = 'rgba(40,60,110,.35)';
        ctx.beginPath();
        ctx.ellipse(0, 2, G.w * 0.55, G.h * 0.16, 0, 0, TAU);
        ctx.fill();
        const bgd = ctx.createLinearGradient(0, -G.h, 0, 0);
        bgd.addColorStop(0, shade(G.c, 1.3));
        bgd.addColorStop(1, G.c);
        ctx.fillStyle = bgd;
        rrect(ctx, -G.w / 2, -G.h, G.w, G.h, 3);
        ctx.fill();
        ctx.fillStyle = G.r;
        ctx.fillRect(-G.w * 0.09, -G.h, G.w * 0.18, G.h);
        ctx.fillRect(-G.w / 2, -G.h * 0.55, G.w, G.h * 0.13);
        ctx.strokeStyle = G.r;
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-G.w * 0.06, -G.h);
        ctx.quadraticCurveTo(-G.w * 0.3, -G.h - 8, -G.w * 0.04, -G.h - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(G.w * 0.06, -G.h);
        ctx.quadraticCurveTo(G.w * 0.3, -G.h - 8, G.w * 0.04, -G.h - 10);
        ctx.stroke();
        ctx.fillStyle = G.r;
        ctx.beginPath();
        ctx.arc(0, -G.h - 8, 2.2, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      /* đom đám + vụ nổ sáng khi chạm */
      ctx.globalCompositeOperation = 'lighter';
      for (const F of flies) {
        F.y += F.vy * dt;
        F.x += Math.sin(t * 0.7 + F.sw) * 10 * dt;
        if (F.y < by - th * 1.12) {
          F.y = by + 6;
          F.x = (R() * 2 - 1) * bw * 1.2;
        }
        ctx.globalAlpha = (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * F.sp + F.ph))) * 0.85;
        ctx.drawImage(F.c, F.x - F.sz, F.y - F.sz, F.sz * 2, F.sz * 2);
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const bu = bursts[i];
        let alive = false;
        for (const p of bu.parts) {
          if (p.l <= 0) continue;
          alive = true;
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.vy += 0.05 * dt * 60;
          p.l -= dt * 1.1;
          ctx.globalAlpha = Math.max(p.l, 0);
          ctx.drawImage(p.c, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
        }
        if (!alive) bursts.splice(i, 1);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    build();

    const onResize = () => build();
    window.addEventListener('resize', onResize);

    /* nghiêng 3D theo con trỏ */
    const onMove = (e: PointerEvent) => {
      tgX = (e.clientX / window.innerWidth - 0.5) * 2;
      tgY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove);

    /* chạm vào cây -> nổ ánh sáng */
    const onDown = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      spawnBurst(e.clientX - r.left, e.clientY - r.top);
    };
    wrap.addEventListener('pointerdown', onDown);

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;
      tX += (tgX - tX) * 0.06;
      tY += (tgY - tY) * 0.06;
      canvas.style.transform = `perspective(1100px) rotateY(${(tX * 5).toFixed(2)}deg) rotateX(${(-tY * 3.5).toFixed(2)}deg)`;
      draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerdown', onDown);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-auto cursor-pointer animate-[fadeIn_1.2s_ease-out]"
      style={{ width: 'min(94vw,560px)', height: 'min(62vh,640px)' }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" style={{ willChange: 'transform' }} />
    </div>
  );
};

export default Tree;
