"use client";

import { useRef, useEffect, useCallback } from "react";

export interface Reward {
  id: number;
  name: string;
  image: string;
  chance: number;
}

interface SpinWheelProps {
  rewards: Reward[];
  spinning: boolean;
  onSpinComplete: (reward: Reward) => void;
}

const SEGMENT_COLORS = ["#16a34a", "#0a0a0a"]; // green-600, black
const POINTER_COLOR = "#eab308"; // yellow-500
const SPIN_DURATION = 5500;
const DICEY_LOGO_SRC = "/Dicey.svg";

// --- Sound helper ---

const WINNER_SOUND_SRC = "/gamewin.mp3";

let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTickSound(pitch: number = 1) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 800 * pitch;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Audio not supported
  }
}

// --- Weighted selection ---

function selectWeightedReward(rewards: Reward[]): number {
  const totalWeight = rewards.reduce((sum, r) => sum + r.chance, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < rewards.length; i++) {
    random -= rewards[i].chance;
    if (random <= 0) return i;
  }
  return rewards.length - 1;
}

function getTargetAngle(
  winningIndex: number,
  rewards: Reward[],
  currentAngle: number
): number {
  const segmentAngle = (2 * Math.PI) / rewards.length;
  const angleOffset = winningIndex * segmentAngle;
  // Land within the middle 60% of the segment (avoid edges)
  const jitter = (Math.random() - 0.5) * segmentAngle * 0.4;
  const segmentMidpoint = angleOffset + segmentAngle / 2 + jitter;

  const extraSpins = Math.round(4 + Math.random() * 3) * 2 * Math.PI;
  let targetAngle = -Math.PI / 2 - segmentMidpoint + extraSpins;

  while (targetAngle <= currentAngle) {
    targetAngle += 2 * Math.PI;
  }

  return targetAngle;
}

function spinEase(t: number): number {
  // Fast ramp up (first 30%), then long slow deceleration with anticipation
  if (t < 0.3) {
    // Quick acceleration
    const p = t / 0.3;
    return 0.6 * p * p;
  } else {
    // Long, drawn-out deceleration — creates suspense
    const p = (t - 0.3) / 0.7;
    return 0.6 + 0.4 * (1 - Math.pow(1 - p, 5));
  }
}


