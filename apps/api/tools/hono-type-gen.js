//@ts-check

import path from "path";
import url from "url";
import fs from "fs";
import ts from "typescript";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, "..");

const entryApp = path.join(baseDir, "src", "app.ts");
const typeName = "Client";

const honoDir = path.join(baseDir, ".hono");
const hc = path.join(baseDir, "#hc.ts");

/** @type import("typescript").CompilerOptions */
const options = {
  strict: true,
  declaration: true,
  emitDeclarationOnly: true,
  allowImportingTsExtensions: true,
  outDir: honoDir,
};

const host = ts.createWatchCompilerHost(
  [hc],
  options,
  ts.sys,
  function () {
    const program = ts.createEmitAndSemanticDiagnosticsBuilderProgram.apply(
      ts,
      arguments
    );
    const originalEmit = program.emit;
    program.emit = () => originalEmit(program.getSourceFile(hc));

    return program;
  },
  // suppress non-related errors
  function reportDiagnostic(diagnostic) {}
  // function reportWatchStatus(diagnostic) {
  // }
);

host.readFile = (/** @type {string} */ fileName) => {
  return fileName === hc
    ? `
import app from "${entryApp}";
import { hc } from "hono/client";

const client = hc<typeof app>('');
export type ${typeName} = typeof client;
`
    : fs.readFileSync(fileName, "utf-8");
};

ts.createWatchProgram(host);
