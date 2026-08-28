import type { LiquidGlassOptions } from "liquid-glass-web-react";

export type GlassPresetName = "navigation" | "selection" | "control";
export type GlassTheme = "light" | "dark";

type GlassPreset = Pick<
  LiquidGlassOptions,
  | "strength"
  | "chromaticAberration"
  | "blur"
  | "depth"
  | "curvature"
  | "splay"
  | "glow"
  | "edgeHighlight"
  | "specular"
  | "specularAngle"
  | "quality"
>;

const lightPresets: Record<GlassPresetName, GlassPreset> = {
  navigation: { strength: 0.028, chromaticAberration: 0.3, blur: 0, depth: 8, curvature: 0.88, splay: 0.92, glow: 0.14, edgeHighlight: 0.38, specular: 0.9, specularAngle: 42, quality: 256 },
  selection: { strength: 0.024, chromaticAberration: 0.24, blur: 0, depth: 7, curvature: 0.84, splay: 0.9, glow: 0.12, edgeHighlight: 0.32, specular: 0.82, specularAngle: 42, quality: 256 },
  control: { strength: 0.02, chromaticAberration: 0.18, blur: 0, depth: 6, curvature: 0.78, splay: 0.88, glow: 0.1, edgeHighlight: 0.3, specular: 0.78, specularAngle: 38, quality: 192 },
};

const darkPresets: Record<GlassPresetName, GlassPreset> = {
  navigation: { strength: 0.035, chromaticAberration: 0.38, blur: 0, depth: 9, curvature: 0.9, splay: 0.94, glow: 0.19, edgeHighlight: 0.48, specular: 1.08, specularAngle: 48, quality: 256 },
  selection: { strength: 0.03, chromaticAberration: 0.32, blur: 0, depth: 8, curvature: 0.87, splay: 0.92, glow: 0.17, edgeHighlight: 0.42, specular: 1, specularAngle: 48, quality: 256 },
  control: { strength: 0.024, chromaticAberration: 0.24, blur: 0, depth: 7, curvature: 0.82, splay: 0.9, glow: 0.15, edgeHighlight: 0.38, specular: 0.94, specularAngle: 44, quality: 192 },
};

export function resolveGlassPreset(name: GlassPresetName, theme: GlassTheme) {
  return theme === "dark" ? darkPresets[name] : lightPresets[name];
}

export const glassPressDelta = {
  strength: 0.015,
  chromaticAberration: 0.22,
};
