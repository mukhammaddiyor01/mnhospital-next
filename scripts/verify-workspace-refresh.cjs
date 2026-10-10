const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
let passed = 0;
const check = (value, expected) => { assert.deepEqual(value, expected); passed++; };
const source = ts.transpileModule(fs.readFileSync('libs/hooks/useLiveWorkspaceRefresh.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function harness() {
 const events = new Map(); const timers = new Map(); let ref; let cleanup; let dependency;
 const document = { visibilityState: 'visible', addEventListener: (name, fn) => events.set(name, fn), removeEventListener: (name) => events.delete(name) };
 const window = { setInterval: (fn, ms) => { check(ms, 10000); timers.set(1, fn); return 1; }, clearInterval: (id) => timers.delete(id), addEventListener: (name, fn) => events.set(name, fn), removeEventListener: (name) => events.delete(name) };
 const react = { useRef: (value) => ref ?? (ref = { current: value }), useEffect: (effect, deps) => { if (dependency !== deps[0]) { cleanup?.(); dependency = deps[0]; cleanup = effect(); } } };
 const module = { exports: {} }; vm.runInNewContext(source, { exports: module.exports, require: () => react, window, document });
 return { render: module.exports.useLiveWorkspaceRefresh, document, tick: () => timers.get(1)?.(), event: (name) => events.get(name)?.(), timers, events, unmount: () => cleanup?.() };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
(async () => {
 const h = harness(); let calls = 0; const refresh = async () => { calls++; };
 h.render(refresh, false); check(h.timers.size, 0); check(h.events.size, 0);
 h.render(refresh, true); check(h.timers.size, 1); check(h.events.size, 2);
 h.tick(); await flush(); check(calls, 1);
 h.document.visibilityState = 'hidden'; h.tick(); h.event('focus'); await flush(); check(calls, 1);
 h.document.visibilityState = 'visible'; h.event('visibilitychange'); await flush(); check(calls, 2);
 h.render(async () => { calls += 10; }, true); h.tick(); await flush(); check(calls, 12);
 h.render(refresh, false); check(h.timers.size, 0); check(h.events.size, 0); h.event('focus'); await flush(); check(calls, 12);
 const racing = harness(); let resolve; let count = 0;
 racing.render(() => { count++; return new Promise((done) => { resolve = done; }); }, true);
 racing.tick(); racing.event('focus'); racing.tick(); check(count, 1);
 resolve(); await flush(); racing.tick(); check(count, 2); resolve(); await flush();
 racing.render(async () => { count++; throw new Error('API unavailable'); }, true); racing.tick(); await flush(); racing.tick(); await flush(); check(count, 4);
 racing.unmount(); check(racing.timers.size, 0); check(racing.events.size, 0);
 console.log(`${passed} workspace refresh checks passed`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
