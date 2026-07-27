"use client";

import { useEffect, useRef } from "react";

const PARTICLES = [
  { top: "12%", left: "8%", size: 6, delay: "0s" },
  { top: "22%", left: "82%", size: 8, delay: "0.6s" },
  { top: "48%", left: "18%", size: 5, delay: "1.2s" },
  { top: "64%", left: "70%", size: 7, delay: "0.3s" },
  { top: "78%", left: "35%", size: 4, delay: "1.8s" },
  { top: "35%", left: "55%", size: 6, delay: "2.2s" },
  { top: "8%", left: "45%", size: 5, delay: "1.5s" },
  { top: "88%", left: "88%", size: 6, delay: "0.9s" },
];

export function BackgroundFx() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = parallaxRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const onMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      node.style.setProperty("--mx", `${x * 12}px`);
      node.style.setProperty("--my", `${y * 12}px`);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-60 dark:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 25% 15%, rgba(99,102,241,0.16), transparent 60%), radial-gradient(ellipse 55% 45% at 85% 25%, rgba(59,130,246,0.14), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 text-zinc-300/50 opacity-40 dark:text-zinc-700/60 dark:opacity-30"
        style={{
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent 75%)",
        }}
      >
        <div className="bg-grid-texture h-full w-full" />
      </div>
      <div
        ref={parallaxRef}
        className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-blue-500/30 blur-3xl animate-glow-pulse dark:bg-blue-500/25"
        style={{ transform: "translate(var(--mx, 0px), var(--my, 0px))" }}
      />
      <div className="absolute -left-16 top-1/3 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl animate-glow-pulse" />
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="absolute animate-twinkle rounded-full bg-blue-400/70 dark:bg-blue-300/70"
          style={{
            top: particle.top,
            left: particle.left,
            width: particle.size,
            height: particle.size,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
