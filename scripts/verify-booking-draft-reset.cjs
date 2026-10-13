const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const ts = require('typescript'), React = require('react');
const root = path.resolve(__dirname, '..');
const filename = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'pages/appointment/index.tsx');
const service = { _id: 'a'.repeat(24), memberId: 'b'.repeat(24), serviceTitle: 'Test consultation', servicePrice: 45000 };
const time = '2026-10-14T22:00:00.000Z';
const catalog = { data: { getServices: { list: [service], metaCounter: [{ total: 1 }] } }, loading: false };
let cells = [], cursor, pending, dirty, tree, checks = 0, user = { _id: '' }, removes = 0, reads = 0, writes = 0;
const routes = new Set(), hidden = new Set(), navigations = [];
const router = { isReady: true, query: {}, events: { on: (_, fn) => routes.add(fn), off: (_, fn) => routes.delete(fn) }, push: async url => { routes.forEach(fn => fn(url)); navigations.push(url); } };
global.window = { addEventListener: (_, fn) => hidden.add(fn), removeEventListener: (_, fn) => hidden.delete(fn) };
global.sessionStorage = { getItem: () => { reads++; return JSON.stringify({ serviceId: service._id, doctorId: service.memberId, date: '2026-10-14', startsAt: time, patientNote: 'Previous user note' }); }, setItem: () => writes++, removeItem: () => removes++ };
const hooks = {
 useState(initial) { const i = cursor++; if (!cells[i]) cells[i] = { value: initial }; return [cells[i].value, value => { const next = typeof value === 'function' ? value(cells[i].value) : value; if (!Object.is(next, cells[i].value)) { cells[i].value = next; dirty = true; } }]; },
 useRef(initial) { const i = cursor++; if (!cells[i]) cells[i] = { current: initial }; return cells[i]; },
 useEffect(fn, deps) { const i = cursor++, old = cells[i]; if (!old || deps.some((d, j) => !Object.is(d, old.deps[j]))) { cells[i] = { deps, cleanup: old?.cleanup }; pending.push(() => { cells[i].cleanup?.(); cells[i].cleanup = fn(); }); } },
};
const Picker = () => null;
const catalogModule = new Module(path.join(root,'libs/i18n/catalog.ts'), module);
catalogModule._compile(ts.transpileModule(fs.readFileSync(catalogModule.id,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,catalogModule.id);
const stubs = {
 'react': { ...React, ...hooks }, 'next/router': { useRouter: () => router }, 'next/link': ({ children }) => children,
 '@apollo/client': { useReactiveVar: () => user, useMutation: () => [async () => { throw new Error('No real booking writes in draft reset tests'); }, { loading: false }], useQuery: (_, options) => Object.hasOwn(options.variables, 'serviceId') ? { data: { getService: service }, loading: false } : Object.hasOwn(options.variables.input, 'date') ? { data: { getAvailableDoctorSlots: [{ startsAt: time }] }, loading: false } : catalog },
 '@/libs/components/layout/LayoutHome': value => value,
 '@/libs/components/common/Icon': () => null, '@/libs/components/booking/BookingDatePicker': Picker,
 '@/libs/components/member/enums/member.enum': { MemberType: { PATIENT: 'PATIENT' } },
 '@/libs/i18n/catalog': catalogModule.exports,
 '@/libs/i18n/useTranslation': { useTranslation: () => key => key }, '@/libs/components/workspace/useWorkspaceText': { useWorkspaceText: () => key => key },
 '@/libs/components/preference/PreferenceProvider': { usePreferences: () => ({ language: 'EN' }) },
 '@/libs/payments/useClinicSettings': { useClinicSettings: () => ({ currency: 'KRW', timeZone: 'Asia/Seoul' }) },
 '@/libs/payments/clinic': { clinicDateTime: () => '' }, '@/libs/components/common/currency': { formatMoney: () => '45,000 KRW' },
 '@/libs/components/service/service-price': { servicePriceForDisplay: () => 45000 },
};
const mod = new Module(filename, module); mod.paths = Module._nodeModulePaths(root);
mod.require = name => Object.hasOwn(stubs, name) ? stubs[name] : name.startsWith('@/') ? {} : require(name);
mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
function nodes(node, type, result = []) { if (!node || typeof node !== 'object') return result; if (node.type === type) result.push(node); for (const child of React.Children.toArray(node.props?.children)) nodes(child, type, result); return result; }
function render() { let attempts = 0; do { dirty = false; cursor = 0; pending = []; tree = mod.exports.default(); pending.forEach(fn => fn()); assert(++attempts < 12, 'Effects settle'); } while (dirty); return tree; }
function check(condition, label) { assert.ok(condition, label); checks++; }
function empty(label) { check(nodes(tree, 'select').every(n => n.props.value === '') && nodes(tree, 'textarea')[0].props.value === '' && nodes(tree, Picker).length === 0, label); }
function choose() {
 nodes(tree, 'select')[0].props.onChange({ target: { value: service._id } }); render();
 nodes(tree, Picker)[0].props.onChange('2026-10-14'); render();
 nodes(tree, 'select')[1].props.onChange({ target: { value: time } });
 nodes(tree, 'textarea')[0].props.onChange({ target: { value: 'Synthetic current note' } }); render();
}
function unmount() { cells.forEach(cell => cell.cleanup?.()); cells = []; }
(async () => {
 render(); empty('Legacy guest draft is never restored'); check(reads === 0 && removes > 0, 'Legacy stored notes are removed without reading');
 choose(); check(nodes(tree, 'select')[1].props.value === time, 'Draft remains while on the page');
 routes.forEach(fn => fn('/doctor')); render(); empty('Leaving through Next navigation clears service, date, time and note');
 choose(); hidden.forEach(fn => fn()); render(); empty('Page hide clears history cache draft');
 choose(); await nodes(tree, 'form')[0].props.onSubmit({ preventDefault() {} }); render();
 check(navigations.at(-1) === '/account/signin?redirect=%2Fappointment', 'Guest sign-in returns to an empty appointment'); check(writes === 0, 'Guest cannot persist selected visit or note'); empty('Sign-in navigation resets draft');
 user = { _id: 'c'.repeat(24), memberType: 'PATIENT' }; render(); choose();
 user = { _id: '' }; render(); empty('Logout clears the mounted form');
 user = { _id: 'd'.repeat(24), memberType: 'PATIENT' }; render(); empty('Another patient begins empty'); choose();
 user = { _id: 'c'.repeat(24), memberType: 'PATIENT' }; render(); empty('Direct account switch clears the form'); choose();
 user = { _id: user._id, memberType: 'DOCTOR' }; render(); empty('Same profile ID in another role clears the form');
 router.query = { service: service._id }; render(); check(nodes(tree, 'select')[0].props.value === service._id, 'Explicit service link still selects its service'); check(nodes(tree, 'select')[1].props.value === '' && nodes(tree, 'textarea')[0].props.value === '', 'Service link never carries prior time or note');
 choose(); user = { _id: 'e'.repeat(24), memberType: 'PATIENT' }; render(); empty('Old service URL does not refill a switched account');
 unmount(); check(routes.size === 0 && hidden.size === 0, 'Unmount detaches navigation and pagehide listeners'); router.query = {}; render(); empty('Returning after unmount starts empty');
 unmount(); global.sessionStorage.removeItem = () => { throw new Error('Storage disabled'); }; render(); empty('Unavailable browser storage cannot block fresh booking'); unmount();
 console.log(`BOOKING_DRAFT_RESET_VERIFIED ${checks} checks`);
})().catch(error => { console.error(error); process.exitCode = 1; });
