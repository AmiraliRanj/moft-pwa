import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const required = [
  "AGENTS.md",
  "PROJECT_BRIEF.md",
  "app/layout.tsx",
  "app/page.tsx",
  "app/manifest.ts",
  "app/offline/page.tsx",
  "components/MoftPreview.tsx",
  "components/ServiceWorkerRegister.tsx",
  "public/sw.js",
  "public/icons/dibz-ios-default-192-v2.png",
  "public/icons/dibz-ios-default-512-v2.png",
  ".codex/hooks.json",
  ".agents/skills/moft-product-builder/SKILL.md"
];

const errors = [];
for (const file of required) if (!existsSync(join(root, file))) errors.push(`Missing: ${file}`);

const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
for (const script of ["dev", "build", "lint", "validate"]) if (!packageJson.scripts?.[script]) errors.push(`Missing package script: ${script}`);

const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
if (!layout.includes('lang="fa"') || !layout.includes('dir="rtl"')) errors.push("Root layout must remain Persian RTL.");

const manifest = readFileSync(join(root, "app/manifest.ts"), "utf8");
if (!manifest.includes('display: "standalone"')) errors.push("PWA manifest must use standalone display.");

const hooks = JSON.parse(readFileSync(join(root, ".codex/hooks.json"), "utf8"));
if (!hooks.hooks?.PreToolUse || !hooks.hooks?.Stop) errors.push("Codex safety/quality hooks are incomplete.");

if (errors.length) {
  console.error("Moft validation failed:\n" + errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`Dibz validation passed (${required.length} required files checked).`);
