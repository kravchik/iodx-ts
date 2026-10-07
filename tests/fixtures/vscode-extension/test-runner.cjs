const assert = require("node:assert/strict");
const vscode = require("vscode");

async function run() {
  const extension = vscode.extensions.getExtension("iodx.iodx-parser-extension-host-smoke");
  assert.ok(extension, "Smoke extension was not loaded");
  const api = await extension.activate();

  const valid = await vscode.workspace.openTextDocument({
    language: "iodx",
    content: "Spell(power = 42)",
  });
  assert.deepEqual(api.inspect(valid), {
    status: "ok",
    rootType: "LIST_BODY",
    firstValue: null,
  });

  const invalid = await vscode.workspace.openTextDocument({
    language: "iodx",
    content: "Spell(power = 42",
  });
  assert.deepEqual(api.inspect(invalid), {
    status: "error",
    beginOffset: 16,
    endOffset: 16,
  });
}

module.exports = { run };
