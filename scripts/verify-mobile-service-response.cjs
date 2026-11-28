const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/serviceModel.ts'),
  'utf8',
);
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const serviceModel = {};
new Function('exports', output)(serviceModel);

const { parseServicePage, parseServicePageNumber, SERVICES_PAGE_SIZE } = serviceModel;
const service = (id) => ({ _id: id, serviceTitle: `Service ${id}`, serviceDesc: null });
const response = (list, total = list.length) => ({
  list,
  metaCounter: [{ total }],
});

assert.deepEqual(parseServicePage(response([service('a')], 1)), {
  services: [{ id: 'a', title: 'Service a', description: null }],
  total: 1,
});
assert.deepEqual(parseServicePage(response([], 0)), { services: [], total: 0 });
assert.throws(() => parseServicePage(null));
assert.throws(() => parseServicePage(response([{}])));
assert.throws(() => parseServicePage(response([], -1)));
assert.throws(() => parseServicePage(response(Array.from({ length: SERVICES_PAGE_SIZE + 1 }, (_, index) => service(String(index))))));
assert.equal(parseServicePageNumber(1), 1);
assert.throws(() => parseServicePageNumber(0));
assert.throws(() => parseServicePageNumber(1.5));
assert.throws(() => parseServicePageNumber(Number.MAX_SAFE_INTEGER + 1));

console.log('MOBILE_SERVICE_RESPONSE_VERIFIED 10 checks');
