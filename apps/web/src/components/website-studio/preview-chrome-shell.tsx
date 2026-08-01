"use client";

import { useState } from "react";

const DEVICE_WIDTHS = { desktop: 1440, tablet: 768, mobile: 375 } as const;
const DEVICE_LABELS = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" } as const;
type Device = keyof typeof DEVICE_WIDTHS;

export function PreviewChromeShell({ projectId, slugPath }: { projectId: string; slugPath: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const contentUrl = `/preview/${projectId}${slugPath ? `/${slugPath}` : ""}`;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">FSX Studio · Preview</span>
        <div className="flex gap-1.5">
          {(Object.keys(DEVICE_WIDTHS) as Device[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDevice(option)}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                device === option
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {DEVICE_LABELS[option]}
            </button>
          ))}
        </div>
        <a
          href={contentUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-zinc-500 underline dark:text-zinc-400"
        >
          Open without frame ↗
        </a>
      </header>
      <div className="flex flex-1 justify-center overflow-auto p-6">
        <div
          className="h-fit overflow-hidden rounded-xl border border-zinc-300 bg-white shadow-xl dark:border-zinc-700"
          style={{ width: DEVICE_WIDTHS[device] }}
        >
          <iframe
            src={contentUrl}
            style={{ width: DEVICE_WIDTHS[device], height: "calc(100vh - 6rem)", border: 0, display: "block" }}
            title="Website preview"
          />
        </div>
      </div>
    </div>
  );
}
