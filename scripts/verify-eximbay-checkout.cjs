const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
Module._extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { getEximbaySdkUrl, requestEximbayCheckout } = require('../libs/payments/eximbay.ts');

assert.equal(getEximbaySdkUrl(), 'https://api-test.eximbay.com/v3/javascriptSDK.js');
assert.equal(getEximbaySdkUrl('https://api-test.eximbay.com/v3/javascriptSDK.js'), 'https://api-test.eximbay.com/v3/javascriptSDK.js');
assert.equal(getEximbaySdkUrl('https://api.eximbay.com/v3/javascriptSDK.js'), '', 'Production SDK is blocked');
assert.equal(getEximbaySdkUrl('https://api-test.eximbay.com/v1/javascriptSDK.js'), '');
assert.equal(getEximbaySdkUrl('https://example.com/javascriptSDK.js'), '');

const payload = {
	__typename: 'EximbayPrepare', fgkey: 'server-fixture-key',
	payment: { __typename: 'EximbayPaymentData', transaction_type: 'PAYMENT', order_id: 'server-order', currency: 'KRW', amount: '70000', lang: 'EN' },
	merchant: { __typename: 'EximbayMerchantData', mid: 'fixture-mid' },
	buyer: { __typename: 'EximbayBuyerData', name: 'Fixture Buyer', email: 'fixture@example.com' },
	url: { __typename: 'EximbayUrlData', return_url: 'http://localhost:2001/return/fixture', status_url: 'http://localhost:2001/status/fixture' },
	settings: { __typename: 'EximbaySettingsData', display_type: 'R' },
};
let requested;
const sdk = { request_pay: value => { requested = value; } };
requestEximbayCheckout(payload, sdk, 'Checkout unavailable');
assert.equal(requested.payment.order_id, 'server-order');
assert.equal(requested.payment.amount, '70000');
assert.equal(requested.settings.display_type, 'R');
assert.equal(JSON.stringify(requested).includes('__typename'), false);
assert.equal(payload.payment.__typename, 'EximbayPaymentData', 'Apollo cached payload stays unchanged');
assert.throws(() => requestEximbayCheckout({ ...payload, fgkey: '' }, sdk, 'Checkout unavailable'), /Checkout unavailable/);
assert.throws(() => requestEximbayCheckout(payload, undefined, 'Checkout unavailable'), /Checkout unavailable/);
assert.throws(() => requestEximbayCheckout({ ...payload, settings: { display_type: 'P' } }, sdk, 'Checkout unavailable'), /Checkout unavailable/);
console.log('PASS: SDK v3, redirect checkout, server-owned values, GraphQL metadata removal, and failure handling.');
