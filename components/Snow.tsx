import React, { useEffect, useRef } from 'react';

type Flake = { x: number; y: number; r: number; v: number; sw: number; ss: number; a: number; d: number };
type Star = { x: number; y: number; r: number; ph: number; sp: number };

const TAU = Math.PI * 2;
const R = Math.random;

/* ===== Tuyết rơi + sao lấp lánh + sao băng + trăng ===== */
const Snow: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1, raf = 0, last = 0;
    let flakes: Flake[] = [];
    let stars: Star[] = [];
    let shoot: { x: number; y: number; vx: number; vy: number; l: number } | null = null;
    let shootT = 5;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      flakes = [];
      const nf = Math.round(Math.min(220, (W * H) / 6500));
      for (let i = 0; i < nf; i++) {
        flakes.push({
          x: R() * W,
          y: R() * H,
          r: 0.7 + R() * R() * 2.6,
          v: 18 + R() * 36,
          sw: R() * TAU,
          ss: 0.4 + R() * 1.1,
          a: 0.25 + R() * 0.6,
          d: 0.4 + R() * 0.6,
        });
      }
      stars = [];
      const ns = Math.round(Math.min(160, (W * H) / 11000));
      for (let i = 0; i < ns; i++) {
        stars.push({ x: R() * W, y: R() * H * 0.62, r: 0.5 + R() * 1.3, ph: R() * TAU, sp: 0.5 + R() * 2 });
      }
    };

    const drawMoon = () => {
      const mx = W * 0.84, my = H * 0.13, mr = Math.min(W, H) * 0.045;
      const halo = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 4);
      halo.addColorStop(0, 'rgba(255,244,214,.4)');
      halo.addColorStop(0.4, 'rgba(255,240,205,.1)');
      halo.addColorStop(1, 'rgba(255,240,205,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
      ctx.fillStyle = '#fdf3d3';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(210,190,150,.35)';
      ctx.beginPath();
      ctx.arc(mx - mr * 0.3, my - mr * 0.2, mr * 0.22, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + mr * 0.25, my + mr * 0.3, mr * 0.14, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + mr * 0.1, my - mr * 0.42, mr * 0.1, 0, TAU);
      ctx.fill();
    };

    const loop = (now: number) => {
      if (!last) last = now;
      const t = now / 1000;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, W, H);

      /* sao lấp lánh */
      ctx.fillStyle = '#fff';
      for (const s of stars) {
        ctx.globalAlpha = 0.22 + 0.68 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawMoon();

      /* sao băng */
      if (shoot) {
        shoot.l -= dt;
        shoot.x += shoot.vx * dt;
        shoot.y += shoot.vy * dt;
        if (shoot.l <= 0) shoot = null;
        else {
          const tx = shoot.x - shoot.vx * 0.16;
          const ty = shoot.y - shoot.vy * 0.16;
          const gr = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
          gr.addColorStop(0, `rgba(255,255,255,${Math.min(1, shoot.l * 2.4).toFixed(2)})`);
          gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.strokeStyle = gr;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(shoot.x, shoot.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }
      } else {
        shootT -= dt;
        if (shootT <= 0) {
          shootT = 5 + R() * 7;
          shoot = {
            x: W * (0.3 + R() * 0.6),
            y: H * (0.04 + R() * 0.18),
            vx: -(240 + R() * 180),
            vy: 90 + R() * 80,
            l: 0.9,
          };
        }
      }

      /* tuyết rơi nhẹ nhàng có lắc lư */
      ctx.fillStyle = '#fff';
      for (const f of flakes) {
        f.y += f.v * f.d * dt;
        f.x += Math.sin(t * f.ss + f.sw) * 14 * dt;
        if (f.y > H + 4) {
          f.y = -4;
          f.x = R() * W;
        }
        if (f.x > W + 4) f.x = -4;
        else if (f.x < -4) f.x = W + 4;
        ctx.globalAlpha = f.a;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };

    build();
    raf = requestAnimationFrame(loop);

    const handleResize = () => build();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

export default Snow;
