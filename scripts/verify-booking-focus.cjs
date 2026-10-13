const assert = require('node:assert/strict'), fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
let route='/appointment';
const exportsObject={};
const file=path.join(__dirname,'../libs/components/layout/LayoutHome.tsx');
const component=tag=>({children,...props})=>React.createElement(tag,props,children);
function requireMock(name) {
 if(name==='react')return React;
 if(name==='react/jsx-runtime')return require(name);
 if(name==='next/router')return {useRouter:()=>({pathname:route})};
 if(name==='next/link')return {__esModule:true,default:component('a')};
 if(name==='next/head')return {__esModule:true,default:()=>null};
 if(name==='next/dynamic')return {__esModule:true,default:()=>()=>null};
 if(name.endsWith('useTranslation'))return {useTranslation:()=>key=>key};
 if(name.endsWith('/ChatLauncher'))return {__esModule:true,default:({inviteEnabled})=>React.createElement('div',{'data-invite':String(inviteEnabled)})};
 if(name.endsWith('/AdvertisementRail')||name.endsWith('/RightAdvertisementRail'))return {__esModule:true,default:()=>React.createElement('aside',{'data-ad':'true'})};
 if(name.endsWith('/Footer'))return {__esModule:true,default:()=>React.createElement('footer',{'data-full-footer':'true'})};
 return {__esModule:true,default:()=>null};
}
new Function('require','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText)(requireMock,exportsObject);
const Screen=exportsObject.default(()=>React.createElement('h1',null,'Booking fixture'));
let checks=0;
for(const pathname of ['/appointment','/booking/[bookingOrderId]/payment','/booking/payment/[paymentId]/[status]']) {
 route=pathname;const html=renderToStaticMarkup(React.createElement(Screen));
 for(const test of [!html.includes('data-ad'),!html.includes('data-full-footer'),html.includes('clinical-focused-workspace'),html.includes('data-invite="false"'),html.includes('href="/visit-guide"'),html.includes('Booking fixture')]){assert.ok(test,pathname);checks++;}
}
for(const pathname of ['/','/service','/doctor','/visit-guide']) {
 route=pathname;const html=renderToStaticMarkup(React.createElement(Screen));
 assert.ok(html.includes('data-full-footer'));checks++;
 assert.ok(!html.includes('clinical-focused-workspace'));checks++;
 if(pathname!=='/'){assert.equal((html.match(/data-ad/g)||[]).length,2);checks++;}
}
console.log(`BOOKING_FOCUS_VERIFIED ${checks} checks`);
