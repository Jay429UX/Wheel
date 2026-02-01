"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CylinderWheel, type Reward } from "@/components/CylinderWheel";
import { FloatingParticles } from "@/components/FloatingParticles";
import confetti from "canvas-confetti";


const yourSpinRewards: Reward[] = [
  { id: 1, name: "$0.50", image: "/rewards/cash.png", chance: 20 },
  { id: 2, name: "$1.00", image: "/rewards/cash.png", chance: 18 },
  { id: 3, name: "$2.50", image: "/rewards/cash.png", chance: 15 },
  { id: 4, name: "$5.00", image: "/rewards/cash.png", chance: 12 },
  { id: 5, name: "$10.00", image: "/rewards/cash.png", chance: 10 },
  { id: 6, name: "$25.00", image: "/rewards/cash.png", chance: 7 },
  { id: 7, name: "$50.00", image: "/rewards/cash.png", chance: 4 },
  { id: 8, name: "$100.00", image: "/rewards/cash.png", chance: 2 },
  { id: 9, name: "Mystery Box", image: "/rewards/mystery.png", chance: 8 },
  { id: 10, name: "Mystery Box", image: "/rewards/mystery.png", chance: 4 },
];

const MYSTERY_CASH_VALUES = ["$5.00", "$10.00", "$25.00", "$50.00", "$100.00", "$250.00", "$500.00"];

type MysteryPhase = "idle" | "won" | "video" | "reveal";

