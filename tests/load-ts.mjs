import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import ts from "typescript";

const nodeRequire = createRequire(import.meta.url);
const modules = new Map();

// Execute the existing TypeScript mock services without adding a test framework.
export function loadTs(relativePath) {
  const filename = resolve(relativePath);
  if (modules.has(filename)) return modules.get(filename).exports;
  const testModule = { exports: {} };
  modules.set(filename, testModule);
  const source = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const require = (name) => name.startsWith("@/") ? loadTs(`${name.slice(2)}.ts`) : nodeRequire(name);
  runInThisContext(`(function(require, module, exports) { ${source}\n})`, { filename })(require, testModule, testModule.exports);
  return testModule.exports;
}
