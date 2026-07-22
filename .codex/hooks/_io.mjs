export async function readInput() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  if (!raw.trim()) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

export function output(value) {
  process.stdout.write(JSON.stringify(value));
}
