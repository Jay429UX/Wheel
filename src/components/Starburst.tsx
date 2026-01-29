"use client";

import { useRef, useEffect, useCallback } from "react";

const RAY_COUNT = 24;
const ROTATION_SPEED = 0.003; // radians per frame

export function Starburst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const angleRef = useRef(0);

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

    const cx = w / 2;
    const cy = h; // center at bottom (since wheel is top-half view)
    const maxRadius = Math.max(w, h) * 1.2;

    angleRef.current += ROTATION_SPEED;

    const sliceAngle = (2 * Math.PI) / RAY_COUNT;

    for (let i = 0; i < RAY_COUNT; i++) {
      const startAngle = angleRef.current + i * sliceAngle;
      const endAngle = startAngle + sliceAngle * 0.45;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, startAngle, endAngle);
      ctx.closePath();

      // Alternate between two subtle colors
      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(22, 163, 74, 0.06)"; // green
      } else {
        ctx.fillStyle = "rgba(34, 197, 94, 0.04)"; // lighter green
      }
      ctx.fill();
    }

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
