const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const folder = path.resolve(__dirname, '../apps/mobile/src/features/catalog');
const env = { EXPO_PUBLIC_API_URL: 'https://api.example.test/graphql' };
const load = (name, requireDependency) => {
  const source = fs.readFileSync(path.join(folder, `${name}.ts`), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('exports', 'require', 'process', output)(exports, requireDependency, { env });
  return exports;
};
const model = load('catalogModel');
const api = load('catalogApi', () => model);

const id = 'a'.repeat(24);
const raw = { _id: id, serviceTitle: 'General care', serviceDesc: null };
const page = (list, total = list.length) => ({ list, metaCounter: [{ total }] });
const signal = () => new AbortController().signal;
const reply = (body, ok = true) => async () => ({ ok, json: async () => body });

async function main() {
  // Response bounds
  assert.equal(model.parsePage(page([raw]), model.parseService).items[0].title, 'General care');
  assert.deepEqual(model.parsePage(page([], 0), model.parseService), { items: [], total: 0 });
  for (const bad of [null, page([{}]), page([], -1), page(Array(model.PAGE_SIZE + 1).fill(raw))]) {
    assert.throws(() => model.parsePage(bad, model.parseService));
  }
  for (const bad of [0, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => model.parsePageNumber(bad));
  assert.throws(() => model.parseId('../admin'));
  assert.equal(model.parseDoctor({ _id: id, docNick: 'Ray' }).name, 'Ray');
  assert.deepEqual(model.toParagraphs('<p>One</p><p><b>Two</b></p>'), ['One', 'Two']);

  // Pagination keeps the first occurrence
  const merged = model.mergeById([{ id: 'a', n: 1 }], [{ id: 'a', n: 2 }, { id: 'b', n: 3 }]);
  assert.deepEqual(merged, [{ id: 'a', n: 1 }, { id: 'b', n: 3 }]);

  // URL rules
  for (const bad of [undefined, 'http://x.test', 'https://u:p@x.test', 'https://x.test?a=1']) {
    assert.throws(() => api.publicApiUrl(bad), api.ApiConfigurationError);
  }
  assert.equal(model.resolveAssetUrl('uploads/a.png', 'https://x.test/backend/'), 'https://x.test/backend/uploads/a.png');
  assert.equal(model.resolveAssetUrl('http://x.test/a.png', 'https://x.test'), null);
  assert.equal(model.resolveAssetUrl('uploads/a.png', ''), null);
  assert.equal(model.formatByline('Dr Ray', 'not-a-date', 'en-US'), 'Dr Ray');

  // Transport: minimal anonymous request, fixed errors
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ data: { getServices: page([raw]) } }) };
  };
  assert.equal((await api.fetchList('services', 1, signal())).total, 1);
  assert.equal(requests[0].url, env.EXPO_PUBLIC_API_URL);
  assert.deepEqual(requests[0].options.headers, { 'Content-Type': 'application/json' });
  assert.match(requests[0].options.body, /"page":1,"limit":10,"search":\{\}/);

  global.fetch = reply(null, false);
  await assert.rejects(api.fetchList('doctors', 1, signal()), { message: 'Catalog request failed' });
  global.fetch = reply({ errors: [{ message: 'internal detail' }] });
  await assert.rejects(api.fetchItem('articles', id, signal()), { message: 'Catalog request failed' });
  global.fetch = async () => ({ ok: true, json: async () => { throw new Error('raw detail'); } });
  await assert.rejects(api.fetchList('services', 1, signal()), { message: 'Invalid catalog response' });
  await assert.rejects(api.fetchItem('services', 'bad', signal()), { message: 'Invalid catalog id' });

  // Timeout and cancellation
  assert.equal(api.REQUEST_TIMEOUT_MS, 15_000);
  const caller = new AbortController();
  const owned = api.createRequestSignal(caller.signal, 1000);
  caller.abort();
  assert.equal(owned.signal.aborted, true);
  owned.dispose();
  const timed = api.createRequestSignal(signal(), 0);
  const disposed = api.createRequestSignal(signal(), 0);
  disposed.dispose();
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(timed.signal.aborted, true);
  assert.equal(disposed.signal.aborted, false);
  timed.dispose();

  console.log('MOBILE_CATALOG_VERIFIED');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
