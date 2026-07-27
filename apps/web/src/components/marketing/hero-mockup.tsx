"use client";

import { useEffect, useRef, useState } from "react";

const PROMPTS = [
  "A modern portfolio website",
  "Summer sale campaign poster",
  "Vibrant product hero image",
];

type Phase = "typing" | "generating" | "done";

const RAIL_ICONS: { label: string; path: string }[] = [
  { label: "Home", path: "M4 10.5 10 5l6 5.5M6 9v6h8V9" },
  { label: "Sections", path: "M4 5h5v5H4zM11 5h5v5h-5zM4 12h5v3H4zM11 12h5v3h-5z" },
  { label: "Pages", path: "M5 4h10v3H5zM5 9h10v3H5zM5 14h6v2H5z" },
  { label: "Design", path: "M5 15 14 6l1 1-9 9H5v-1z" },
  { label: "Settings", path: "M10 7a3 3 0 100 6 3 3 0 000-6zM10 3v2M10 15v2M4 10H2M18 10h-2" },
];

export function HeroMockup() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [progress, setProgress] = useState(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotionRef.current) {
      setCharCount(PROMPTS[0].length);
      setPhase("done");
      setProgress(100);
    }
  }, []);

  useEffect(() => {
    if (reducedMotionRef.current) {
      return;
    }
    const prompt = PROMPTS[promptIndex];

    if (phase === "typing") {
      if (charCount < prompt.length) {
        const timer = window.setTimeout(() => setCharCount((count) => count + 1), 45);
        return () => window.clearTimeout(timer);
      }
      const timer = window.setTimeout(() => {
        setProgress(0);
        setPhase("generating");
      }, 400);
      return () => window.clearTimeout(timer);
    }

    if (phase === "generating") {
      const start = performance.now();
      const duration = 1400;
      let frame: number;
      const step = (now: number) => {
        const elapsed = Math.min((now - start) / duration, 1);
        setProgress(Math.round(elapsed * 100));
        if (elapsed < 1) {
          frame = requestAnimationFrame(step);
        } else {
          setPhase("done");
        }
      };
      frame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setTimeout(() => {
      setPhase("typing");
      setCharCount(0);
      setPromptIndex((index) => (index + 1) % PROMPTS.length);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [phase, charCount, promptIndex]);

  const prompt = PROMPTS[promptIndex];
  const typedText = prompt.slice(0, charCount);

  return (
    <div className="animate-float flex overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-blue-500/20">
      <div className="hidden flex-col items-center gap-4 border-r border-white/10 bg-white/5 px-3 py-5 sm:flex">
        <span className="flex h-6 w-6 rotate-45 items-center justify-center rounded-md bg-gradient-to-br from-indigo-400 to-blue-400 text-[9px] font-bold text-white">
          <span className="-rotate-45">F</span>
        </span>
        {RAIL_ICONS.map((icon) => (
          <span
            key={icon.label}
            title={icon.label}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d={icon.path} />
            </svg>
          </span>
        ))}
      </div>

      <div className="flex-1 space-y-4 p-5">
        <div className="flex items-center gap-1.5 text-white/50">
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-2 text-[11px]">fsxbuilder.com</span>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white">
          {typedText}
          <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-white/80 align-middle" />
        </div>

        {phase === "generating" ? (
          <div className="space-y-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 p-3">
            <p className="text-xs font-medium text-indigo-200">
              AI is generating your website… {progress}%
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-blue-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="animate-fade-in overflow-hidden rounded-lg border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/50">
              <span>Home</span>
              <span>About</span>
              <span>Services</span>
              <span>Contact</span>
            </div>
            <div className="space-y-2 bg-gradient-to-br from-indigo-500/40 to-blue-500/30 p-4">
              <p className="text-sm font-semibold text-white">Build your brand online.</p>
              <p className="text-[11px] text-white/70">A modern website for your business, ready in minutes.</p>
              <span className="inline-block rounded-md bg-white px-2.5 py-1 text-[10px] font-medium text-indigo-700">
                Get Started
              </span>
            </div>
          </div>
        ) : (
          <div className="h-24 rounded-lg border border-white/10 bg-white/5 opacity-40" />
        )}
      </div>
    </div>
  );
}
