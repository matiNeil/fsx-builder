type ToolCardProps = {
  href: string;
  title: string;
  description: string;
  gradient: string;
  glyphPath: string;
};

export function ToolCard({ href, title, description, gradient, glyphPath }: ToolCardProps) {
  return (
    <a
      href={href}
      className="group block rounded-2xl bg-gradient-to-br from-indigo-500/40 via-blue-500/20 to-pink-500/30 p-px transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10"
    >
      <div className="h-full overflow-hidden rounded-[15px] bg-white/70 backdrop-blur-md dark:bg-zinc-900/70">
        <div
          className={`flex aspect-[16/10] items-center justify-center bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
        >
          <svg viewBox="0 0 48 48" className="h-14 w-14 text-white/95" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={glyphPath} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
            Open
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}
