"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { LiquidGlass, type LiquidGlassHandle } from "liquid-glass-web-react";
import { glassPressDelta, resolveGlassPreset, type GlassPresetName, type GlassTheme } from "@/components/glass/glass-presets";

export type GlassOption<T extends string> = {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
};

type GlassSegmentedControlProps<T extends string> = {
  value: T;
  options: readonly GlassOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
  preset?: GlassPresetName;
  role?: "tablist" | "radiogroup" | "group";
};

type LensTarget = { x: number; width: number };

function currentTheme(): GlassTheme {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function GlassSegmentedControl<T extends string>({ value, options, onChange, ariaLabel, className = "", preset = "selection", role = "group" }: GlassSegmentedControlProps<T>) {
  const lensRef = useRef<LiquidGlassHandle>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef({ x: 0.5, velocity: 0, target: 0.5, frame: 0, settled: false });
  const materialRef = useRef({ frame: 0, strength: 0, chromaticAberration: 0 });
  const [lensWidth, setLensWidth] = useState(104);
  const [theme, setTheme] = useState<GlassTheme>("light");
  const [reducedMotion, setReducedMotion] = useState(false);
  const optics = useMemo(() => resolveGlassPreset(preset, theme), [preset, theme]);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));

  const measureTargets = useCallback((): LensTarget[] => {
    const container = lensRef.current?.element;
    const group = groupRef.current;
    if (!container || !group) return [];
    const containerRect = container.getBoundingClientRect();
    if (containerRect.width <= 0) return [];
    return Array.from(group.querySelectorAll<HTMLButtonElement>("button[data-glass-option]")).map((button) => {
      const rect = button.getBoundingClientRect();
      return { x: (rect.left + rect.width / 2 - containerRect.left) / containerRect.width, width: Math.round(rect.width) - 6 };
    });
  }, []);

  const moveTo = useCallback((target: LensTarget, animate: boolean) => {
    const state = animationRef.current;
    state.target = target.x;
    window.cancelAnimationFrame(state.frame);
    setLensWidth((width) => Math.abs(width - target.width) > 1 ? target.width : width);
    if (!animate || reducedMotion) {
      state.x = target.x;
      state.velocity = 0;
      lensRef.current?.setPosition(target.x, 0.5);
      return;
    }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      state.velocity += (175 * (state.target - state.x) - 21 * state.velocity) * dt;
      state.x += state.velocity * dt;
      lensRef.current?.setPosition(state.x, 0.5);
      if (Math.abs(state.target - state.x) > 0.0005 || Math.abs(state.velocity) > 0.001) state.frame = window.requestAnimationFrame(tick);
      else {
        state.x = state.target;
        state.velocity = 0;
        lensRef.current?.setPosition(state.target, 0.5);
      }
    };
    state.frame = window.requestAnimationFrame(tick);
  }, [reducedMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncEnvironment = () => {
      setTheme(currentTheme());
      setReducedMotion(media.matches);
    };
    syncEnvironment();
    media.addEventListener("change", syncEnvironment);
    window.addEventListener("moft-theme-change", syncEnvironment);
    return () => {
      media.removeEventListener("change", syncEnvironment);
      window.removeEventListener("moft-theme-change", syncEnvironment);
    };
  }, []);

  useLayoutEffect(() => {
    const target = measureTargets()[selectedIndex];
    if (!target) return;
    const firstLayout = !animationRef.current.settled;
    animationRef.current.settled = true;
    moveTo(target, !firstLayout);
  }, [measureTargets, moveTo, selectedIndex, options.length]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const observer = new ResizeObserver(() => {
      const target = measureTargets()[selectedIndex];
      if (target) moveTo(target, false);
    });
    observer.observe(group);
    return () => observer.disconnect();
  }, [measureTargets, moveTo, selectedIndex]);

  useEffect(() => () => {
    window.cancelAnimationFrame(animationRef.current.frame);
    window.cancelAnimationFrame(materialRef.current.frame);
  }, []);

  const animateMaterial = (pressed: boolean) => {
    const targetStrength = optics.strength + (pressed ? glassPressDelta.strength : 0);
    const targetChroma = optics.chromaticAberration + (pressed ? glassPressDelta.chromaticAberration : 0);
    const material = materialRef.current;
    if (!material.strength) {
      material.strength = optics.strength;
      material.chromaticAberration = optics.chromaticAberration;
    }
    window.cancelAnimationFrame(material.frame);
    if (reducedMotion) {
      lensRef.current?.engine?.setOptions({ strength: targetStrength, chromaticAberration: targetChroma });
      return;
    }
    const tick = () => {
      material.strength += (targetStrength - material.strength) * 0.22;
      material.chromaticAberration += (targetChroma - material.chromaticAberration) * 0.22;
      lensRef.current?.engine?.setOptions({ strength: material.strength, chromaticAberration: material.chromaticAberration });
      if (Math.abs(targetStrength - material.strength) > 0.0004 || Math.abs(targetChroma - material.chromaticAberration) > 0.004) material.frame = window.requestAnimationFrame(tick);
    };
    material.frame = window.requestAnimationFrame(tick);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button[data-glass-option]")) animateMaterial(true);
  };

  return (
    <LiquidGlass
      ref={lensRef}
      className={`glass-selection ${className}`.trim()}
      x={0.5}
      y={0.5}
      width={lensWidth}
      height={className.includes("bottom-nav") ? 58 : 42}
      radius="auto"
      shadow={theme === "dark" ? "0 0 0 1px rgba(230,255,240,.28), 0 9px 24px rgba(0,0,0,.42)" : "0 0 0 1px rgba(255,255,255,.78), 0 9px 22px rgba(24,89,62,.16)"}
      {...optics}
      onPointerDownCapture={onPointerDown}
      onPointerUpCapture={() => animateMaterial(false)}
      onPointerCancelCapture={() => animateMaterial(false)}
      onPointerLeave={() => animateMaterial(false)}
    >
      <div ref={groupRef} className="glass-selection-options" role={role} aria-label={ariaLabel}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              data-glass-option=""
              type="button"
              className={selected ? "active" : ""}
              aria-label={option.ariaLabel}
              aria-pressed={role === "group" ? selected : undefined}
              role={role === "tablist" ? "tab" : role === "radiogroup" ? "radio" : undefined}
              aria-selected={role === "tablist" ? selected : undefined}
              aria-checked={role === "radiogroup" ? selected : undefined}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </LiquidGlass>
  );
}
