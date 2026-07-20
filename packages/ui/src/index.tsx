import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${className ?? ""}`}>
      {children}
    </section>
  );
}
