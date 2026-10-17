const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const code = ts.transpileModule(
	fs.readFileSync(path.join(__dirname, '../libs/auth/token.ts'), 'utf8'),
	{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const channels = new Set();
const sharedValues = new Map();
let sequence = 0;
class Channel {
	constructor(name) { this.name = name; channels.add(this); }
	postMessage(data) {
		for (const other of channels)
			if (other !== this && other.name === this.name)
				setTimeout(() => other.onmessage?.({ data }), 0);
	}
	close() { channels.delete(this); }
}
function tab(values = new Map(), options = {}) {
	const openedChannels = [];
	const handlers = new Map();
	const storage = {
		getItem: key => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, String(value)),
		removeItem: key => values.delete(key),
	};
	const window = {
		sessionStorage: storage,
		localStorage: options.localStorage ?? {
			getItem: key => sharedValues.get(key) ?? null,
			setItem: (key, value) => sharedValues.set(key, String(value)),
			removeItem: key => sharedValues.delete(key),
		},
		crypto: { randomUUID: () => `tab-${++sequence}` },
		opener: options.opener ?? null,
		performance: { getEntriesByType: () => [{ type: options.navigation ?? 'navigate' }] },
		setTimeout, clearTimeout,
		addEventListener: (name, handler) => handlers.set(name, handler),
		BroadcastChannel: options.noChannel ? undefined : class extends Channel {
			constructor(name) { super(name); openedChannels.push(this); }
		},
	};
	const exports = {};
	vm.runInNewContext(code, { window, exports, require, setTimeout, clearTimeout, console }, { filename: 'token.ts' });
	return { auth: exports, values, close: () => {
		handlers.get('pagehide')?.();
		openedChannels.forEach(channel => channel.close());
	} };
}
function access() {
	return ['e30', Buffer.from(JSON.stringify({ memberType: 'PATIENT', sid: '000000000000000000000002' })).toString('base64url'), 'fixture'].join('.');
}
async function main() {
	const original = tab();
	await original.auth.waitForTabSession();
	original.auth.setJwtToken(access());
	assert.equal(original.auth.getJwtToken(), access(), 'the signed-in tab keeps its access token');
	sharedValues.set('mn-hospital-session-hint', JSON.stringify({ memberType: 'PATIENT', sid: '000000000000000000000002' }));
	const fresh = tab();
	await fresh.auth.waitForTabSession();
	assert.equal(fresh.auth.getJwtToken(), '', 'an independent new tab is a guest');
	assert.equal(sharedValues.has('mn-hospital-session-hint'), false, 'the old cross-tab restore hint is removed');
	const duplicate = tab(new Map(original.values));
	await duplicate.auth.waitForTabSession();
	assert.equal(duplicate.auth.getJwtToken(), '', 'a duplicated tab discards its copied access token');
	const duplicateReload = tab(new Map(original.values), { navigation: 'reload' });
	await duplicateReload.auth.waitForTabSession();
	assert.equal(duplicateReload.auth.getJwtToken(), '', 'a duplicate cannot pose as a reload while the original tab is active');
	const isolatedLocalStorage = new Map();
	const channelOnlyClone = tab(new Map(original.values), { localStorage: {
		getItem: key => isolatedLocalStorage.get(key) ?? null,
		setItem: (key, value) => isolatedLocalStorage.set(key, String(value)),
		removeItem: key => isolatedLocalStorage.delete(key),
	} });
	await channelOnlyClone.auth.waitForTabSession();
	assert.equal(channelOnlyClone.auth.getJwtToken(), '', 'cross-tab messaging rejects a copy when the owner marker is unavailable');
	assert.equal(original.auth.getJwtToken(), access(), 'discarding the copy leaves the original tab signed in');
	const opened = tab(new Map(original.values), { opener: {} });
	await opened.auth.waitForTabSession();
	assert.equal(opened.auth.getJwtToken(), '', 'a tab opened by the signed-in tab is a guest');
	const legacy = tab(new Map([['mn-hospital-tab-access-token', access()]]));
	await legacy.auth.waitForTabSession();
	assert.equal(legacy.auth.getJwtToken(), '', 'a pre-upgrade token without a tab identity fails closed');
	original.close();
	const reloaded = tab(original.values, { navigation: 'reload' });
	await reloaded.auth.waitForTabSession();
	assert.equal(reloaded.auth.getJwtToken(), access(), 'reloading the same tab keeps its session');
	const noChannelClone = tab(new Map(reloaded.values), { noChannel: true });
	await noChannelClone.auth.waitForTabSession();
	assert.equal(noChannelClone.auth.getJwtToken(), '', 'without cross-tab messaging a copied navigation fails closed');
	const deceptiveClone = tab(new Map(reloaded.values), { noChannel: true, navigation: 'reload' });
	await deceptiveClone.auth.waitForTabSession();
	assert.equal(deceptiveClone.auth.getJwtToken(), '', 'a copied tab cannot claim to be a reload while its owner is active');
	reloaded.close();
	const noChannelReload = tab(new Map(reloaded.values), { noChannel: true, navigation: 'reload' });
	await noChannelReload.auth.waitForTabSession();
	assert.equal(noChannelReload.auth.getJwtToken(), access(), 'a reload remains available without cross-tab messaging');
	for (const channel of [...channels]) channel.close();
	process.stdout.write('TAB_OWNERSHIP_VERIFIED 12 checks\n');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
