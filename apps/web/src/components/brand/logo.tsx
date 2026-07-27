import Image from "next/image";

const SIZES = {
  sm: { icon: "h-6", text: "text-lg" },
  md: { icon: "h-7", text: "text-xl" },
  lg: { icon: "h-8", text: "text-2xl" },
} as const;

export function Logo({ size = "sm" }: { size?: keyof typeof SIZES }) {
  const { icon, text } = SIZES[size];
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/fsx-icon.png"
        alt="FSX"
        width={604}
        height={290}
        className={`${icon} w-auto`}
        priority
      />
      <span className={`${text} font-extrabold tracking-tight text-zinc-900 dark:text-white`}>
        Builder
      </span>
    </span>
  );
}
