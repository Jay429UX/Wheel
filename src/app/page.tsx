import Link from "next/link";

export default function Home() {
  return (
    <div className="noise-bg flex min-h-dvh items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md mx-4 flex flex-col items-center gap-6">
        <h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center"
          style={{
            background: "linear-gradient(90deg, #BC9D44, #FFF3B6, #D4C476, #FFF3B6, #A47713, #FFF3B6, #BC9D44)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Spin &amp; Win
        </h1>
        <p className="text-zinc-400 text-center text-sm">Choose a wheel version to play</p>

        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/v1"
            className="block w-full py-4 text-center font-bold text-white rounded-full hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: "#00AB4C" }}
          >
            Version 1 — Classic Wheel
          </Link>
          <Link
            href="/v2"
            className="block w-full py-4 text-center font-bold text-white rounded-full hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: "#7C3AED" }}
          >
            Version 2 — 3D Cylinder
          </Link>
        </div>
      </div>
    </div>
  );
}
