const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const filename = path.join(__dirname, '../libs/i18n/catalog.ts');
const mod = new Module(filename, module);
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,filename);
const {catalogText, catalogSearchText} = mod.exports;
let checks = 0;
function equal(a,b) {assert.equal(a,b);checks++;}
const titles = ['Dentistry','Procedure','Free check up','Neurology','Family Medicine','Skin Screening Test','Gynecology','Plastic Surgery','Urology Consultation','Consultation','Neurosurgery',"Men's Health Issues",'Women Doctor Obestetrics'];
for (const title of titles) {
  equal(catalogText(title, 'EN'),title === 'Free check up' ? 'Checkup' : title);
  for (const lang of ['KR','UZ']) {
    const label = catalogText(title,lang);
    assert.notEqual(label,title);checks++;
    equal(catalogSearchText(label),title);
  }
}
for (const source of ['Good Dentistry','Good Procedure','Take care about your child!','Beauty comes at cost;)',"Women's health is very important for us!",'Talk about your health with Professionals','Good Service','You can get Consultation about your health!','Professional Surgery','Men Health Problems','Women are welcomed ']) {
  const korean = catalogText(source,'KR');
  assert.notEqual(korean,source);checks++;
  assert.match(korean,/[가-힣]/);checks++;
  equal(catalogText(source,'EN'),source);
}
equal(catalogText('  women are welcomed  ','KR'),'여성 환자를 위한 진료 안내');
equal(catalogText('New admin-authored service','KR'),'New admin-authored service');
equal(catalogText('새로운 진료','KR'),'새로운 진료');
equal(catalogText(undefined,'KR'),'');
equal(catalogSearchText('비뇨'),'Urology');
equal(catalogSearchText('신경'),'Neuro');
equal(catalogSearchText('치과'),'Dentistry');
equal(catalogSearchText('Unknown service'),'Unknown service');
equal(catalogSearchText('.*'),' .*'.trim());
const record = { _id:'fixture',serviceTitle:'Dentistry',servicePrice:125000,memberId:'doctor',serviceDesc:'Good Dentistry'};
const before=JSON.stringify(record);catalogText(record.serviceTitle,'KR');catalogText(record.serviceDesc,'UZ');equal(JSON.stringify(record),before);
console.log(`CATALOG_LOCALIZATION_VERIFIED ${checks} checks`);
