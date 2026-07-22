import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { readInput, output } from "./_io.mjs";

const input = await readInput();
if (input?.stop_hook_active) {
  output({ continue: true });
  process.exit(0);
}

const root = String(input?.cwd ?? process.cwd());
const required = [
  "AGENTS.md",
  "app/layout.tsx",
  "app/page.tsx",
  "app/manifest.ts",
  "public/sw.js",
  "scripts/validate-project.mjs"
];
const missing = required.filter((file) => !existsSync(join(root, file)));
let problems = [];
if (missing.length) problems.push(`Missing required files: ${missing.join(", ")}`);

const pagePath = join(root, "app/page.tsx");
if (existsSync(pagePath)) {
  const page = readFileSync(pagePath, "utf8");
  if (!page.includes("MoftPreview")) problems.push("app/page.tsx no longer renders the main Moft preview component.");
}

const agentsPath = join(root, "AGENTS.md");
if (existsSync(agentsPath)) {
  const agents = readFileSync(agentsPath, "utf8");
  if (!agents.includes("Persian") || !agents.includes("RTL")) problems.push("AGENTS.md lost the Persian RTL requirement.");
}

if (problems.length) {
  output({
    decision: "block",
    reason: `Resolve the Moft repository quality gate before stopping:\n- ${problems.join("\n- ")}`
  });
} else output({ continue: true });
