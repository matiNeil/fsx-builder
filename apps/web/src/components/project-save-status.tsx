type ProjectSaveStatusProps = {
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  lastSavedAt: string | null;
  shortcutHint?: string;
};

export function ProjectSaveStatus({
  hasUnsavedChanges,
  isAutoSaving,
  lastSavedAt,
  shortcutHint,
}: ProjectSaveStatusProps) {
  const statusLabel = isAutoSaving
    ? "Autosaving…"
    : hasUnsavedChanges
      ? "Unsaved changes"
      : lastSavedAt
        ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}`
        : "Not saved yet";

  return (
    <div className="space-y-1">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Status: {statusLabel}</p>
      {shortcutHint ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Shortcuts: {shortcutHint}</p>
      ) : null}
    </div>
  );
}
