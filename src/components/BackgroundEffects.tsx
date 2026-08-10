import { useEffect, useRef } from 'react';

/**
 * Atmospheric background: floating particles, subtle geometric lines,
 * and cherry-red light streaks on a canvas.
 */
export default function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let lines: GeoLine[] = [];
    let streaks: LightStreak[] = [];

    interface Particle {
      x: number; y: number;
      vx: number; vy: number;
      size: number; opacity: number;
      color: string;
    }

    interface GeoLine {
      x1: number; y1: number;
      x2: number; y2: number;
      opacity: number;
      speed: number;
    }

    interface LightStreak {
      x: number; y: number;
      length: number; angle: number;
      speed: number; opacity: number;
      life: number; maxLife: number;
    }

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      init();
    }

    function init() {
      const w = canvas!.width;
      const h = canvas!.height;

      // Floating particles
      particles = Array.from({ length: 40 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        color: Math.random() > 0.7 ? '#c41e3a' : '#f0e6d8',
      }));

      // Geometric lines
      lines = Array.from({ length: 6 }, () => ({
        x1: Math.random() * w,
        y1: Math.random() * h,
        x2: Math.random() * w,
        y2: Math.random() * h,
        opacity: Math.random() * 0.04 + 0.01,
        speed: (Math.random() - 0.5) * 0.1,
      }));

      // Light streaks
      streaks = [];
    }

    function spawnStreak() {
      if (streaks.length > 3) return;
      if (Math.random() > 0.003) return;
      const w = canvas!.width;
      const h = canvas!.height;
      streaks.push({
        x: Math.random() * w,
        y: Math.random() * h * 0.5,
        length: Math.random() * 100 + 50,
        angle: Math.random() * Math.PI * 0.3 + Math.PI * 0.1,
        speed: Math.random() * 1 + 0.5,
        opacity: 0,
        life: 0,
        maxLife: Math.random() * 120 + 60,
      });
    }

    function animate() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.opacity;
        ctx!.fill();
      }

      // Geometric lines
      for (const l of lines) {
        l.x1 += l.speed;
        l.x2 -= l.speed * 0.5;
        ctx!.beginPath();
        ctx!.moveTo(l.x1, l.y1);
        ctx!.lineTo(l.x2, l.y2);
        ctx!.strokeStyle = '#c41e3a';
        ctx!.globalAlpha = l.opacity;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }

      // Light streaks
      spawnStreak();
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.life++;
        const progress = s.life / s.maxLife;
        s.opacity = progress < 0.3
          ? progress / 0.3 * 0.15
          : (1 - progress) / 0.7 * 0.15;

        const endX = s.x + Math.cos(s.angle) * s.length;
        const endY = s.y + Math.sin(s.angle) * s.length;

        const grad = ctx!.createLinearGradient(s.x, s.y, endX, endY);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, '#c41e3a');
        grad.addColorStop(1, 'transparent');

        ctx!.beginPath();
        ctx!.moveTo(s.x, s.y);
        ctx!.lineTo(endX, endY);
        ctx!.strokeStyle = grad;
        ctx!.globalAlpha = s.opacity;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        if (s.life >= s.maxLife) streaks.splice(i, 1);
      }

      ctx!.globalAlpha = 1;
      animId = requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <div className="bg-atmosphere" />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div className="halftone-overlay" />
      <div className="grain-overlay" />
    </>
  );
}
