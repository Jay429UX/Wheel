"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { CylinderWheel, type Reward } from "@/components/CylinderWheel";
import { Starburst } from "@/components/Starburst";

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
  const showWheel = !showCongrats || (isMysteryBox && mysteryPhase === "won");

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
          className="mb-4 relative rounded-lg"
          style={{
            background: "linear-gradient(180deg, #333 0%, #1a1a1a 30%, #0a0a0a 70%, #000 100%)",
            boxShadow: "0 0 20px 3px rgba(0,0,0,0.6)",
            padding: "26px",
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
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "radial-gradient(circle at 38% 32%, #ddd 0%, #aaa 30%, #666 60%, #333 100%)",
                boxShadow:
                  "inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 10,
                  height: 2,
                  transform: "translate(-50%, -50%) rotate(35deg)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 1,
                }}
              />
            </div>
          ))}

          {/* Scratch & bump texture on frame */}
          <div className="frame-texture" />

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

          {/* Gold arrow — left, pointing right */}
          <div
            className="absolute z-20"
            style={{
              left: -2,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
              <defs>
                <linearGradient id="goldGradL" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#BC9D44">
                    <animate attributeName="stop-color" values="#BC9D44;#FFF3B6;#D4C476;#A47713;#FFF3B6;#BC9D44" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#FFF3B6">
                    <animate attributeName="stop-color" values="#FFF3B6;#D4C476;#A47713;#FFF3B6;#BC9D44;#FFF3B6" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#A47713">
                    <animate attributeName="stop-color" values="#A47713;#FFF3B6;#BC9D44;#FFF3B6;#D4C476;#A47713" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <path d="M0,0 L20,16 L0,32 Z" fill="url(#goldGradL)" stroke="#8B6914" strokeWidth="1" />
            </svg>
          </div>

          {/* Gold arrow — right, pointing left */}
          <div
            className="absolute z-20"
            style={{
              right: -2,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <svg width="20" height="32" viewBox="0 0 20 32" fill="none">
              <defs>
                <linearGradient id="goldGradR" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="#BC9D44">
                    <animate attributeName="stop-color" values="#BC9D44;#FFF3B6;#D4C476;#A47713;#FFF3B6;#BC9D44" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#FFF3B6">
                    <animate attributeName="stop-color" values="#FFF3B6;#D4C476;#A47713;#FFF3B6;#BC9D44;#FFF3B6" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#A47713">
                    <animate attributeName="stop-color" values="#A47713;#FFF3B6;#BC9D44;#FFF3B6;#D4C476;#A47713" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <path d="M20,0 L0,16 L20,32 Z" fill="url(#goldGradR)" stroke="#8B6914" strokeWidth="1" />
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

            {/* Starburst behind congrats */}
            {showCongratsOverlay && !isMysteryBox && (
              <div
                className="absolute inset-0 z-[3] transition-opacity duration-700"
                style={{ opacity: showCongratsOverlay ? 1 : 0 }}
              >
                <Starburst centered variant="gold" />
              </div>
            )}
            {showCongratsOverlay && mysteryPhase === "reveal" && (
              <div
                className="absolute inset-0 z-[3] transition-opacity duration-700"
                style={{ opacity: 1 }}
              >
                <Starburst centered variant="gold" />
              </div>
            )}

            {/* Congratulations overlay (cash win or mystery reveal) */}
            <div
              className="absolute inset-0 z-[4] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none"
              style={{
                opacity: showCongratsOverlay ? 1 : 0,
                transform: showCongratsOverlay ? "translateY(0)" : "translateY(40px)",
              }}
            >
              <div className={`relative bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 flex flex-col items-center overflow-hidden ${isMysteryBox && mysteryPhase !== "reveal" ? "animate-mystery-shake" : ""}`}>
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
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl px-6 py-3 flex flex-col items-center overflow-hidden animate-mystery-shake">
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
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => {
            if (isMysteryBox && mysteryPhase === "won") {
              handleOpenMysteryBox();
            } else {
              handleSpinAgain();
            }
          }}
          disabled={isSpinning || mysteryPhase === "video"}
          className={cn(
            "w-full py-3 font-bold text-white",
            isSpinning || mysteryPhase === "video"
              ? "bg-zinc-600 cursor-not-allowed"
              : "hover:opacity-90 active:opacity-80"
          )}
          style={{
            borderRadius: "9999px",
            backgroundColor: isSpinning || mysteryPhase === "video"
              ? undefined
              : isMysteryBox && mysteryPhase === "won"
              ? "#7C3AED"
              : "#00AB4C",
          }}
        >
          {isSpinning
            ? "Spinning..."
            : mysteryPhase === "video"
            ? "Opening..."
            : isMysteryBox && mysteryPhase === "won"
            ? "Open Mystery Box"
            : "Spin Now"}
        </button>
      </div>
    </div>
  );
}
