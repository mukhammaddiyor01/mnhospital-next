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

const { mergeUniqueServices } = serviceModel;
const service = (id, title = `Service ${id}`) => ({ id, title, description: null });

const firstPage = [service('a'), service('a', 'Duplicate A'), service('b')];
const firstResult = mergeUniqueServices([], firstPage);
assert.deepEqual(firstResult.map((item) => item.id), ['a', 'b']);
assert.equal(firstResult[0].title, 'Service a', 'The first occurrence remains stable');

const nextPage = [service('b', 'Repeated B'), service('c'), service('c', 'Duplicate C')];
const merged = mergeUniqueServices(firstResult, nextPage);
assert.deepEqual(merged.map((item) => item.id), ['a', 'b', 'c']);
assert.equal(merged[1].title, 'Service b', 'An overlapping page cannot replace an existing card');

const repeated = mergeUniqueServices(merged, nextPage);
assert.deepEqual(repeated, merged, 'Repeating the same page must not add another card');
assert.deepEqual(firstPage.map((item) => item.id), ['a', 'a', 'b'], 'Incoming data is not mutated');
assert.deepEqual(firstResult.map((item) => item.id), ['a', 'b'], 'Current state is not mutated');
assert.deepEqual(mergeUniqueServices([], []), [], 'Empty pages remain empty');

console.log('MOBILE_SERVICE_PAGINATION_VERIFIED 8 checks');
