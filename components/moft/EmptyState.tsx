import { Icon, type IconName } from "@/components/moft/Icon";

export function EmptyState({ icon = "search", title, text, action, onAction }: { icon?: IconName; title: string; text: string; action?: string; onAction?: () => void }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon name={icon} /></span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action && <button type="button" onClick={onAction}>{action}</button>}
    </div>
  );
}
