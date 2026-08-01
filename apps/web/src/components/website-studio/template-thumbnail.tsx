"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { getWebsiteTemplateDefinition } from "@fsx/templates";
import { WebsiteThemeProvider } from "./theme-provider";
import { SectionRenderer } from "./sections/registry";

const SOURCE_WIDTH = 1280;

export function TemplateThumbnail({ templateId }: { templateId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.24);

  const definition = getWebsiteTemplateDefinition(templateId);
  const heroSection =
    definition?.pages[0]?.sections.find((section) => section.type === "hero") ?? definition?.pages[0]?.sections[0];

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    const update = () => setScale(el.clientWidth / SOURCE_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!definition || !heroSection) {
    return <div className="aspect-[4/3] w-full rounded-lg bg-zinc-100 dark:bg-zinc-900" />;
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800"
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: SOURCE_WIDTH, transform: `scale(${scale})` }}
      >
        <WebsiteThemeProvider presetId={definition.defaultThemeId}>
          <SectionRenderer section={{ ...heroSection, id: `${templateId}-thumb` }} />
        </WebsiteThemeProvider>
      </div>
    </div>
  );
}
