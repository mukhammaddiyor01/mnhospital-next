const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const root = path.resolve(__dirname, '..');
let language = 'EN', response = {}, checks = 0;
function check(value, label) { assert.ok(value,label); checks++; }
function load(file, stubs) {
 const filename = path.join(root,file), mod = new Module(filename,module);
 mod.paths = Module._nodeModulePaths(root);
 mod.require = id => Object.hasOwn(stubs,id) ? stubs[id] : require(id);
 mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
 return mod.exports;
}
const {default: PromoOffers, PromoOfferCard} = load('libs/components/homepage/PromoOffers.tsx',{
 '@apollo/client': {useQuery:()=>response},
 'next/link': ({children,href,...props})=>React.createElement('a',{href,...props},children),
 '@/apollo/promotion/operations': {GET_PUBLIC_PROMO_OFFERS:{}},
 '../preference/PreferenceProvider': {usePreferences:()=>({language})},
 '../common/currency': {formatMoney:(value,currency)=>`${value.toLocaleString('en-US')} ${currency}`},
 '../common/Icon': ({name})=>React.createElement('i',{'aria-hidden':true},name),
 './PromoOffers.module.scss': {__esModule:true,default:new Proxy({},{get:(_,name)=>name})},
});
const offer = {_id:'offer',code:'CARE7000',discountType:'FIXED',discountValue:7000,currency:'KRW',minSubtotal:20000,serviceIds:[],expiresAt:'2099-10-20T10:00:00Z'};
const render = value => renderToStaticMarkup(React.createElement(PromoOfferCard,{offer:value}));
for (language of ['EN','UZ','KR']) {
 const html = render(offer);
 check(html.includes('7,000 KRW'),'Actual fixed amount is shown');
 check(html.includes('CARE7000'),'Published code is selectable text');
 check(html.includes('<details'),'Terms can be expanded');
 check(html.includes('dateTime="2099-10-20T10:00:00Z"'),'Expiry retains exact time');
 check(html.includes('20,000 KRW'),'Actual minimum is preserved');
 check(html.includes('href="/service"'),'Unscoped offer opens catalog');
 check(html.includes('role="status"'),'Copy feedback is announced');
}
language='EN';
check(render({...offer,discountType:'PERCENT',discountValue:12}).includes('12%'),'Percentage offer is not shown as currency');
check(render({...offer,serviceIds:['real-service']}).includes('href="/service/real-service"'),'Scoped offer targets existing service');
response={data:{getPublicPromoOffers:[offer,{...offer,_id:'expired',code:'OLD',expiresAt:'2000-01-01T00:00:00Z'}]}};
let html=renderToStaticMarkup(React.createElement(PromoOffers));
check(html.includes('CARE7000')&&!html.includes('OLD'),'Expired codes disappear');
response={error:new Error('Unavailable'),data:{getPublicPromoOffers:[offer]}};
check(renderToStaticMarkup(React.createElement(PromoOffers))==='','Failed response hides unverified offers');
response={data:{getPublicPromoOffers:[]}};
check(renderToStaticMarkup(React.createElement(PromoOffers))==='','No offer means no placeholder banner');
const home=fs.readFileSync(path.join(root,'libs/components/homepage/ClinicalHome.tsx'),'utf8');
check(!home.includes('Testimonial')&&!home.includes('clinical-rating')&&!home.includes('doctorRole'),'Invented reviews and titles are not rendered');
check(home.includes('className="clinical-light-button" href="/appointment"'),'Booking action navigates to actual flow');
console.log(`HOMEPAGE_REFINEMENT_VERIFIED ${checks} checks`);
