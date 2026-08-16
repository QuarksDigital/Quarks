import ts from "typescript";
import fs from "fs";
const files = [
  "animations/interactions/reveal.ts",
  "animations/scenes/hero.ts",
  "animations/scenes/gate.ts",
  "components/services/ServiceCards.tsx",
];
let bad=0;
for (const f of files) {
  const src = fs.readFileSync(f,"utf8");
  const out = ts.transpileModule(src, {
    reportDiagnostics: true, fileName: f,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, isolatedModules: true }
  });
  const errs = (out.diagnostics||[]).filter(d=>d.category===1);
  bad+=errs.length;
  console.log((errs.length?"FAIL ":"OK   ")+f);
  errs.forEach(d=>console.log("   ->", ts.flattenDiagnosticMessageText(d.messageText,"\n")));
}
console.log(bad?"\nHAS ERRORS":"\nALL CLEAN");
