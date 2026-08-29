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
  navigation: { strength: 0.004, chromaticAberration: 0.02, blur: 0, depth: 4, curvature: 0.72, splay: 0.82, glow: 0.025, edgeHighlight: 0.14, specular: 0.34, specularAngle: 90, quality: 256 },
  selection: { strength: 0.003, chromaticAberration: 0.015, blur: 0, depth: 3, curvature: 0.68, splay: 0.8, glow: 0.02, edgeHighlight: 0.12, specular: 0.3, specularAngle: 90, quality: 256 },
  control: { strength: 0.003, chromaticAberration: 0.012, blur: 0, depth: 3, curvature: 0.64, splay: 0.78, glow: 0.018, edgeHighlight: 0.11, specular: 0.28, specularAngle: 90, quality: 192 },
};

const darkPresets: Record<GlassPresetName, GlassPreset> = {
  navigation: { strength: 0.005, chromaticAberration: 0.025, blur: 0, depth: 4, curvature: 0.74, splay: 0.84, glow: 0.03, edgeHighlight: 0.16, specular: 0.38, specularAngle: 90, quality: 256 },
  selection: { strength: 0.004, chromaticAberration: 0.02, blur: 0, depth: 4, curvature: 0.7, splay: 0.82, glow: 0.026, edgeHighlight: 0.14, specular: 0.34, specularAngle: 90, quality: 256 },
  control: { strength: 0.003, chromaticAberration: 0.016, blur: 0, depth: 3, curvature: 0.66, splay: 0.8, glow: 0.022, edgeHighlight: 0.13, specular: 0.3, specularAngle: 90, quality: 192 },
};

export function resolveGlassPreset(name: GlassPresetName, theme: GlassTheme) {
  return theme === "dark" ? darkPresets[name] : lightPresets[name];
}

export const glassPressDelta = {
  strength: 0.008,
  chromaticAberration: 0.06,
};
