import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { delimiter, resolve } from "node:path";

import { projectRoot } from "./project.mjs";

const target = resolve(projectRoot, "target/package-smoke");
const consumer = resolve(target, "consumer");
const npmEnvironment = {
  ...process.env,
  npm_config_cache: resolve(target, "npm-cache"),
};
await rm(target, { recursive: true, force: true });
await mkdir(consumer, { recursive: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const packed = JSON.parse(
  execFileSync(npm, ["pack", "--ignore-scripts", "--json", "--pack-destination", target], {
    cwd: projectRoot,
    encoding: "utf8",
    env: npmEnvironment,
  }),
)[0];
const paths = packed.files.map((file) => file.path);
assert.ok(paths.includes("dist/index.js"));
assert.ok(paths.includes("dist/index.d.ts"));
assert.ok(
  paths.every(
    (path) => path.startsWith("dist/") || ["LICENSE", "README.md", "package.json"].includes(path),
  ),
);

for (const path of paths.filter((path) => path.endsWith(".js"))) {
  const source = await readFile(resolve(projectRoot, path), "utf8");
  assert.doesNotMatch(
    source,
    /(?:from|import\s*)\s*[(']["'](?:node:|fs(?:\/|["'])|path["']|child_process["'])/u,
  );
}

await writeFile(resolve(consumer, "package.json"), '{"private":true,"type":"module"}\n');
const tarball = resolve(target, packed.filename);
execFileSync(
  npm,
  ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--offline", tarball],
  { cwd: consumer, stdio: "inherit", env: npmEnvironment },
);
await writeFile(
  resolve(consumer, "smoke.mjs"),
  `
globalThis.process = undefined;
globalThis.Buffer = undefined;
const { IodxEntity, parse, parseCst, stringify, tokenize } = await import("iodx");
const source = 'Spell(name = "Whisper" power = 42)';
const document = parseCst(source);
if (document.children[0]?.childByField.get("name")?.value !== "Spell") throw new Error("parse failed");
if (tokenize(source).at(-1)?.type !== "EOF") throw new Error("tokenize failed");
const entity = parse(source);
if (!(entity instanceof IodxEntity) || entity.getField("power") !== 42) throw new Error("semantic parse failed");
if (stringify(entity) !== "Spell(name = Whisper power = 42)") throw new Error("stringify failed");
`,
);
await writeFile(
  resolve(consumer, "smoke.ts"),
  `
import { entity, field, isIodxEntity, parse, stringify, type IodxWritable } from "iodx";

const writable: IodxWritable = entity("Spell", [field("id", 42n)]);
const parsed = parse(stringify(writable));
if (isIodxEntity(parsed)) parsed.getField("id");

// @ts-expect-error Date is not an IODX-writable value.
stringify(new Date());
`,
);
execFileSync(process.execPath, [resolve(consumer, "smoke.mjs")], {
  cwd: consumer,
  stdio: "inherit",
  env: { PATH: process.env.PATH?.split(delimiter).join(delimiter) ?? "" },
});
execFileSync(
  process.execPath,
  [
    resolve(projectRoot, "node_modules/typescript/bin/tsc"),
    "--ignoreConfig",
    "--noEmit",
    "--strict",
    "--target",
    "ES2022",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--skipLibCheck",
    resolve(consumer, "smoke.ts"),
  ],
  { cwd: consumer, stdio: "inherit" },
);

console.log(`Package smoke passed for ${packed.filename} (${paths.length} files).`);
