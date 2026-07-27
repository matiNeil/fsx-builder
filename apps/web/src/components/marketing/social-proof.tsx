const AVATAR_INITIALS = ["JD", "SK", "MT", "AR"];
const AVATAR_COLORS = [
  "from-indigo-400 to-blue-400",
  "from-pink-400 to-rose-400",
  "from-emerald-400 to-teal-400",
  "from-amber-400 to-orange-400",
];

export function SocialProof() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {AVATAR_INITIALS.map((initials, index) => (
          <span
            key={initials}
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-[10px] font-semibold text-white dark:border-zinc-950 ${AVATAR_COLORS[index]}`}
          >
            {initials}
          </span>
        ))}
      </div>
      <div>
        <div className="flex text-amber-400" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index}>★</span>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loved by 10,000+ creators</p>
      </div>
    </div>
  );
}
