"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type WebsiteProject = {
  id: string;
  name: string;
  type: string;
  updatedAt?: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

export default function WebsiteStudioPage() {
  const { data: session } = useSession();
  const apiToken = session?.apiToken;
  const authHeaders = useMemo<Record<string, string>>(() => {
    const headers: Record<string, string> = {};
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }
    return headers;
  }, [apiToken]);

  const [projects, setProjects] = useState<WebsiteProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!apiToken) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, { headers: authHeaders });
      const payload = (await response.json()) as
        | WebsiteProject[]
        | { error?: string; message?: string };
      if (!response.ok || !Array.isArray(payload)) {
        const message =
          !Array.isArray(payload) && payload.message ? payload.message : "Unable to load projects.";
        throw new Error(message);
      }
      setProjects(payload.filter((project) => project.type === "website"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load website projects.");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiToken, authHeaders]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProjects();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchProjects]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Website Studio</h1>
          <p className="mt-1 max-w-xl text-zinc-600 dark:text-zinc-400">
            Pick a template, and we&apos;ll set up a full website for you to customize.
          </p>
        </div>
        <Link
          href="/website-studio/new"
          className="btn-gradient rounded-lg px-5 py-2.5 text-sm font-medium text-white"
        >
          + New Website
        </Link>
      </div>

      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your websites...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You haven&apos;t created a website yet.
          </p>
          <Link
            href="/website-studio/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Create your first website
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <p className="font-medium">{project.name}</p>
              {project.updatedAt ? (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              ) : null}
              <Link
                href={`/website-studio/${project.id}`}
                className="mt-3 inline-block rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