export function SpinWheel({
  rewards,
  spinning,
  onSpinComplete,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentAngleRef = useRef(0);
  const rafRef = useRef(0);
  const isSpinningRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const pointerDeflectionRef = useRef(0);
  const lastSegmentIndexRef = useRef(-1);
  const diceyLogoRef = useRef<HTMLImageElement | null>(null);

  const drawWheel = useCallback(
    (rotationAngle: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.scale(dpr, dpr);

      const cx = displayWidth / 2;
      const cy = displayHeight / 2;
      const radius = Math.min(cx, cy) - 30;

      ctx.clearRect(0, 0, displayWidth, displayHeight);


      // Draw segments (equal size)
      let currentAngle = rotationAngle;
      const sliceAngle = (2 * Math.PI) / rewards.length;

      rewards.forEach((reward, i) => {
        // Filled segment with radial gradient
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();

        const segGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        if (i % 2 === 0) {
          // Green gradient
          segGrad.addColorStop(0, "#158E42");
          segGrad.addColorStop(1, "#062813");
        } else {
          // Black gradient: dark gray center to pure black edge
          segGrad.addColorStop(0, "#1c1c1c");
          segGrad.addColorStop(0.5, "#0f0f0f");
          segGrad.addColorStop(1, "#050505");
        }
        ctx.fillStyle = segGrad;
        ctx.fill();
        ctx.strokeStyle = "#52525b";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner glow on segment edges
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.strokeStyle = i % 2 === 0 ? "rgba(74, 222, 128, 0.4)" : "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 6;
        ctx.shadowColor = i % 2 === 0 ? "#4ade80" : "rgba(255, 255, 255, 0.15)";
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();


        // Text
        ctx.save();
        ctx.translate(cx, cy);
        const midAngle = currentAngle + sliceAngle / 2;
        ctx.rotate(midAngle);
        ctx.textAlign = "left";
        ctx.fillStyle = "#fafafa";
        const fontSize = Math.max(8, Math.round(radius * 0.09));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        const textStartX = radius * 0.45;
        if (reward.name === "Mystery Box") {
          const centerX = (textStartX + radius - 8) / 2;
          ctx.textAlign = "center";
          ctx.fillText("Mystery", centerX, -fontSize * 0.3);
          ctx.fillText("Box", centerX, fontSize * 0.9);
          ctx.textAlign = "left";
        } else {
          ctx.fillText(reward.name, textStartX, fontSize * 0.35);
        }
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.restore();

        currentAngle += sliceAngle;
      });

      // Gold gradient frame lines between segments
      for (let i = 0; i < rewards.length; i++) {
        const angle = rotationAngle + i * sliceAngle;
        const endX = cx + Math.cos(angle) * radius;
        const endY = cy + Math.sin(angle) * radius;
        const lineGrad = ctx.createLinearGradient(cx, cy, endX, endY);
        lineGrad.addColorStop(0.12, "#BC9D44");
        lineGrad.addColorStop(0.29, "#FFF3B6");
        lineGrad.addColorStop(0.47, "#D4C476");
        lineGrad.addColorStop(0.69, "#F2E0A9");
        lineGrad.addColorStop(1.0, "#A47713");
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Metallic gold border around segment edge
      const goldRingGrad = ctx.createRadialGradient(cx, cy, radius - 4, cx, cy, radius + 4);
      goldRingGrad.addColorStop(0, "#A47713");
      goldRingGrad.addColorStop(0.25, "#BC9D44");
      goldRingGrad.addColorStop(0.5, "#FFF3B6");
      goldRingGrad.addColorStop(0.75, "#D4C476");
      goldRingGrad.addColorStop(1, "#A47713");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = goldRingGrad;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Outer ring - embossed green
      const ringCenter = radius + 5;
      const ringWidth = 15;
      const ringInner = ringCenter - ringWidth / 2;
      const ringOuter = ringCenter + ringWidth / 2;

      // Base ring fill
      const ringGrad = ctx.createRadialGradient(cx, cy, ringInner, cx, cy, ringOuter);
      ringGrad.addColorStop(0, "#052e16");   // green-950
      ringGrad.addColorStop(0.5, "#0f3d1e"); // dark green raised center
      ringGrad.addColorStop(1, "#031a0d");   // near black green edge
      ctx.beginPath();
      ctx.arc(cx, cy, ringCenter, 0, 2 * Math.PI);
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = ringWidth;
      ctx.stroke();

      // Inner drop shadow overlapping segments (fades out)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.clip();
      const shadowFade = ctx.createRadialGradient(cx, cy, radius - 30, cx, cy, radius);
      shadowFade.addColorStop(0, "rgba(0, 0, 0, 0)");
      shadowFade.addColorStop(0.6, "rgba(0, 0, 0, 0.15)");
      shadowFade.addColorStop(1, "rgba(0, 0, 0, 0.5)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = shadowFade;
      ctx.fill();
      ctx.restore();

      // Top highlight (light hits from top-left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ringInner + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(74, 222, 128, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Bottom shadow (emboss depth)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ringOuter - 1, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Inner edge shadow
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ringInner, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.stroke();
      ctx.restore();

      // Outer edge highlight
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ringOuter, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(74, 222, 128, 0.15)";
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(255, 255, 255, 0.1)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = -1;
      ctx.stroke();
      ctx.restore();

      // Outer gold ring
      const outerGoldRadius = radius + 5 + 7.5 + 3;
      const outerGoldGrad = ctx.createRadialGradient(cx, cy, outerGoldRadius - 3, cx, cy, outerGoldRadius + 3);
      outerGoldGrad.addColorStop(0, "#A47713");
      outerGoldGrad.addColorStop(0.25, "#BC9D44");
      outerGoldGrad.addColorStop(0.5, "#FFF3B6");
      outerGoldGrad.addColorStop(0.75, "#D4C476");
      outerGoldGrad.addColorStop(1, "#A47713");
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerGoldRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = outerGoldGrad;
      ctx.lineWidth = 8;
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      ctx.stroke();
      ctx.restore();

      // Spheres at segment boundaries on the outer ring
      const sphereRadius = Math.max(4, radius * 0.04);
      for (let i = 0; i < rewards.length; i++) {
        const boundaryAngle = rotationAngle + i * sliceAngle;
        const sx = cx + Math.cos(boundaryAngle) * radius;
        const sy = cy + Math.sin(boundaryAngle) * radius;

        // Sphere gradient for 3D look
        const grad = ctx.createRadialGradient(
          sx - sphereRadius * 0.3,
          sy - sphereRadius * 0.3,
          sphereRadius * 0.1,
          sx,
          sy,
          sphereRadius
        );
        grad.addColorStop(0, "#FFF3B6");
        grad.addColorStop(0.25, "#F2E0A9");
        grad.addColorStop(0.5, "#D4C476");
        grad.addColorStop(0.75, "#BC9D44");
        grad.addColorStop(1, "#A47713");

        ctx.beginPath();
        ctx.arc(sx, sy, sphereRadius, 0, 2 * Math.PI);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "#92600a";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Center hub - 3D sphere
      const hubRadius = radius * 0.28;

      // Soft drop shadow (only blur, no hard fill)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius + 10, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 60;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fill();
      ctx.restore();

      // Main sphere gradient
      const hubGrad = ctx.createRadialGradient(
        cx - hubRadius * 0.35,
        cy - hubRadius * 0.35,
        hubRadius * 0.05,
        cx,
        cy,
        hubRadius
      );
      hubGrad.addColorStop(0, "#3f3f46");   // zinc-700 highlight
      hubGrad.addColorStop(0.3, "#27272a"); // zinc-800
      hubGrad.addColorStop(0.6, "#18181b"); // zinc-900
      hubGrad.addColorStop(1, "#09090b");   // zinc-950 edge

      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius, 0, 2 * Math.PI);
      ctx.fillStyle = hubGrad;
      ctx.fill();

      // Subtle rim highlight
      ctx.strokeStyle = "#71717a";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular shine spot
      ctx.beginPath();
      ctx.arc(
        cx - hubRadius * 0.25,
        cy - hubRadius * 0.25,
        hubRadius * 0.25,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();

      // Inner sphere overlay (above hub, below "D")
      const innerSphereRadius = hubRadius * 0.7;
      const innerGrad = ctx.createRadialGradient(
        cx - innerSphereRadius * 0.3,
        cy - innerSphereRadius * 0.3,
        innerSphereRadius * 0.05,
        cx,
        cy,
        innerSphereRadius
      );
      innerGrad.addColorStop(0, "#4ade80");   // green-400 highlight
      innerGrad.addColorStop(0.35, "#22c55e"); // green-500
      innerGrad.addColorStop(0.7, "#15803d");  // green-700
      innerGrad.addColorStop(1, "#14532d");    // green-900 edge

      ctx.beginPath();
      ctx.arc(cx, cy, innerSphereRadius, 0, 2 * Math.PI);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Inner sphere rim
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner sphere specular
      ctx.beginPath();
      ctx.arc(
        cx - innerSphereRadius * 0.2,
        cy - innerSphereRadius * 0.2,
        innerSphereRadius * 0.2,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fill();

      // Dicey logo in center
      const logo = diceyLogoRef.current;
      if (logo && logo.complete && logo.naturalWidth > 0) {
        const logoSize = innerSphereRadius * 1.4;
        const logoW = logoSize;
        const logoH = logoSize * (logo.naturalHeight / logo.naturalWidth);
        ctx.drawImage(logo, cx - logoW / 2, cy - logoH / 2 - 9, logoW, logoH);
      }

      // Pointer at top (with tip deflection animation)
      const pointerSize = Math.max(6, radius * 0.08);
      const deflection = pointerDeflectionRef.current;
      const tipX = cx + Math.sin(deflection) * pointerSize * 2;
      const tipY = cy - radius + 2;
      const topLeftX = cx - pointerSize;
      const topLeftY = cy - radius - pointerSize * 1.8;
      const topRightX = cx + pointerSize;
      const topRightY = cy - radius - pointerSize * 1.8;
      const pointerGrad = ctx.createLinearGradient(topLeftX, topLeftY, topRightX, tipY);
      pointerGrad.addColorStop(0, "#A47713");
      pointerGrad.addColorStop(0.25, "#BC9D44");
      pointerGrad.addColorStop(0.5, "#FFF3B6");
      pointerGrad.addColorStop(0.75, "#D4C476");
      pointerGrad.addColorStop(1, "#A47713");
      ctx.fillStyle = pointerGrad;
      ctx.strokeStyle = pointerGrad;
      ctx.lineWidth = 8;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(topLeftX, topLeftY);
      ctx.lineTo(topRightX, topRightY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

    },
    [rewards]
  );

  // Load Dicey logo
  useEffect(() => {
    const img = new Image();
    img.src = DICEY_LOGO_SRC;
    img.onload = () => {
      diceyLogoRef.current = img;
      drawWheel(currentAngleRef.current);
    };
  }, [drawWheel]);

  // Initial draw and resize handling
  useEffect(() => {
    drawWheel(currentAngleRef.current);

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      drawWheel(currentAngleRef.current);
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [drawWheel]);

  // Reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Spin trigger
  useEffect(() => {
    if (!spinning || isSpinningRef.current) return;
    isSpinningRef.current = true;

    // Init audio context on user interaction
    getAudioContext();

    const winningIndex = selectWeightedReward(rewards);
    const targetAngle = getTargetAngle(
      winningIndex,
      rewards,
      currentAngleRef.current
    );

    if (reducedMotionRef.current) {
      currentAngleRef.current = targetAngle;
      drawWheel(targetAngle);
      isSpinningRef.current = false;
      onSpinComplete(rewards[winningIndex]);
      return;
    }

    const startAngle = currentAngleRef.current;
    const totalRotation = targetAngle - startAngle;
    const startTime = performance.now();
    const sliceAngle = (2 * Math.PI) / rewards.length;
    lastSegmentIndexRef.current = -1;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = spinEase(progress);

      currentAngleRef.current = startAngle + totalRotation * eased;

      // Detect sphere hitting pointer (pointer is at -PI/2, i.e. top)
      const pointerAngle = -Math.PI / 2;
      const normalizedAngle = ((pointerAngle - currentAngleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSegIdx = Math.floor(normalizedAngle / sliceAngle);
      if (lastSegmentIndexRef.current !== -1 && currentSegIdx !== lastSegmentIndexRef.current) {
        // Sphere just passed the pointer — deflect it and play tick
        pointerDeflectionRef.current = 0.3;
        const speed = 1 - progress;
        playTickSound(0.8 + speed * 0.6);
      }
      lastSegmentIndexRef.current = currentSegIdx;

      // Spring back the pointer deflection
      pointerDeflectionRef.current *= 0.85;
      if (Math.abs(pointerDeflectionRef.current) < 0.005) {
        pointerDeflectionRef.current = 0;
      }

      drawWheel(currentAngleRef.current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        isSpinningRef.current = false;
        pointerDeflectionRef.current = 0;

        // Play winner sound
        const winAudio = new Audio(WINNER_SOUND_SRC);
        winAudio.play().catch(() => {});

        onSpinComplete(rewards[winningIndex]);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [spinning, rewards, drawWheel, onSpinComplete]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        role="img"
        aria-label="Spin wheel with 10 reward segments"
      />
    </div>
  );
}
