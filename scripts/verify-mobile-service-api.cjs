const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const modelSource = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/serviceModel.ts'),
  'utf8',
);
const apiSource = fs.readFileSync(
  path.join(root, 'apps/mobile/src/features/services/serviceApi.ts'),
  'utf8',
);
const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;

const serviceModel = {};
new Function('exports', compile(modelSource))(serviceModel);
const serviceApi = {};
new Function('exports', 'require', 'process', compile(apiSource))(
  serviceApi,
  (specifier) => {
    if (specifier === './serviceModel') return serviceModel;
    throw new Error(`Unexpected dependency: ${specifier}`);
  },
  { env: { EXPO_PUBLIC_API_URL: 'https://api.example.test/graphql' } },
);

const { getPublicServices } = serviceApi;
const originalFetch = global.fetch;
const controller = () => new AbortController();
const response = (body, ok = true) => ({ ok, json: async () => body });

async function main() {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return response({
      data: {
        getServices: {
          list: [{ _id: 'service-1', serviceTitle: 'General care', serviceDesc: null }],
          metaCounter: [{ total: 1 }],
        },
      },
    });
  };

  try {
    const result = await getPublicServices(1, controller().signal);
    assert.deepEqual(result, {
      services: [{ id: 'service-1', title: 'General care', description: null }],
      total: 1,
    });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'https://api.example.test/graphql');
    assert.deepEqual(requests[0].options.headers, { 'Content-Type': 'application/json' });
    assert.match(requests[0].options.body, /"page":1,"limit":10,"search":\{\}/);
    assert.match(requests[0].options.body, /_id serviceTitle serviceDesc/);

    global.fetch = async () => response(null, false);
    await assert.rejects(
      () => getPublicServices(1, controller().signal),
      { message: 'Service request failed' },
    );

    global.fetch = async () => response({ errors: [{ message: 'internal detail' }] });
    await assert.rejects(
      () => getPublicServices(1, controller().signal),
      { message: 'Service request failed' },
    );

    global.fetch = async () => ({ ok: true, json: async () => { throw new Error('raw parser detail'); } });
    await assert.rejects(
      () => getPublicServices(1, controller().signal),
      { message: 'Invalid service response' },
    );

    global.fetch = async () => response({ data: { getServices: { list: [{}], metaCounter: [{ total: 1 }] } } });
    await assert.rejects(
      () => getPublicServices(1, controller().signal),
      { message: 'Invalid service response' },
    );

    console.log('MOBILE_SERVICE_API_VERIFIED 10 checks');
  } finally {
    global.fetch = originalFetch;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