export default function V2Page() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Reward | null>(null);
  const [mysteryPhase, setMysteryPhase] = useState<MysteryPhase>("idle");
  const [mysteryValue, setMysteryValue] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
              style={{
                height: 16,
                width: "auto",
                opacity: 0.6,
                filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.3)) drop-shadow(0 -1px 1px rgba(0,0,0,0.8))",
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
                  <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="1" result="turb">
                    <animate attributeName="seed" values="1;5;2;8;3;6;1" dur="0.5s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale="3" result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
                <filter id="sparkTurbL" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="4" seed="10" result="turb">
                    <animate attributeName="seed" values="10;20;15;30;10" dur="0.3s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale="4" result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M0,0 L20,16 L0,32 Z" fill="url(#greenGradL)" stroke="#00ff88" strokeWidth="0.5" filter="url(#elecGlowL)" />
            </svg>
            {/* Electricity bolts */}
            <svg className="arrow-sparks" width="40" height="52" viewBox="-10 -10 40 52" style={{ position: "absolute", top: -10, left: -10, pointerEvents: "none" }} filter="url(#sparkTurbL)">
              {/* Bolt radiating up-right ↗ */}
              <path d="M12,14 L16,8 L14,4 L19,-1" stroke="#00ff88" strokeWidth="1.1" fill="none" opacity="0.8" strokeLinecap="round">
                <animate attributeName="opacity" values="0;1;0.2;0.9;0" dur="0.38s" repeatCount="indefinite" />
                <animate attributeName="d" values="M12,14 L16,8 L14,4 L19,-1;M13,13 L17,7 L15,3 L20,-2;M11,15 L15,9 L13,5 L18,0" dur="0.28s" repeatCount="indefinite" />
              </path>
              {/* Bolt going left-down ↙ */}
              <path d="M6,18 L1,22 L3,26" stroke="#39ff14" strokeWidth="0.6" fill="none" opacity="0.5" strokeLinecap="round">
                <animate attributeName="opacity" values="0.5;0;0.8;0;0" dur="0.22s" repeatCount="indefinite" />
              </path>
              {/* Bolt arcing down-right then back up ↘↗ */}
              <path d="M14,22 L19,28 L16,33 L22,30 L18,38" stroke="#00ffcc" strokeWidth="0.9" fill="none" opacity="0.6" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.7;0;0.4;0.8;0" dur="0.52s" repeatCount="indefinite" />
                <animate attributeName="d" values="M14,22 L19,28 L16,33 L22,30 L18,38;M15,24 L20,29 L17,35 L23,32 L19,40;M13,21 L18,27 L15,32 L21,29 L17,37" dur="0.4s" repeatCount="indefinite" />
              </path>
              {/* Horizontal flick ← */}
              <path d="M4,8 L-4,7" stroke="#00ff88" strokeWidth="1.3" fill="none" opacity="0.3" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.9;0;0;0.4;0" dur="0.6s" repeatCount="indefinite" />
              </path>
              {/* Bolt going up-left ↖ */}
              <path d="M8,20 L3,16 L5,12 L-1,9" stroke="#39ff14" strokeWidth="0.7" fill="none" opacity="0.7" strokeLinecap="round">
                <animate attributeName="opacity" values="0.7;0;0.3;1;0" dur="0.33s" repeatCount="indefinite" />
                <animate attributeName="d" values="M8,20 L3,16 L5,12 L-1,9;M9,21 L4,17 L6,13 L0,10;M7,19 L2,15 L4,11 L-2,8" dur="0.2s" repeatCount="indefinite" />
              </path>
              {/* Vertical spark ↓ */}
              <path d="M20,18 L21,24 L19,28" stroke="#00ffcc" strokeWidth="0.8" fill="none" opacity="0.4" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.6;0;1;0" dur="0.27s" repeatCount="indefinite" />
              </path>
              {/* Micro dot spark */}
              <circle cx="8" cy="0" r="0.8" fill="#00ffcc" opacity="0.5">
                <animate attributeName="opacity" values="0;1;0" dur="0.15s" repeatCount="indefinite" />
                <animate attributeName="cy" values="0;2;-1" dur="0.25s" repeatCount="indefinite" />
              </circle>
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
                  <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="3" seed="7" result="turb">
                    <animate attributeName="seed" values="7;3;9;2;6;4;7" dur="0.5s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale="3" result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
                <filter id="sparkTurbR" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="turbulence" baseFrequency="0.08" numOctaves="4" seed="25" result="turb">
                    <animate attributeName="seed" values="25;35;20;40;25" dur="0.3s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale="4" result="displaced" />
                  <feGaussianBlur in="displaced" stdDeviation="0.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="displaced" />
                  </feMerge>
                </filter>
              </defs>
              <path d="M20,0 L0,16 L20,32 Z" fill="url(#greenGradR)" stroke="#00ff88" strokeWidth="0.5" filter="url(#elecGlowR)" />
            </svg>
            {/* Electricity bolts */}
            <svg className="arrow-sparks" width="40" height="52" viewBox="-10 -10 40 52" style={{ position: "absolute", top: -10, right: -10, pointerEvents: "none" }} filter="url(#sparkTurbR)">
              {/* Bolt radiating up-left ↖ */}
              <path d="M8,14 L4,8 L6,4 L1,-1" stroke="#00ff88" strokeWidth="1.1" fill="none" opacity="0.8" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.9;0.1;1;0" dur="0.42s" repeatCount="indefinite" />
                <animate attributeName="d" values="M8,14 L4,8 L6,4 L1,-1;M7,13 L3,7 L5,3 L0,-2;M9,15 L5,9 L7,5 L2,0" dur="0.32s" repeatCount="indefinite" />
              </path>
              {/* Bolt going right-down ↘ */}
              <path d="M14,18 L19,22 L17,26" stroke="#39ff14" strokeWidth="0.6" fill="none" opacity="0.5" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.7;0;0.9;0" dur="0.19s" repeatCount="indefinite" />
              </path>
              {/* Bolt arcing down-left then up ↙↖ */}
              <path d="M6,22 L1,28 L4,33 L-2,30 L2,38" stroke="#00ffcc" strokeWidth="0.9" fill="none" opacity="0.6" strokeLinecap="round">
                <animate attributeName="opacity" values="0.3;0;0.8;0;0.5;0" dur="0.48s" repeatCount="indefinite" />
                <animate attributeName="d" values="M6,22 L1,28 L4,33 L-2,30 L2,38;M5,24 L0,29 L3,35 L-3,32 L1,40;M7,21 L2,27 L5,32 L-1,29 L3,37" dur="0.37s" repeatCount="indefinite" />
              </path>
              {/* Horizontal flick → */}
              <path d="M16,8 L24,7" stroke="#00ff88" strokeWidth="1.3" fill="none" opacity="0.3" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.8;0;0;0.6;0" dur="0.55s" repeatCount="indefinite" />
              </path>
              {/* Bolt going down-right ↘ */}
              <path d="M12,20 L17,24 L15,28 L21,31" stroke="#39ff14" strokeWidth="0.7" fill="none" opacity="0.7" strokeLinecap="round">
                <animate attributeName="opacity" values="0.6;0;0.4;0.9;0" dur="0.29s" repeatCount="indefinite" />
                <animate attributeName="d" values="M12,20 L17,24 L15,28 L21,31;M11,21 L16,25 L14,29 L20,32;M13,19 L18,23 L16,27 L22,30" dur="0.23s" repeatCount="indefinite" />
              </path>
              {/* Vertical spark ↑ */}
              <path d="M0,20 L-1,14 L1,10" stroke="#00ffcc" strokeWidth="0.8" fill="none" opacity="0.4" strokeLinecap="round">
                <animate attributeName="opacity" values="0;0.6;0;1;0" dur="0.31s" repeatCount="indefinite" />
              </path>
              {/* Micro dot spark */}
              <circle cx="12" cy="32" r="0.8" fill="#00ffcc" opacity="0.5">
                <animate attributeName="opacity" values="0;1;0" dur="0.18s" repeatCount="indefinite" />
                <animate attributeName="cy" values="32;30;33" dur="0.25s" repeatCount="indefinite" />
              </circle>
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
