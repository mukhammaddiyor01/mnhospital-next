// Exercise public directory state transitions against the real page component.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const root = path.resolve(__dirname, '..');
let states = [], index, effects, inquiry, loading = false, data, previousData;
const doctors = Array.from({length:12}, (_,i)=>({_id:String(i),docFullName:`Doctor ${i}`}));
const result = {getDoctors:{list:doctors,metaCounter:[{total:16}]}};
data = result;
const router = {isReady:true,query:{search:'Khan'}};
let effectKey;
const react = {...React,
  useState(initial) {const n=index++;if(!(n in states)) states[n]=initial;return [states[n],value=>{states[n]=typeof value==='function'?value(states[n]):value}];},
  useEffect(callback,deps) {const key=JSON.stringify(deps);if(key!==effectKey){effects.push(callback);effectKey=key;}},
};
const source = ts.transpileModule(fs.readFileSync(path.join(root,'pages/doctor/index.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const exportsObject = {};
function mockRequire(name) {
  if(name==='react') return react;
  if(name==='react/jsx-runtime') return require(name);
  if(name==='next/router') return {useRouter:()=>router};
  if(name==='@apollo/client') return {useQuery:(_,options)=>{inquiry=options.variables.input;return {data,previousData,loading};}};
  if(name.endsWith('/LayoutHome')) return {__esModule:true,default:page=>page};
  if(name.endsWith('/doctor.enum')) return {DoctorSort:{POINTS:'POINTS'},DoctorSpecialty:{CARDIOLOGY:'CARDIOLOGY'}};
  if(name.endsWith('/useTranslation')) return {useTranslation:()=>key=>key};
  if(name.endsWith('/useWorkspaceText')) return {useWorkspaceText:()=>key=>key};
  if(name.endsWith('/useDoctorSpecialtyLabel')) return {useDoctorSpecialtyLabel:()=>key=>key};
  if(name.endsWith('/query')) return {GET_DOCTORS:{}};
  if(name.endsWith('.scss')) return {__esModule:true,default:{grid:'grid'}};
  return {__esModule:true,default:()=>null};
}
new Function('require','exports',source)(mockRequire,exportsObject);
function render() {index=0;effects=[];const tree=exportsObject.default({initialCatalog:null,initialInquiryKey:'',initialSearch:'Khan'});effects.forEach(run=>run());return tree;}
function nodes(tree,predicate) {if(!tree || typeof tree!=='object')return [];const children=React.Children.toArray(tree.props?.children);return [...(predicate(tree)?[tree]:[]),...children.flatMap(child=>nodes(child,predicate))];}
let tree=render();tree=render();
assert.equal(inquiry.search.text,'Khan');assert.equal(inquiry.page,1);
const button = key => nodes(tree,node=>node.type==='button' && node.props.children===key)[0];
button('directory.next').props.onClick();tree=render();assert.equal(inquiry.page,2);
previousData=result;data=undefined;loading=true;tree=render();
assert.equal(nodes(tree,node=>Boolean(node.props?.doctor)).length,12,'Keep results while the next page loads');
assert.equal(button('directory.next').props.disabled,true);
assert.equal(button('directory.previous').props.disabled,true);
loading=false;data={getDoctors:{list:doctors.slice(0,4),metaCounter:[{total:16}]}};tree=render();
assert.equal(nodes(tree,node=>Boolean(node.props?.doctor)).length,4);
assert.equal(button('directory.next').props.disabled,true,'Last page must not request a nonexistent page');
nodes(tree,node=>node.type==='select')[0].props.onChange({target:{value:'CARDIOLOGY'}});tree=render();
assert.equal(inquiry.page,1);assert.equal(inquiry.docSpecialty,'CARDIOLOGY');
nodes(tree,node=>node.type==='input')[0].props.onChange({target:{value:'  Mark  '}});tree=render();
assert.equal(inquiry.search.text,'Khan','Typing must not trigger every intermediate search');
nodes(tree,node=>node.type==='form')[0].props.onSubmit({preventDefault(){}});tree=render();
assert.equal(inquiry.search.text,'Mark');assert.equal(inquiry.page,1);
assert.equal(nodes(tree,node=>node.type==='select').length,1,'Do not present an unimplemented availability filter');
console.log('DOCTOR_DIRECTORY_VERIFIED 13 checks');
