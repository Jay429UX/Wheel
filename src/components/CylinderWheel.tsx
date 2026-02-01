"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface Reward {
  id: number;
  name: string;
  image: string;
  chance: number;
}

interface CylinderWheelProps {
  rewards: Reward[];
  spinning: boolean;
  onSpinComplete: (reward: Reward) => void;
}

function weightedRandom(rewards: Reward[]): Reward {
  const total = rewards.reduce((sum, r) => sum + r.chance, 0);
  let rand = Math.random() * total;
  for (const reward of rewards) {
    rand -= reward.chance;
    if (rand <= 0) return reward;
  }
  return rewards[rewards.length - 1];
}

/* ─── Segment colors ─── */
const COLORS = ["#14532d", "#0a0a0a"];

export function CylinderWheel({ rewards, spinning, onSpinComplete }: CylinderWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);
  const hasSpunRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTickRef = useRef(0);
  const segmentAngle = 360 / rewards.length;

  /* ─── Tick sound ─── */
  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1800 + Math.random() * 400;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }, []);

  /* ─── Spin animation ─── */
  useEffect(() => {
    if (!spinning || hasSpunRef.current) return;
    hasSpunRef.current = true;
    setIsAnimating(true);

    const winner = weightedRandom(rewards);
    const winnerIndex = rewards.indexOf(winner);
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = fullSpins * 360 + winnerIndex * segmentAngle;
    const startRotation = rotation;
    const endRotation = startRotation + totalRotation;
    const duration = 5500;
    const startTime = performance.now();

    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = startRotation + (endRotation - startRotation) * easeOutQuart(progress);
      setRotation(current);

      const seg = Math.floor(current / segmentAngle);
      if (seg !== lastTickRef.current) {
        lastTickRef.current = seg;
        playTick();
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setRotation(endRotation);
        setIsAnimating(false);
        hasSpunRef.current = false;
        try {
          const a = new Audio("/gamewin.mp3");
          a.volume = 0.5;
          a.play().catch(() => {});
        } catch {}
        onSpinComplete(winner);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [spinning]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Geometry ─── */
  const FACE_H = 60;
  const FACE_ANGLE = (Math.PI * 2) / rewards.length;
  const R = Math.round((FACE_H / 2) / Math.tan(FACE_ANGLE / 2));

  return (
    <div className="relative w-full h-full">
      {/* 3D Cylinder — fills the container */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "ellipse(49% 110% at 50% 50%)",
        }}
      >
        {/* Perspective wrapper */}
        <div
          style={{
            width: "100%",
            height: "100%",
            perspective: 600,
            perspectiveOrigin: "50% 50%",
          }}
        >
          {/* Rotating drum */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "50%",
              height: 0,
              transformStyle: "preserve-3d",
              transformOrigin: "50% 0",
              transform: `rotateX(${-rotation}deg)`,
              transition: isAnimating ? "none" : "transform 0.3s ease-out",
            }}
          >
            {rewards.map((reward, i) => {
              const angle = segmentAngle * i;
              const color = COLORS[i % COLORS.length];
              return (
                <div
                  key={reward.id}
                  className="flex items-center justify-center"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: FACE_H,
                    left: 0,
                    top: 0,
                    backfaceVisibility: "hidden",
                    transform: `translateY(${-FACE_H / 2}px) rotateX(${-angle}deg) translateZ(${R - 1}px)`,
                    backgroundColor: color,
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    borderBottom: "1px solid rgba(0,0,0,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2 px-4">
                    <img
                      src={reward.name === "Mystery Box" ? "/Mystery-box.png" : "/Cash-Prize.png"}
                      alt=""
                      style={{ width: 36, height: 36, objectFit: "contain" }}
                    />
                    <span
                      className="text-2xl font-extrabold tracking-wide"
                      style={{
                        color: "#f0f8ff",
                        textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {reward.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top gradient — black to transparent */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "35%",
          zIndex: 2,
          pointerEvents: "none",
          background: "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
        }}
      />

      {/* Bottom gradient — black to transparent */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "35%",
          zIndex: 2,
          pointerEvents: "none",
          background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
