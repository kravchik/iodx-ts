# IODX for TypeScript

Dependency-free TypeScript implementation of the IODX data format for Node.js, browsers and editor extensions.

## Usage

```ts
import { entity, field, isIodxEntity, parse, stringify } from "iodx";

const spell = parse('Spell(name = "Whisper" power = 42)');
if (isIodxEntity(spell)) {
  console.log(spell.name); // Spell
  console.log(spell.getField("power")); // 42
}

const source = stringify(
  entity("Spell", [field("name", "Whisper"), field("power", 42), field("id", 42n)]),
); // Spell(name = Whisper power = 42 id = 42l)
```

Use `parseAll` and `stringifyAll` for multiple top-level values. `parseCst` returns the lower-level CST, while `tokenize` exposes the token stream. IODX `int64` values are native `bigint`; explicit floating-point types use `IodxFloat32` and `IodxFloat64`. The `(=)` empty-map syntax is represented by a native `Map`.

Entities, fields and comments have `kind` discriminants and corresponding `isIodxEntity`, `isIodxField` and `isIodxComment` type guards. Parse and entity errors expose their source location directly through `error.range`.

The published package is dependency-free ESM targeting ES2022. The same public entry point runs in Node.js, modern browsers and the VS Code desktop extension host; it does not start Java or another process.

## Development

```sh
npm install
npm run check
npm run test:package
```

`npm run test:vscode` launches the pinned VS Code Electron test harness and executes the parser inside a real Extension Host. Set `VSCODE_EXECUTABLE` to test a specific installation or `VSCODE_VERSION` to test another downloaded version.

Parser generation, CongoCC, Java snapshots and the internal Java-to-TypeScript transpiler live in [`iodx-ts-transpiler`](https://github.com/kravchik/iodx-ts-transpiler). This repository requires only Node.js; generated lexer/parser sources are committed under `src/generated`.

## Architecture

- `src/runtime` contains the handwritten CongoCC compatibility layer used by generated code.
- `src/cst` contains the concrete syntax tree, literal handling and target-specific CST actions.
- `src/entity` contains the handwritten entity model, CST resolver and printer.
- `src/generated` contains the generated lexer/parser and must not be edited manually.
- `tests/resources/upstream` and the Java parity oracle are refreshed by `iodx-ts-transpiler`.

Handwritten code owns the public API, CST values/actions and the minimal compatibility runtime. Generated parser behavior is checked against the committed Java parity oracle and shared formatter fixtures.
