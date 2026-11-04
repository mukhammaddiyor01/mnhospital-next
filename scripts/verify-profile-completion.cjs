const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

let response = {};
let options;
const source = fs.readFileSync(path.join(__dirname, '../libs/components/mypage/usePatientProfileCompletion.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const moduleExports = {};
vm.runInNewContext(compiled, {
	exports: moduleExports,
	require: (name) => name === '@apollo/client'
		? { useQuery: (_query, receivedOptions) => { options = receivedOptions; return response; } }
		: { GET_MY_PATIENT_PROFILE: {} },
});

const profile = { memberId: 'patient-1', patientBloodType: 'A_POSITIVE', patientGender: 'MALE', patientBirthDate: '2000-01-01', patientIdNumber: '123456' };
assert.equal(moduleExports.isPatientProfileComplete(profile), true);
assert.equal(moduleExports.isPatientProfileComplete({ ...profile, patientIdNumber: '  ' }), false);
assert.equal(moduleExports.isPatientProfileComplete({ ...profile, patientBloodType: '' }), false);

response = { loading: true };
assert.equal(moduleExports.usePatientProfileCompletion('patient-1', true), false);
response = { loading: false, error: new Error('No data is found') };
assert.equal(moduleExports.usePatientProfileCompletion('patient-1', true), true);
response = { loading: false, data: { getMyPatientProfile: { ...profile, patientGender: null } } };
assert.equal(moduleExports.usePatientProfileCompletion('patient-1', true), true);
response = { loading: false, data: { getMyPatientProfile: profile } };
assert.equal(moduleExports.usePatientProfileCompletion('patient-1', true), false);
response = { loading: false, error: new Error('Network unavailable') };
assert.equal(moduleExports.usePatientProfileCompletion('patient-1', true), false);
assert.equal(moduleExports.usePatientProfileCompletion('patient-1', false), false);
assert.equal(options.skip, true);
assert.equal(moduleExports.usePatientProfileCompletion('', true), false);
assert.equal(options.skip, true);
console.log('PROFILE_COMPLETION_VERIFIED 11 checks');
