const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/serviceApi.ts'),
  'utf8',
);
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const serviceApi = {};
new Function('exports', 'require', 'process', output)(
  serviceApi,
  (specifier) => {
    if (specifier === './serviceModel') return { SERVICES_PAGE_SIZE: 10, parseServicePage: (value) => value };
    throw new Error(`Unexpected dependency: ${specifier}`);
  },
  { env: {} },
);

const { PUBLIC_SERVICE_REQUEST_TIMEOUT_MS, createPublicServiceRequestSignal } = serviceApi;

async function waitForAbort(signal) {
  if (signal.aborted) return;
  await new Promise((resolve) => signal.addEventListener('abort', resolve, { once: true }));
}

async function main() {
  assert.equal(PUBLIC_SERVICE_REQUEST_TIMEOUT_MS, 15_000);

  const caller = new AbortController();
  const callerOwnedRequest = createPublicServiceRequestSignal(caller.signal, 100);
  caller.abort();
  await waitForAbort(callerOwnedRequest.signal);
  assert.equal(callerOwnedRequest.signal.aborted, true);
  callerOwnedRequest.dispose();

  const timeoutOwnedRequest = createPublicServiceRequestSignal(new AbortController().signal, 0);
  await waitForAbort(timeoutOwnedRequest.signal);
  assert.equal(timeoutOwnedRequest.signal.aborted, true);
  timeoutOwnedRequest.dispose();

  const preAbortedCaller = new AbortController();
  preAbortedCaller.abort();
  const preAbortedRequest = createPublicServiceRequestSignal(preAbortedCaller.signal, 100);
  assert.equal(preAbortedRequest.signal.aborted, true);
  preAbortedRequest.dispose();

  const disposableRequest = createPublicServiceRequestSignal(new AbortController().signal, 0);
  disposableRequest.dispose();
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(disposableRequest.signal.aborted, false);

  assert.match(source, /signal: request\.signal/);
  assert.match(source, /finally \{\s*request\.dispose\(\);\s*\}/);
  console.log('MOBILE_SERVICE_TIMEOUT_VERIFIED 8 checks');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
