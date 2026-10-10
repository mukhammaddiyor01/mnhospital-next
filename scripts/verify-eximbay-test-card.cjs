const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');const root=path.resolve(__dirname,'..');let language='EN',checks=0;
const file=path.join(root,'libs/payments/EximbayTestCard.tsx'),mod=new Module(file,module);assert.equal(ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX).parseDiagnostics.length,0);checks++;mod.paths=Module._nodeModulePaths(root);
const stubs={'@/libs/components/preference/PreferenceProvider':{usePreferences:()=>({language})},'@/libs/components/common/Icon':({name})=>React.createElement('i',{'aria-hidden':true},name),'./EximbayTestCard.module.scss':{__esModule:true,default:new Proxy({},{get:(_,key)=>key})}};
mod.require=id=>Object.hasOwn(stubs,id)?stubs[id]:require(id);mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const render=mode=>renderToStaticMarkup(React.createElement(mod.exports.default,{mode}));
for(const mode of [undefined,'DISABLED','SIMULATED','LIVE','PRODUCTION']){assert.equal(render(mode),'');checks++}
for(language of ['EN','UZ','KR']){const html=render('SANDBOX');for(const value of ['4000000000000002','12/33','123','111']){assert.ok(html.includes(`value="${value}"`));checks++}assert.equal((html.match(/readonly=""/gi)||[]).length,4);checks++;assert.equal((html.match(/<button/g)||[]).length,4);checks++;assert.ok(html.includes('role="status"'));checks++}
const checkout=fs.readFileSync(path.join(root,'pages/booking/[bookingOrderId]/payment.tsx'),'utf8'),payments=fs.readFileSync(path.join(root,'libs/components/workspace/PatientPayments.tsx'),'utf8');assert.ok(checkout.includes('<EximbayTestCard mode={mode}'));checks++;assert.ok(payments.includes('getBookingPaymentOptions.onlineMode'));checks++;
assert.ok(!fs.readFileSync(path.join(root,'libs/payments/eximbay.ts'),'utf8').includes('card_number'));checks++;
console.log(`EXIMBAY_TEST_CARD_VERIFIED ${checks} checks`);
