const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const ts = require('typescript'), React = require('react');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'pages/appointment/index.tsx');
const draft = { serviceId: 'a'.repeat(24), doctorId: 'b'.repeat(24), date: '2026-10-12', startsAt: '2026-10-12T02:30:00.000Z', patientNote: '' };
const service = { _id: draft.serviceId, memberId: draft.doctorId, serviceTitle: 'Test consultation', servicePrice: 45000 };
let calls, navigations, messages, stateIndex, action, user;
function compile(file, requireFn) {
 const mod = new Module(file, module); mod.paths = Module._nodeModulePaths(root);
 if (requireFn) mod.require = requireFn;
 mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText, file);
 return mod.exports;
}
function component() {
 stateIndex = 0;
 const stubs = {
  'react': {...React, useEffect:()=>{}, useState:initial=>{const i=stateIndex++;return [i===0?draft:initial,value=>{if(i===1)messages.push(value)}]}, useRef:initial=>({current:initial})},
  'next/router': {useRouter:()=>({isReady:true,query:{},push:async url=>navigations.push(url)})},
  '@apollo/client': {useReactiveVar:()=>user,useMutation:()=>[async options=>{calls.push(options);return action(options)},{loading:false}],useQuery:(_,options)=>options.variables?.serviceId?{loading:false}:options.variables?.input?.date?{data:{getAvailableDoctorSlots:[{startsAt:draft.startsAt}]},loading:false}:{data:{getServices:{list:[service],metaCounter:[{total:1}]}},loading:false}},
  'next/link': ({children})=>children,
  '@/libs/components/layout/LayoutHome': value=>value,
  '@/libs/components/common/Icon': ()=>null,
  '@/libs/components/booking/BookingDatePicker': ()=>null,
  '@/libs/components/member/enums/member.enum': {MemberType:{PATIENT:'PATIENT'}},
  '@/libs/i18n/catalog': compile(path.join(root,'libs/i18n/catalog.ts')),
  '@/libs/i18n/useTranslation': {useTranslation:()=>key=>key},
  '@/libs/components/workspace/useWorkspaceText': {useWorkspaceText:()=>key=>key},
  '@/libs/components/preference/PreferenceProvider': {usePreferences:()=>({language:'EN'})},
  '@/libs/payments/useClinicSettings': {useClinicSettings:()=>({currency:'KRW',timeZone:'Asia/Seoul'})},
  '@/libs/payments/clinic': {clinicDateTime:()=>''},
  '@/libs/components/common/currency': {formatMoney:()=>'45,000 KRW'},
  '@/libs/components/service/service-price': {servicePriceForDisplay:()=>45000},
 };
 return compile(filename,name=>Object.hasOwn(stubs,name)?stubs[name]:name==='@/libs/components/booking/request-key'?compile(path.join(root,'libs/components/booking/request-key.ts')):name.startsWith('@/')?{}:require(name)).default();
}
function find(node,type) {if(!node||typeof node!=='object')return;if(node.type===type)return node;for(const child of React.Children.toArray(node.props?.children)){const found=find(child,type);if(found)return found}}
function setup(crypto,userValue={_id:'c'.repeat(24),memberType:'PATIENT'}) {
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:crypto});
 calls=[];navigations=[];messages=[];user=userValue;
 action=async()=>({data:{createAppointmentBooking:{_id:'order-fixture'}}});
 global.sessionStorage={setItem:()=>{},removeItem:()=>{}};
 return find(component(),'form').props.onSubmit;
}
const event={preventDefault(){}};
(async()=>{
 let submit=setup({getRandomValues:array=>webcrypto.getRandomValues(array)});
 await submit(event);
 assert.equal(calls.length,1,'HTTP browser without randomUUID reaches the API');
 assert.match(calls[0].variables.input.idempotencyKey,/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/);
 assert.equal(calls[0].context.expectedAccount,'PATIENT:'+user._id);
 assert.deepEqual(navigations,['/booking/order-fixture/payment']);
 submit=setup({getRandomValues:array=>webcrypto.getRandomValues(array)});
 action=async()=>{throw new Error('Temporary API failure')};await submit(event);
 assert.ok(messages.includes('Temporary API failure'));
 action=async()=>({data:{createAppointmentBooking:{_id:'retry-order'}}});await submit(event);
 assert.equal(calls.length,2,'API rejection unlocks retry');
 assert.equal(calls[0].variables.input.idempotencyKey,calls[1].variables.input.idempotencyKey,'Retry preserves key');
 submit=setup({getRandomValues:()=>{throw new Error('Random source failed')}});await submit(event);
 assert.ok(messages.includes('Random source failed'));
 global.crypto.getRandomValues=array=>webcrypto.getRandomValues(array);await submit(event);
 assert.equal(calls.length,1,'Key failure unlocks submit');
 submit=setup({randomUUID:()=> '12345678-1234-4234-8234-123456789abc'});await submit(event);
 assert.equal(calls[0].variables.input.idempotencyKey,'12345678-1234-4234-8234-123456789abc');
 let finish;submit=setup({getRandomValues:array=>webcrypto.getRandomValues(array)});
 action=()=>new Promise(resolve=>{finish=resolve});const pending=submit(event);await submit(event);
 assert.equal(calls.length,1,'Double click sends only one booking request');finish({data:{createAppointmentBooking:{_id:'one-order'}}});await pending;
 submit=setup({}, {_id:''});await submit(event);assert.equal(calls.length,0);assert.ok(navigations[0].startsWith('/account/signin?redirect='));
 submit=setup({}, {_id:'d'.repeat(24),memberType:'DOCTOR'});await submit(event);assert.equal(calls.length,0);assert.ok(messages.includes('patientBookingOnly'));
 console.log('BOOKING_SUBMIT_VERIFIED 15 checks');
})().catch(error=>{console.error(error);process.exitCode=1});
