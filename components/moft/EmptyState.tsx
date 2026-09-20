import { Icon, type IconName } from "@/components/moft/Icon";

export function EmptyState({
  icon = "search",
  title,
  text,
  action,
  onAction,
}: {
  icon?: IconName;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-surface border border-line shadow-xs space-y-3">
      <span className="w-12 h-12 rounded-2xl bg-canvas text-muted grid place-items-center">
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <div>
        <h2 className="text-sm font-black text-ink">{title}</h2>
        <p className="text-xs text-muted max-w-xs mt-1 leading-relaxed">{text}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-brand-2 text-white hover:opacity-90 shadow-xs transition-opacity mt-1"
        >
          {action}
        </button>
      )}
    </div>
  );
}
