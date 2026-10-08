const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { buildSchema } = require('graphql');
const root = path.resolve(__dirname, '..');
const schema = buildSchema(fs.readFileSync(process.argv[2] || '/tmp/mn-specialty-schema.graphql', 'utf8'));
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
 compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
let language = 'EN';
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
 if (request === '@/libs/components/preference/PreferenceProvider') return { usePreferences: () => ({ language }) };
 if (request.startsWith('@/')) request = path.join(root, request.slice(2));
 return originalLoad.call(this, request, parent, isMain);
};
const { DoctorSpecialty } = require('../libs/components/doctor/enums/doctor.enum.ts');
const { ServiceType } = require('../libs/components/service/enums/service.enum.ts');
const catalog = require('../libs/components/workspace/catalogEnums.ts');
const { useDoctorSpecialtyLabel } = require('../libs/i18n/useDoctorSpecialtyLabel.ts');
const { useServiceTypeLabel } = require('../libs/i18n/useServiceTypeLabel.ts');
for (const [name, values, workspaceValues] of [
 ['DoctorSpecialty', Object.values(DoctorSpecialty), catalog.DoctorSpecialty],
 ['ServiceType', Object.values(ServiceType), catalog.ServiceType],
]) {
 const apiValues = schema.getType(name).getValues().map(value => value.name).sort();
 assert.deepEqual(values.slice().sort(), apiValues, name + ' frontend/API enum parity');
 assert.deepEqual(workspaceValues.slice().sort(), apiValues, name + ' workspace/API enum parity');
}
assert.equal(Object.values(DoctorSpecialty).length, 13);
assert.equal(Object.values(ServiceType).length, 16);
for (language of ['EN', 'UZ', 'KR']) {
 const specialtyLabel = useDoctorSpecialtyLabel();
 const serviceLabel = useServiceTypeLabel();
 for (const value of Object.values(DoctorSpecialty)) assert.notEqual(specialtyLabel(value), value.replaceAll('_', ' '), language + ': translated specialty ' + value);
 for (const value of Object.values(ServiceType)) assert.notEqual(serviceLabel(value), value.replaceAll('_', ' '), language + ': translated service type ' + value);
}
console.log('PASS: 13 specialties and 16 service types match the API and have EN/UZ/KR labels.');
