"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { SpinWheel, type Reward as SpinReward } from "@/components/SpinWheel";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Starburst } from "@/components/Starburst";

const yourSpinRewards = [
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

// Mystery box random cash values
const MYSTERY_CASH_VALUES = ["$5.00", "$10.00", "$25.00", "$50.00", "$100.00", "$250.00", "$500.00"];

type MysteryPhase = "idle" | "won" | "video" | "reveal";

export default function V1Page() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<SpinReward | null>(null);
  const [mysteryPhase, setMysteryPhase] = useState<MysteryPhase>("idle");
  const [mysteryValue, setMysteryValue] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isMysteryBox = spinResult?.name === "Mystery Box";
  const showCongrats = spinResult && !isSpinning;
  // For cash wins, show congrats immediately; for mystery box, only after reveal
  const showCongratsOverlay = showCongrats && (!isMysteryBox || mysteryPhase === "reveal");
  // Show the wheel when spinning OR idle, hide during mystery video/reveal and cash win
  const showWheel = !showCongrats || (isMysteryBox && mysteryPhase === "won");

  function handleOpenMysteryBox() {
    setMysteryPhase("video");
    // Pick a random mystery cash value
    setMysteryValue(MYSTERY_CASH_VALUES[Math.floor(Math.random() * MYSTERY_CASH_VALUES.length)]);
    // Play video after state update
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
      <div className="w-full max-w-lg mx-4">
        {/* Game Container */}
        <div className="mb-4 relative h-[192px] sm:h-[230px] rounded-xl border border-zinc-700 overflow-hidden" style={{ background: "radial-gradient(circle at 50% 100%, #1c1c1c 0%, #0a0a0a 50%, #050505 100%)" }}>
          {/* Starburst background */}
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: showWheel ? 1 : 0 }}
          >
            <Starburst />
          </div>

          {/* Floating particles */}
          <FloatingParticles mode={
            mysteryPhase === "reveal" ? "gold" :
            showCongrats && isMysteryBox ? "purple" :
            showCongrats ? "gold" :
            "green"
          } />

          {/* Wheel */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[360px] h-[360px] sm:w-[430px] sm:h-[430px] z-[1] transition-all duration-700 ease-in-out"
            style={{
              top: showWheel ? "12px" : "120px",
              opacity: showWheel ? 1 : 0,
            }}
          >
            <SpinWheel
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

          {/* Congratulations overlay (cash win or mystery reveal) */}
          <div
            className="absolute inset-0 z-[4] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none"
            style={{
              opacity: showCongratsOverlay ? 1 : 0,
              transform: showCongratsOverlay ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className={`relative bg-black/60 backdrop-blur-sm rounded-xl px-8 py-5 flex flex-col items-center overflow-hidden ${isMysteryBox && mysteryPhase !== "reveal" ? "animate-mystery-shake" : ""}`}>
              {/* Animated border */}
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
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2 drop-shadow-lg"
                  />
                  <p
                    className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg animate-gold-shimmer"
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

          {/* Mystery Box "won" overlay — shows before opening */}
          <div
            className="absolute inset-0 z-[2] flex items-center justify-center transition-all duration-700 ease-in-out pointer-events-none"
            style={{
              opacity: isMysteryBox && mysteryPhase === "won" ? 1 : 0,
              transform: isMysteryBox && mysteryPhase === "won" ? "translateY(0)" : "translateY(40px)",
            }}
          >
            <div className="relative bg-black/60 backdrop-blur-sm rounded-xl px-8 py-5 flex flex-col items-center overflow-hidden animate-mystery-shake">
              {/* Animated purple border */}
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
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2 drop-shadow-lg"
              />
              <p
                className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg animate-purple-shimmer"
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
