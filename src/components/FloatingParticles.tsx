"use client";

import { useRef, useEffect, useCallback } from "react";

type ParticleMode = "green" | "gold" | "purple";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
  color: string;
  symbol: string | null;
}

const GREEN_COLORS = [
  "rgba(34, 197, 94, 0.5)",   // green-500
  "rgba(74, 222, 128, 0.4)",  // green-400
  "rgba(22, 163, 74, 0.5)",   // green-600
  "rgba(21, 128, 61, 0.4)",   // green-700
  "rgba(134, 239, 172, 0.3)", // green-300
];

const GOLD_COLORS = [
  "rgba(188, 157, 68, 0.6)",  // #BC9D44
  "rgba(255, 243, 182, 0.5)", // #FFF3B6
  "rgba(212, 196, 118, 0.5)", // #D4C476
  "rgba(242, 224, 169, 0.4)", // #F2E0A9
  "rgba(164, 119, 19, 0.5)",  // #A47713
];

const PURPLE_COLORS = [
  "rgba(124, 58, 237, 0.6)",  // #7C3AED
  "rgba(192, 132, 252, 0.5)", // #C084FC
  "rgba(168, 85, 247, 0.5)",  // #A855F7
  "rgba(233, 213, 255, 0.4)", // #E9D5FF
  "rgba(139, 92, 246, 0.5)",  // #8B5CF6
];

const PARTICLE_COUNT = 50;

function createParticle(width: number, height: number, mode: ParticleMode): Particle {
  const colors = mode === "purple" ? PURPLE_COLORS : mode === "gold" ? GOLD_COLORS : GREEN_COLORS;
  const hasSymbol = mode === "gold" || mode === "purple" ? true : false;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -0.2 - Math.random() * 0.3,
    size: mode !== "green" ? 2 + Math.random() * 3 : 1 + Math.random() * 2.5,
    opacity: Math.random() * 0.6 + 0.1,
    opacityDir: (Math.random() - 0.5) * 0.01,
    color: colors[Math.floor(Math.random() * colors.length)],
    symbol: hasSymbol ? (mode === "purple" ? "?" : "$") : null,
  };
}

export function FloatingParticles({ mode = "green" }: { mode?: ParticleMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const modeRef = useRef(mode);

  // Reset particles when mode changes
  if (modeRef.current !== mode) {
    modeRef.current = mode;
    particlesRef.current = [];
  }

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const currentMode = modeRef.current;

    // Init particles if needed
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push(createParticle(w, h, currentMode));
      }
    }

    particlesRef.current.forEach((p) => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Fade in/out
      p.opacity += p.opacityDir;
      if (p.opacity > 0.7 || p.opacity < 0.05) {
        p.opacityDir *= -1;
      }

      // Wrap around
      if (p.y < -5) {
        p.y = h + 5;
        p.x = Math.random() * w;
      }
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;

      ctx.globalAlpha = p.opacity;

      if (p.symbol) {
        ctx.font = `bold ${p.size * 4}px sans-serif`;
        ctx.fillStyle = p.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.symbol, p.x, p.y);
      } else {
        // Draw circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
