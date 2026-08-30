import { Switch } from "@/components/ui/switch";

export function GlassToggle({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }) {
  return <Switch className="glass-toggle-input" checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />;
}
