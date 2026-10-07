import { access } from "node:fs/promises";
import { resolve } from "node:path";

import { runTests } from "@vscode/test-electron";

import { projectRoot } from "./project.mjs";

const extensionDevelopmentPath = resolve(projectRoot, "tests/fixtures/vscode-extension");
const extensionTestsPath = resolve(extensionDevelopmentPath, "test-runner.cjs");
const options = {
  extensionDevelopmentPath,
  extensionTestsPath,
  launchArgs: ["--disable-extensions", "--disable-workspace-trust"],
  version: process.env.VSCODE_VERSION ?? "1.140.0",
};

const configuredExecutable = process.env.VSCODE_EXECUTABLE;
const macExecutable = "/Applications/Visual Studio Code.app/Contents/MacOS/Electron";
if (configuredExecutable !== undefined) {
  options.vscodeExecutablePath = configuredExecutable;
} else if (process.platform === "darwin" && process.env.VSCODE_USE_LOCAL === "1") {
  await access(macExecutable);
  options.vscodeExecutablePath = macExecutable;
}

await runTests(options);
console.log("VS Code Extension Host smoke passed.");
