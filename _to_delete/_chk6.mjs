import ts from "typescript"; import fs from "fs";
const f="animations/scenes/gate.ts";
const out=ts.transpileModule(fs.readFileSync(f,"utf8"),{reportDiagnostics:true,fileName:f,
  compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020,isolatedModules:true}});
const errs=(out.diagnostics||[]).filter(d=>d.category===1);
console.log(errs.length?"FAIL":"OK "+f);
errs.forEach(d=>console.log("  ",ts.flattenDiagnosticMessageText(d.messageText,"\n")));
