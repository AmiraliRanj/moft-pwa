import { readInput, output } from "./_io.mjs";

const input = await readInput();
const command = String(input?.tool_input?.command ?? "");
const blocked = [
  { re: /(^|\s)rm\s+-rf\s+\/(\s|$)/i, reason: "Refusing to recursively delete the filesystem root." },
  { re: /(^|\s)git\s+reset\s+--hard(\s|$)/i, reason: "git reset --hard is destructive and requires explicit user instruction." },
  { re: /(^|\s)git\s+clean\s+-[^\n]*[xX][^\n]*(\s|$)/i, reason: "git clean with ignored-file deletion is blocked." },
  { re: /(^|\s)(cat|type|more|Get-Content)\s+[^\n]*(\.env|id_rsa|credentials|secret)/i, reason: "Reading likely secret files into the transcript is blocked." },
  { re: /(^|\s)vercel\s+--prod(\s|$)/i, reason: "Production deployment requires an explicit user request. Use a preview deployment first." }
];

const match = blocked.find((item) => item.re.test(command));
if (match) {
  output({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: match.reason
    }
  });
} else {
  output({});
}
