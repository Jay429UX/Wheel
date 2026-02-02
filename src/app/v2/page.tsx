"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CylinderWheel, type Reward } from "@/components/CylinderWheel";
import { FloatingParticles } from "@/components/FloatingParticles";
import confetti from "canvas-confetti";

/* ─── Random lightning bolt generator ─── */
const BOLT_COLORS = ["#00ff88", "#39ff14", "#00ffcc"];

// Left arrow edges: top-left(0,0)→tip(20,16), tip(20,16)→bottom-left(0,32)
// Right arrow edges: top-right(20,0)→tip(0,16), tip(0,16)→bottom-right(20,32)
function pointOnEdge(side: "left" | "right") {
  const t = Math.random();
  const edge = Math.random() < 0.5 ? 0 : 1; // top edge or bottom edge
  if (side === "left") {
    if (edge === 0) return { x: t * 20, y: t * 16 };       // (0,0)→(20,16)
    return { x: (1 - t) * 20, y: 16 + t * 16 };            // (20,16)→(0,32)
  }
  if (edge === 0) return { x: 20 - t * 20, y: t * 16 };    // (20,0)→(0,16)
  return { x: t * 20, y: 16 + t * 16 };                     // (0,16)→(20,32)
}

function randomBolt(side: "left" | "right") {
  const origin = pointOnEdge(side);
  const color = BOLT_COLORS[Math.floor(Math.random() * BOLT_COLORS.length)];
  // Direction radiates outward from arrow center (10,16)
  const dx = origin.x - 10;
  const dy = origin.y - 16;
  const outAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
  const segments = 2 + Math.floor(Math.random() * 2); // 2-3 segments
  const segLen = 2 + Math.random() * 4; // shorter: 2-6
  const jitter = 1.5 + Math.random() * 2.5;
  const strokeW = 0.4 + Math.random() * 0.6;
  const dur = (0.15 + Math.random() * 0.45).toFixed(2);
  const dur2 = (0.12 + Math.random() * 0.3).toFixed(2);

  const paths: string[] = [];
  for (let v = 0; v < 3; v++) {
    let x = origin.x + (v === 0 ? 0 : (Math.random() - 0.5) * 1.5);
    let y = origin.y + (v === 0 ? 0 : (Math.random() - 0.5) * 1.5);
    let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
    for (let s = 0; s < segments; s++) {
      const a = outAngle + (Math.random() - 0.5) * 1.0;
      x += Math.cos(a) * segLen;
      y += Math.sin(a) * segLen;
      x += (Math.random() - 0.5) * jitter;
      y += (Math.random() - 0.5) * jitter;
      d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    paths.push(d);
  }

  const opVals = Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () =>
    (Math.random() * 0.9).toFixed(1)
  ).join(";") + ";0";

  return { paths, color, strokeW, dur, dur2, opVals };
}

function generateBolts(count: number, side: "left" | "right") {
  return Array.from({ length: count }, () => randomBolt(side));
}

function generateDots(count: number, side: "left" | "right") {
  return Array.from({ length: count }, () => {
    const pt = pointOnEdge(side);
    return {
      cx: pt.x,
      cy: pt.y,
      r: 0.3 + Math.random() * 0.4,
      color: BOLT_COLORS[Math.floor(Math.random() * BOLT_COLORS.length)],
      dur: (0.1 + Math.random() * 0.2).toFixed(2),
      drift: (1 + Math.random() * 2).toFixed(1),
    };
  });
}


const yourSpinRewards: Reward[] = [
  { id: 1, name: "$0.50", image: "/Cash-Prize.png", chance: 20 },
  { id: 2, name: "$1.00", image: "/Cash-Prize.png", chance: 18 },
  { id: 3, name: "$2.50", image: "/Cash-Prize.png", chance: 15 },
  { id: 9, name: "Mystery Box", image: "/Mystery-box.png", chance: 8 },
  { id: 4, name: "$5.00", image: "/Cash-Prize.png", chance: 12 },
  { id: 5, name: "$10.00", image: "/Cash-Prize.png", chance: 10 },
  { id: 6, name: "$25.00", image: "/Cash-Prize.png", chance: 7 },
  { id: 7, name: "$50.00", image: "/Cash-Prize.png", chance: 4 },
  { id: 10, name: "Mystery Box", image: "/Mystery-box.png", chance: 4 },
  { id: 8, name: "$100.00", image: "/Cash-Prize.png", chance: 2 },
];

