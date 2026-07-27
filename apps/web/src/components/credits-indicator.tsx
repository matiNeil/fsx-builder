type CreditsIndicatorProps = {
  creditsRemaining: number | null;
  requiredForAction?: number;
  actionLabel?: string;
};

export function CreditsIndicator({
  creditsRemaining,
  requiredForAction,
  actionLabel,
}: CreditsIndicatorProps) {
  if (creditsRemaining === null) {
    return <p className="text-xs text-zinc-500 dark:text-zinc-400">Credits: —</p>;
  }

  const insufficient =
    typeof requiredForAction === "number" && creditsRemaining < requiredForAction;

  return (
    <div className="space-y-1">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{creditsRemaining} credits remaining</p>
      {insufficient ? (
        <p className="text-xs text-red-600 dark:text-red-400">
          Not enough credits{actionLabel ? ` to ${actionLabel}` : ""} — need {requiredForAction}, have{" "}
          {creditsRemaining}.
        </p>
      ) : null}
    </div>
  );
}
