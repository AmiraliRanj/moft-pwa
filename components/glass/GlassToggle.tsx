"use client";

import { useEffect, useRef } from "react";
import { LiquidGlass, type LiquidGlassHandle } from "liquid-glass-web-react";
import { Switch } from "@/components/ui/switch";
import { resolveGlassPreset } from "@/components/glass/glass-presets";

export function GlassToggle({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (checked: boolean) => void; label: string }) {
  const lensRef = useRef<LiquidGlassHandle>(null);
  const animationRef = useRef({ x: checked ? 0.72 : 0.28, velocity: 0, frame: 0 });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = checked ? 0.72 : 0.28;
    const state = animationRef.current;
    window.cancelAnimationFrame(state.frame);
    if (reduced) {
      state.x = target;
      lensRef.current?.setPosition(target, 0.5);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      state.velocity += (190 * (target - state.x) - 22 * state.velocity) * dt;
      state.x += state.velocity * dt;
      lensRef.current?.setPosition(state.x, 0.5);
      if (Math.abs(target - state.x) > 0.0005 || Math.abs(state.velocity) > 0.001) state.frame = window.requestAnimationFrame(tick);
      else lensRef.current?.setPosition(target, 0.5);
    };
    state.frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(state.frame);
  }, [checked]);

  const theme = typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  return (
    <LiquidGlass ref={lensRef} className="glass-toggle" x={checked ? 0.72 : 0.28} y={0.5} width={28} height={28} radius="auto" shadow={false} {...resolveGlassPreset("control", theme)}>
      <Switch className="glass-toggle-input" checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </LiquidGlass>
  );
}