const MYSTERY_CASH_VALUES = ["$5.00", "$10.00", "$25.00", "$50.00", "$100.00", "$250.00", "$500.00"];

type MysteryPhase = "idle" | "won" | "video" | "reveal";

export default function V2Page() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Reward | null>(null);
  const [mysteryPhase, setMysteryPhase] = useState<MysteryPhase>("idle");
  const [mysteryValue, setMysteryValue] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Generate random bolts once per mount
  const leftBolts = useMemo(() => generateBolts(6, "left"), []);
  const rightBolts = useMemo(() => generateBolts(6, "right"), []);
  const leftDots = useMemo(() => generateDots(2, "left"), []);
  const rightDots = useMemo(() => generateDots(2, "right"), []);
  const turbSeeds = useMemo(() => ({
    lGlow: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50)),
    rGlow: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50)),
    lSpark: Array.from({ length: 5 }, () => Math.floor(Math.random() * 50)),
    rSpark: Array.from({ length: 5 }, () => Math.floor(Math.random() * 50)),
    lFreq: (0.03 + Math.random() * 0.06).toFixed(3),
    rFreq: (0.03 + Math.random() * 0.06).toFixed(3),
    lScale: 2 + Math.floor(Math.random() * 4),
    rScale: 2 + Math.floor(Math.random() * 4),
  }), []);

  const isMysteryBox = spinResult?.name === "Mystery Box";
  const showCongrats = spinResult && !isSpinning;
  const showCongratsOverlay = showCongrats && (!isMysteryBox || mysteryPhase === "reveal");
  const showWheel = !showCongrats;

  // Confetti explosion on win
  useEffect(() => {
    if (!showCongratsOverlay) return;
    const colors = isMysteryBox
      ? ["#7C3AED", "#C084FC", "#A855F7", "#E9D5FF"]
      : ["#BC9D44", "#FFF3B6", "#D4C476", "#00C853", "#ffffff"];
    // Initial big burst
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
    // Delayed side bursts
    const t1 = setTimeout(() => {
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
    }, 200);
    return () => clearTimeout(t1);
  }, [showCongratsOverlay]);

  function handleOpenMysteryBox() {
    setMysteryPhase("video");
    setMysteryValue(MYSTERY_CASH_VALUES[Math.floor(Math.random() * MYSTERY_CASH_VALUES.length)]);
    setTimeout(() => {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }, 50);
  }

  function handleVideoEnded() {
    setMysteryPhase("reveal");
  }

  function handleSpinAgain() {
    setSpinResult(null);
    setMysteryPhase("idle");
    setMysteryValue(null);
    setIsSpinning(true);
  }

  return (
    <div className="noise-bg flex min-h-dvh items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md mx-4">
        {/* Game Container — frame with bolts, wheel inside */}
        <div
          className="mb-4 relative rounded-2xl"
          style={{
            background: "linear-gradient(180deg, #151515 0%, #0e0e0e 40%, #080808 100%)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            borderRight: "1px solid rgba(0,0,0,0.4)",
            borderBottom: "1px solid rgba(0,0,0,0.5)",
            boxShadow:
              "0 6px 0 0 #050505, 0 6px 0 1px rgba(0,0,0,0.6), 0 10px 20px 0 rgba(0,0,0,0.7), 0 0 40px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.4)",
            padding: "26px 26px 28px 26px",
          }}
        >
          {/* 4 corner bolts */}
          {([
            { top: 10, left: 10 },
            { top: 10, right: 10 },
            { bottom: 10, left: 10 },
            { bottom: 10, right: 10 },
          ] as const).map((pos, i) => (
            <div
              key={i}
              className="absolute z-10"
              style={{
                ...pos,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "radial-gradient(circle at 38% 32%, #444 0%, #333 30%, #222 60%, #111 100%)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 8,
                  height: 1.6,
                  transform: "translate(-50%, -50%) rotate(35deg)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 1,
                }}
              />
            </div>
          ))}


          {/* Dicey logo — centered on top frame edge */}
          <div
            className="absolute z-20 left-1/2"
            style={{
              top: 5,
              transform: "translateX(-50%)",
            }}
          >
            <img
              src="/Dicey.svg"
              alt="Dicey"
              className="dicey-neon-glow"
              style={{
                height: 16,
                width: "auto",
              }}
            />
          </div>

          {/* Frame shimmer effect */}
          <div className="frame-shimmer-wrap" />

          {/* Green electric arrow — left, pointing right */}
          <div
            className="absolute z-20 arrow-electric"
            style={{
              left: -2,
              top: 136,
              transform: "translateY(-50%)",
            }}
          >
            <svg width="20" height="32" viewBox="0 0 20 32" fill="none" className="arrow-pulse">
              <defs>
                <linearGradient id="greenGradL" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#00ff88">
                    <animate attributeName="stop-color" values="#00ff88;#00ffcc;#39ff14;#00ff88" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#39ff14">
                    <animate attributeName="stop-color" values="#39ff14;#00ff88;#00ffcc;#39ff14" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#00cc44">
                    <animate attributeName="stop-color" values="#00cc44;#39ff14;#00ff88;#00cc44" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <filter id="elecGlowL" x="-30%" y="-30%" width="160%" height="160%">
                  <feTurbulence type="turbulence" baseFrequency={turbSeeds.lFreq} numOctaves="3" seed={turbSeeds.lGlow[0]} result="turb">
                    <animate attributeName="seed" values={turbSeeds.lGlow.join(";")} dur="0.5s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale={turbSeeds.lScale} result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
                <filter id="sparkTurbL" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="turbulence" baseFrequency={(parseFloat(turbSeeds.lFreq) * 2).toFixed(3)} numOctaves="4" seed={turbSeeds.lSpark[0]} result="turb">
                    <animate attributeName="seed" values={turbSeeds.lSpark.join(";")} dur="0.3s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale={turbSeeds.lScale + 1} result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M0,0 L20,16 L0,32 Z" fill="url(#greenGradL)" stroke="#00ff88" strokeWidth="0.5" filter="url(#elecGlowL)" />
            </svg>
            {/* Electricity bolts — randomly generated */}
            <svg className="arrow-sparks" width="32" height="44" viewBox="-6 -6 32 44" style={{ position: "absolute", top: -6, left: -6, pointerEvents: "none" }} filter="url(#sparkTurbL)">
              {leftBolts.map((b, i) => (
                <path key={i} d={b.paths[0]} stroke={b.color} strokeWidth={b.strokeW} fill="none" strokeLinecap="round">
                  <animate attributeName="opacity" values={b.opVals} dur={`${b.dur}s`} repeatCount="indefinite" />
                  <animate attributeName="d" values={b.paths.join(";")} dur={`${b.dur2}s`} repeatCount="indefinite" />
                </path>
              ))}
              {leftDots.map((d, i) => (
                <circle key={`d${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} opacity="0.5">
                  <animate attributeName="opacity" values="0;1;0" dur={`${d.dur}s`} repeatCount="indefinite" />
                  <animate attributeName="cx" values={`${d.cx};${parseFloat(d.drift) + d.cx};${d.cx}`} dur={`${(parseFloat(d.dur) * 1.5).toFixed(2)}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
          </div>

          {/* Green electric arrow — right, pointing left */}
          <div
            className="absolute z-20 arrow-electric"
            style={{
              right: -2,
              top: 136,
              transform: "translateY(-50%)",
            }}
          >
            <svg width="20" height="32" viewBox="0 0 20 32" fill="none" className="arrow-pulse">
              <defs>
                <linearGradient id="greenGradR" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#00ff88">
                    <animate attributeName="stop-color" values="#00ff88;#00ffcc;#39ff14;#00ff88" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#39ff14">
                    <animate attributeName="stop-color" values="#39ff14;#00ff88;#00ffcc;#39ff14" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#00cc44">
                    <animate attributeName="stop-color" values="#00cc44;#39ff14;#00ff88;#00cc44" dur="1.5s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <filter id="elecGlowR" x="-30%" y="-30%" width="160%" height="160%">
                  <feTurbulence type="turbulence" baseFrequency={turbSeeds.rFreq} numOctaves="3" seed={turbSeeds.rGlow[0]} result="turb">
                    <animate attributeName="seed" values={turbSeeds.rGlow.join(";")} dur="0.5s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale={turbSeeds.rScale} result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
                <filter id="sparkTurbR" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="turbulence" baseFrequency={(parseFloat(turbSeeds.rFreq) * 2).toFixed(3)} numOctaves="4" seed={turbSeeds.rSpark[0]} result="turb">
                    <animate attributeName="seed" values={turbSeeds.rSpark.join(";")} dur="0.3s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale={turbSeeds.rScale + 1} result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M20,0 L0,16 L20,32 Z" fill="url(#greenGradR)" stroke="#00ff88" strokeWidth="0.5" filter="url(#elecGlowR)" />
            </svg>
            {/* Electricity bolts — randomly generated */}
            <svg className="arrow-sparks" width="32" height="44" viewBox="-6 -6 32 44" style={{ position: "absolute", top: -6, right: -6, pointerEvents: "none" }} filter="url(#sparkTurbR)">
              {rightBolts.map((b, i) => (
                <path key={i} d={b.paths[0]} stroke={b.color} strokeWidth={b.strokeW} fill="none" strokeLinecap="round">
                  <animate attributeName="opacity" values={b.opVals} dur={`${b.dur}s`} repeatCount="indefinite" />
                  <animate attributeName="d" values={b.paths.join(";")} dur={`${b.dur2}s`} repeatCount="indefinite" />
                </path>
              ))}
              {rightDots.map((d, i) => (
                <circle key={`d${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} opacity="0.5">
                  <animate attributeName="opacity" values="0;1;0" dur={`${d.dur}s`} repeatCount="indefinite" />
                  <animate attributeName="cx" values={`${d.cx};${parseFloat(d.drift) + d.cx};${d.cx}`} dur={`${(parseFloat(d.dur) * 1.5).toFixed(2)}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </svg>
          </div>

          {/* Inner dark area where wheel lives */}
          <div
            className="relative rounded-2xl overflow-hidden z-[2]"
            style={{
              background: "#080808",
              height: "220px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8), inset 0 -2px 8px rgba(0,0,0,0.8), inset 2px 0 8px rgba(0,0,0,0.6), inset -2px 0 8px rgba(0,0,0,0.6)",
            }}
          >

            {/* Cylinder Wheel */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
              style={{
                opacity: showWheel ? 1 : 0,
                transform: showWheel ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <CylinderWheel
                rewards={yourSpinRewards}
                spinning={isSpinning}
                onSpinComplete={(reward) => {
                  setIsSpinning(false);
                  setSpinResult(reward);
                  if (reward.name === "Mystery Box") {
                    setMysteryPhase("won");
                  }
                }}
              />
            </div>

            {/* Mystery Box video */}
            <video
              ref={videoRef}
              src="/The_box_opens.mp4"
              className="absolute inset-0 w-full h-full object-cover z-[3] transition-opacity duration-500"
              style={{
                opacity: mysteryPhase === "video" || mysteryPhase === "reveal" ? 1 : 0,
                pointerEvents: mysteryPhase === "video" || mysteryPhase === "reveal" ? "auto" : "none",
                WebkitMaskImage: "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)",
                maskImage: "radial-gradient(ellipse 70% 70% at center, black 40%, transparent 100%)",
              }}
              playsInline
              muted={false}
              onEnded={handleVideoEnded}
            />

            {/* Floating particles — only on win overlays */}
            {showCongrats && (
              <FloatingParticles mode={
                mysteryPhase === "reveal" ? "gold" :
                isMysteryBox ? "purple" :
                "gold"
              } />
            )}

            {/* Congratulations overlay (cash win or mystery reveal) */}
            <div
              className="absolute inset-0 z-[4] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none"
              style={{
                opacity: showCongratsOverlay ? 1 : 0,
                transform: showCongratsOverlay ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <div className={`relative bg-black rounded-xl px-6 py-3 flex flex-col items-center overflow-hidden ${isMysteryBox && mysteryPhase !== "reveal" ? "animate-mystery-shake" : ""}`}>
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    padding: "2px",
                    background: mysteryPhase === "reveal"
                      ? "linear-gradient(var(--gold-border-angle, 0deg), #BC9D44, #FFF3B6, #D4C476, #A47713, #FFF3B6, #BC9D44)"
                      : isMysteryBox
                      ? "linear-gradient(var(--gold-border-angle, 0deg), #7C3AED, #C084FC, #A855F7, #E9D5FF, #C084FC, #7C3AED)"
                      : "linear-gradient(var(--gold-border-angle, 0deg), #BC9D44, #FFF3B6, #D4C476, #A47713, #FFF3B6, #BC9D44)",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    animation: "rotate-gold-border 3s linear infinite",
                  }}
                />
                <p className="text-white text-sm font-bold uppercase tracking-widest mb-1">Congratulations</p>
                <p className="text-white text-xs uppercase tracking-wide mb-2">You Won</p>
                {spinResult && (
                  <>
                    <img
                      src="/Cash-Prize.png"
                      alt="Cash Prize"
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-2 drop-shadow-lg"
                    />
                    <p
                      className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg animate-gold-shimmer"
                      style={{
                        background: "linear-gradient(90deg, #BC9D44, #FFF3B6, #D4C476, #FFF3B6, #A47713, #FFF3B6, #BC9D44)",
                        backgroundSize: "200% 100%",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {mysteryPhase === "reveal" ? mysteryValue : spinResult.name}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Mystery Box "won" overlay */}
            <div
              className="absolute inset-0 z-[2] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none"
              style={{
                opacity: isMysteryBox && mysteryPhase === "won" ? 1 : 0,
                transform: isMysteryBox && mysteryPhase === "won" ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <div className="relative bg-black rounded-xl px-6 py-3 flex flex-col items-center overflow-hidden animate-mystery-shake">
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    padding: "2px",
                    background: "linear-gradient(var(--gold-border-angle, 0deg), #7C3AED, #C084FC, #A855F7, #E9D5FF, #C084FC, #7C3AED)",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    animation: "rotate-gold-border 3s linear infinite",
                  }}
                />
                <p className="text-white text-sm font-bold uppercase tracking-widest mb-1">Congratulations</p>
                <p className="text-white text-xs uppercase tracking-wide mb-2">You Won A</p>
                <img
                  src="/Mystery-box.png"
                  alt="Mystery Box"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-2 drop-shadow-lg"
                />
                <p
                  className="text-2xl sm:text-3xl font-extrabold drop-shadow-lg animate-purple-shimmer"
                  style={{
                    background: "linear-gradient(90deg, #7C3AED, #C084FC, #A855F7, #E9D5FF, #C084FC, #7C3AED)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Mystery Box
                </p>
              </div>
            </div>

            {/* Screen reflection overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-[5]"
              style={{
                borderRadius: "inherit",
                background: "linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 25%, transparent 50%, transparent 80%, rgba(255,255,255,0.02) 100%)",
              }}
            />
          </div>

          {/* CTA Button — embedded in frame bottom */}
          <div className="relative z-[3]" style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => {
                if (isMysteryBox && mysteryPhase === "won") {
                  handleOpenMysteryBox();
                } else {
                  handleSpinAgain();
                }
              }}
              disabled={isSpinning || mysteryPhase === "video"}
              className={cn(
                "button",
                isSpinning || mysteryPhase === "video"
                  ? "button--disabled"
                  : isMysteryBox && mysteryPhase === "won"
                  ? "button--purple"
                  : "button--green"
              )}
            >
              <div className="button-top">
                {isSpinning
                  ? "Spinning..."
                  : mysteryPhase === "video"
                  ? "Opening..."
                  : isMysteryBox && mysteryPhase === "won"
                  ? "Open Mystery Box"
                  : "Spin Now"}
              </div>
              <div className="button-bottom" />
              <div className="button-base" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
