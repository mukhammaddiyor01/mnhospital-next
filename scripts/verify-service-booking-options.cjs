const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
const { getBookingOptions, optionBookingHref } = require('../libs/components/service/bookingOptions.ts');
let checks = 0;
const check = (condition) => { assert.ok(condition); checks++; };
const base = { _id: 'a'.repeat(24), memberId: 'b'.repeat(24), departmentId: 'c'.repeat(24), serviceType: 'PROCEDURE', serviceStatus: 'ACTIVE', serviceTitle: 'Standard consultation', serviceName: 'Consultation', servicePrice: 246000, serviceDuration: '30', memberData: { memberStatus: 'ACTIVE' } };
const alternative = { ...base, _id: 'd'.repeat(24), serviceTitle: 'Consultation and diagnostic examination', servicePrice: 1093000, serviceDuration: '60', packageBaseServiceId: base._id, packageRegularPrice: 1200000, packageItems: [{ serviceId: base._id, title: base.serviceTitle, price: 246000, duration: 30 }, { serviceId: 'f'.repeat(24), title: 'Diagnostic examination', price: 954000, duration: 30 }] };
check(getBookingOptions(base, [base, alternative]).length === 2);
check(getBookingOptions(base, [alternative])[0]._id === base._id);
for (const patch of [{ memberId: 'e'.repeat(24) }, { packageBaseServiceId: 'e'.repeat(24) }, { packageItems: [] }, { serviceStatus: 'INACTIVE' }, { memberData: { memberStatus: 'BLOCK' } }, { memberData: null }, { servicePrice: -1 }, { servicePrice: NaN }, { _id: 'invalid' }]) {
 check(getBookingOptions(base, [{ ...alternative, ...patch }]).length === 1);
}
check(getBookingOptions(base, [{ ...alternative, servicePrice: 0 }]).length === 2);
check(getBookingOptions(base, [{ ...alternative, packageBaseServiceId: undefined }]).length === 1);
check(getBookingOptions(alternative, [base, alternative])[0]._id === base._id);
check(optionBookingHref(alternative) === `/appointment?service=${alternative._id}`);
check(getBookingOptions({ ...base, memberData: null }, [alternative]).length === 0);
check(getBookingOptions({ ...base, serviceStatus: 'INACTIVE' }, [alternative]).length === 0);
const filename = path.join(root, 'libs/components/service/ServiceBookingOptions.tsx');
const component = new Module(filename, module);
component.filename = filename;
component.paths = Module._nodeModulePaths(root);
let language = 'EN';
const stubs = {
 '@/libs/i18n/catalog': require('../libs/i18n/catalog.ts'),
 'next/link': ({ children, ...props }) => React.createElement('a', props, children),
 './ServiceBookingOptions.module.scss': new Proxy({}, { get: (_, name) => name }),
 '../preference/PreferenceProvider': { usePreferences: () => ({ language }) },
};
component.require = (name) => Object.hasOwn(stubs, name) ? stubs[name] : Module.prototype.require.call(component, name);
component._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
const Choice = component.exports.default;
const props = { options: [base, alternative], selected: alternative, baseId: base._id, currency: 'KRW', loading: false, failed: false, onChange: () => {}, onRetry: () => {} };
for (const lang of ['EN', 'KR', 'UZ']) {
 language = lang;
 const html = renderToStaticMarkup(React.createElement(Choice, props));
 check((html.match(/type="radio"/g) || []).length === 2);
 check(html.includes(`href="/appointment?service=${alternative._id}"`));
 check(html.includes('1,093,000 KRW') && html.includes('246,000 KRW'));
 check(html.includes('aria-live="polite"'));
 check((html.match(/checked=""/g) || []).length === 1);
}
const adminPreview = renderToStaticMarkup(React.createElement(Choice, { ...props, preview: true }));
check(!adminPreview.includes('<a'));
check((adminPreview.match(/type="radio"/g) || []).length === 2);
check(adminPreview.includes('1,093,000 KRW'));
const failure = renderToStaticMarkup(React.createElement(Choice, { ...props, failed: true }));
check(failure.includes('role="alert"'));
check(failure.includes(`href="/appointment?service=${alternative._id}"`));
console.log(`SERVICE_BOOKING_OPTIONS_VERIFIED ${checks} checks`);
