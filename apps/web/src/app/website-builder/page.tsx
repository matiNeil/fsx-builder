"use client";

import { useMemo, useState } from "react";
import {
  getTemplatesByType,
  getWebsiteTemplateCategory,
  listWebsiteTemplateCategories,
  searchWebsiteTemplates,
  type WebsiteTemplateCategory,
} from "@/lib/templates";
export default function WebsiteBuilderPage() {
  const websiteTemplates = getTemplatesByType("website");
  const categories = useMemo(
    () => ["All", ...listWebsiteTemplateCategories()] as Array<"All" | WebsiteTemplateCategory>,
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"All" | WebsiteTemplateCategory>(
    "All"
  );

  const filteredTemplates = useMemo(
    () => searchWebsiteTemplates(websiteTemplates, searchQuery, selectedCategory),
    [websiteTemplates, searchQuery, selectedCategory]
  );
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-semibold">Website Builder</h1>
      <p className="max-w-3xl text-zinc-600 dark:text-zinc-400">
        Choose from a large template library and start building faster.
      </p>
      <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="block text-sm font-medium" htmlFor="template-search">
          Search templates
        </label>
        <input
          id="template-search"
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name, use case, or size (e.g. ecommerce, blog, 1440x2200)"
          className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing {filteredTemplates.length} of {websiteTemplates.length} templates
      </p>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-lg font-medium">{template.name}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {template.description}
            </p>
            <p className="mt-3 inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {getWebsiteTemplateCategory(template)}
            </p>
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {template.width} × {template.height}
            </p>
          </article>
        ))}
      </section>
      {filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No templates match your search. Try a different keyword or category.
        </div>
      ) : null}
    </main>
  );
}
