"use client";
import dynamic from "next/dynamic";

const ImageCreatorEditor = dynamic(
  () => import("./_components/image-creator-editor").then((module) => module.ImageCreatorEditor),
  {
    ssr: false,
    loading: () => (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-8 sm:px-10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading Image Creator…</p>
      </main>
    ),
  }
);

export default function ImageCreatorPage() {
  return <ImageCreatorEditor />;
}
