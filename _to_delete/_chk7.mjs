import ts from "typescript"; import fs from "fs";
const files = [
  "components/services/ServicesFooter.tsx",
  "app/page.tsx",
  "app/services/page.tsx",
];
let bad=0;
for (const f of files){
  const out=ts.transpileModule(fs.readFileSync(f,"utf8"),{reportDiagnostics:true,fileName:f,
    compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020,isolatedModules:true}});
  const errs=(out.diagnostics||[]).filter(d=>d.category===1);
  bad+=errs.length;
  console.log((errs.length?"FAIL ":"OK   ")+f);
  errs.forEach(d=>console.log("   ->",ts.flattenDiagnosticMessageText(d.messageText,"\n")));
}
// sanity: CONTACT.follow / copyright / backToTop exist
const c=fs.readFileSync("constants/content.ts","utf8");
console.log("has CONTACT.follow:", /follow:\s*\{/.test(c), "| copyright:", /copyright:/.test(c), "| backToTop:", /backToTop:/.test(c));
console.log(bad?"HAS ERRORS":"ALL CLEAN");
