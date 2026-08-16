import ts from "typescript";
import fs from "fs";
let bad=0;
for (const f of ["sections/Hero.tsx","animations/scenes/hero.ts"]) {
  const src = fs.readFileSync(f,"utf8");
  const out = ts.transpileModule(src, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, isolatedModules: true }
  });
  const errs = (out.diagnostics||[]).filter(d=>d.category===1);
  bad+=errs.length;
  console.log(f, "->", errs.length ? "SYNTAX ERRORS:" : "OK (transpile clean)");
  errs.forEach(d=>console.log("  ", ts.flattenDiagnosticMessageText(d.messageText,"\n")));
}
process.exit(bad?1:0);
