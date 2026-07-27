"use client";

import { useEffect, useRef, useState } from "react";

function AnimatedNumber({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    let hasAnimated = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) {
          return;
        }
        hasAnimated = true;
        const duration = 1000;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setValue(Math.round(progress * target));
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

type Stat = {
  kind: "number" | "text";
  value: number | string;
  suffix?: string;
  label: string;
  color: string;
  iconPath: string;
};

const STATS: Stat[] = [
  {
    kind: "number",
    value: 10000,
    suffix: "+",
    label: "Projects Created",
    color: "bg-blue-500/15 text-blue-500",
    iconPath: "M4 10 10 4l6 6M6 8v8h8V8",
  },
  {
    kind: "number",
    value: 3,
    label: "Creative Tools",
    color: "bg-purple-500/15 text-purple-500",
    iconPath: "M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z",
  },
  {
    kind: "text",
    value: "<30 sec",
    label: "Average Generation",
    color: "bg-orange-500/15 text-orange-500",
    iconPath: "M10 4v2M10 4a6 6 0 100 12 6 6 0 000-12zM10 8v3l2 2",
  },
  {
    kind: "text",
    value: "24/7",
    label: "AI Powered",
    color: "bg-emerald-500/15 text-emerald-500",
    iconPath: "M11 3 4 12h5l-1 5 7-9h-5l1-5z",
  },
];

export function StatsSection() {
  return (
    <section className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d={stat.iconPath} />
            </svg>
          </span>
          <div>
            <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {stat.kind === "number" ? (
                <>
                  <AnimatedNumber target={stat.value as number} />
                  {stat.suffix ?? ""}
                </>
              ) : (
                stat.value
              )}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
