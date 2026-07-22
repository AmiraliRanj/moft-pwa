import { readInput, output } from "./_io.mjs";

const input = await readInput();
const tool = String(input?.tool_name ?? "");
const command = String(input?.tool_input?.command ?? "");
const response = JSON.stringify(input?.tool_response ?? "");
const touchedUi = tool === "apply_patch" && /(app\/|components\/|public\/sw\.js|manifest)/i.test(command);
const checkCommand = /npm\s+run\s+(build|lint|validate|check)/i.test(command);
const failed = checkCommand && /(error|failed|exit code [1-9]|ELIFECYCLE)/i.test(response);

let context = "";
if (failed) context = "A project check appears to have failed. Fix the failure and rerun the same check before reporting completion.";
else if (touchedUi) context = "UI or PWA files changed. Before stopping, verify RTL, 390px mobile layout, keyboard focus, reduced motion, manifest/service-worker paths, and run the required checks.";

if (context) {
  output({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: context
    }
  });
} else output({});
