const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
	return resolve.call(
		this,
		request.startsWith('@/') ? path.join(root, request.slice(2)) : request,
		...args,
	);
};
for (const ext of ['.ts', '.tsx'])
	Module._extensions[ext] = (module, filename) =>
		module._compile(
			ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
				compilerOptions: {
					module: ts.ModuleKind.CommonJS,
					target: ts.ScriptTarget.ES2020,
					jsx: ts.JsxEmit.ReactJSX,
					esModuleInterop: true,
				},
			}).outputText,
			filename,
		);
const values = new Map(),
	events = [];
let lock = Promise.resolve();
global.window = {
	localStorage: {
		getItem: (key) => values.get(key) ?? null,
		setItem: (key, value) => values.set(key, String(value)),
		removeItem: (key) => values.delete(key),
	},
	dispatchEvent: (event) => {
		events.push(event.type);
		return true;
	},
};
Object.defineProperty(global, 'navigator', {
	configurable: true,
	value: {
		locks: {
			request: (_name, action) => {
				const pending = lock.then(action);
				lock = pending.catch(() => undefined);
				return pending;
			},
		},
	},
});
const session = require(root + '/libs/auth/session.ts');
const { getJwtToken, setJwtToken } = require(root + '/libs/auth/token.ts');
const { userVar } = require(root + '/apollo/store.ts');
const { createSessionLinks } = require(root + '/libs/auth/sessionLink.ts');
const { ApolloLink, Observable, gql, execute } = require('@apollo/client');
let checks = 0,
	calls = [];
const id = '000000000000000000000001',
	sid = '000000000000000000000002';
function token(role = 'PATIENT', seconds = 900, name = 'Patient') {
	return (
		Buffer.from('{}').toString('base64url') +
		'.' +
		Buffer.from(
			JSON.stringify({
				_id: id,
				memberType: role,
				sid,
				tokenType: 'access',
				exp: Math.floor(Date.now() / 1000) + seconds,
				...(role === 'PATIENT'
					? { memberNick: name }
					: role === 'DOCTOR'
						? { docNick: name }
						: role === 'RECEPTIONIST'
							? { receptionistNick: name }
							: { adminNick: name }),
			}),
		).toString('base64url') +
		'.fixture'
	);
}
function check(condition, label) {
	assert.ok(condition, label);
	checks++;
}
function response(data, errors) {
	return { ok: true, json: async () => ({ data, errors }) };
}
function fetchWith(action) {
	calls = [];
	global.fetch = async (_url, options) => {
		calls.push({ query: JSON.parse(options.body).query, options });
		return action(options);
	};
}
function seed() {
	session.applySessionToken(token());
	setJwtToken(token('PATIENT', -1));
}
function result(link, operation) {
	return new Promise((resolve, reject) =>
		execute(link, operation).subscribe({ next: resolve, error: reject }),
	);
}
async function main() {
	const fresh = token('PATIENT', 900, 'Updated');
	seed();
	fetchWith(async () => response({ refreshSession: { accessToken: fresh } }));
	const renewed = await Promise.all(
		Array.from({ length: 12 }, () => session.ensureAccessToken()),
	);
	check(
		calls.length === 1 && renewed.every((value) => value === fresh),
		'concurrent requests share a single refresh',
	);
	check(
		calls[0].options.credentials === 'include' &&
			calls[0].options.headers['Apollo-Require-Preflight'] === 'true',
		'refresh uses credentialed/preflight transport',
	);
	check(
		!calls[0].options.body.includes('refreshToken'),
		'refresh secret is never read or sent by JavaScript',
	);
	await session.ensureAccessToken();
	check(calls.length === 1, 'valid access does not rotate unnecessarily');
	for (const role of ['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN']) {
		session.applySessionToken(token(role, 900, role + ' login'));
		check(
			userVar().memberNick === role + ' login',
			'role display alias ' + role,
		);
	}
	check(
		events.includes('mn-hospital-session-changed'),
		'identity switches invalidate owned caches',
	);
	seed();
	fetchWith(async () => response(null, [{ code: 'UNAUTHENTICATED' }]));
	await assert.rejects(
		session.refreshSessionToken(),
		session.SessionRejectedError,
	);
	check(
		!getJwtToken() && !userVar()._id && !session.hasStoredSession(),
		'terminal rejection clears the local session',
	);
	seed();
	const retained = getJwtToken();
	fetchWith(async () => {
		throw new TypeError('offline');
	});
	await assert.rejects(session.refreshSessionToken());
	check(
		getJwtToken() === retained && session.hasStoredSession(),
		'network failures preserve credentials for retry',
	);
	const browserLocks = navigator.locks;
	for (const supported of [true, false]) {
		navigator.locks = supported ? browserLocks : undefined;
		seed();
		let finish;
		fetchWith(async (options) => {
			if (JSON.parse(options.body).query.includes('RefreshSession'))
				return new Promise((resolve) => {
					finish = () =>
						resolve(response({ refreshSession: { accessToken: token() } }));
				});
			return response({ logoutSession: true });
		});
		const pending = session.refreshSessionToken();
		await new Promise((resolve) => setImmediate(resolve));
		const logout = session.revokeBrowserSession();
		await new Promise((resolve) => setImmediate(resolve));
		check(calls.length === 1, "logout waits before sending while refresh is pending");
		finish();
		await pending;
		await logout;
		check(
			calls
				.map((call) =>
					call.query.includes('RefreshSession') ? 'refresh' : 'logout',
				)
				.join(',') === 'refresh,logout',
			'logout waits for in-flight cookie rotation',
		);
		check(
			!getJwtToken() && !session.hasStoredSession(),
			'logout cannot be undone by an in-flight refresh',
		);
	}
	navigator.locks = browserLocks;

	session.applySessionToken(token());
	fetchWith(async () => ({ ok: false, json: async () => ({}) }));
	await assert.rejects(session.revokeBrowserSession());
	check(Boolean(getJwtToken()), 'failed logout retains a retryable session');
	const op = {
		query: gql`
			query SessionCheck {
				getMyPreferences {
					theme
				}
			}
		`,
	};
	session.applySessionToken(token());
	fetchWith(async () =>
		response({
			refreshSession: { accessToken: token('PATIENT', 900, 'Retry') },
		}),
	);
	const headers = [];
	let forwarded = 0;
	const links = createSessionLinks();
	const terminal = new ApolloLink(
		(operation) =>
			new Observable((observer) => {
				forwarded++;
				headers.push(operation.getContext().headers);
				observer.next(
					forwarded === 1
						? {
								errors: [
									{
										message: 'Expired',
										extensions: { code: 'UNAUTHENTICATED' },
									},
								],
							}
						: { data: { getMyPreferences: { theme: 'LIGHT' } } },
				);
				observer.complete();
			}),
	);
	const accepted = await result(
		ApolloLink.from([links.errors, links.auth, terminal]),
		op,
	);
	check(
		accepted.data?.getMyPreferences.theme === 'LIGHT' &&
			forwarded === 2 &&
			calls.length === 1,
		'unauthenticated guarded operation retries once after refresh',
	);
	check(
		headers[1].Authorization === 'Bearer ' + getJwtToken() &&
			headers[1]['Apollo-Require-Preflight'] === 'true',
		'retry uses the renewed bearer token',
	);
	const logError = console.error;
	console.error = () => {};
	try {
		calls = [];
		forwarded = 0;
		const forbiddenLinks = createSessionLinks();
		const forbidden = new ApolloLink(
			() =>
				new Observable((observer) => {
					forwarded++;
					observer.next({
						errors: [
							{ message: 'Wrong role', extensions: { code: 'FORBIDDEN' } },
						],
					});
					observer.complete();
				}),
		);
		await result(
			ApolloLink.from([forbiddenLinks.errors, forbiddenLinks.auth, forbidden]),
			op,
		);
		check(
			forwarded === 1 && calls.length === 0 && userVar()._id === id,
			'wrong-role rejection neither refreshes nor logs out',
		);
		forwarded = 0;
		const networkLinks = createSessionLinks();
		const lostWrite = new ApolloLink(
			() =>
				new Observable((observer) => {
					forwarded++;
					observer.error(new Error('Connection lost after send'));
				}),
		);
		await assert.rejects(
			result(
				ApolloLink.from([networkLinks.errors, networkLinks.auth, lostWrite]),
				{
					query: gql`
						mutation WriteCheck {
							markAllMyNotificationsRead
						}
					`,
				},
			),
		);
		check(
			forwarded === 1,
			'ambiguous network failures do not replay business mutations',
		);
	} finally {
		console.error = logError;
	}
	session.applySessionToken(token('DOCTOR'));
	const accountLinks = createSessionLinks();
	let accountForwards = 0;
	const accountTerminal = new ApolloLink(() => new Observable(observer => { accountForwards++; observer.next({ data: {} }); observer.complete(); }));
	await assert.rejects(result(ApolloLink.from([accountLinks.auth, accountTerminal]), { ...op, context: { expectedAccount: 'PATIENT:' + id } }), /Account changed/);
	check(accountForwards === 0, 'profile writes are rejected before send when the account identity changes');
	let deliver;
	const staleLinks = createSessionLinks();
	const stale = new ApolloLink(
		() =>
			new Observable((observer) => {
				deliver = () => {
					observer.next({
						data: { getMyDoctorReport: { _id: 'private-report' } },
					});
					observer.complete();
				};
			}),
	);
	const pendingRead = result(
		ApolloLink.from([staleLinks.errors, staleLinks.auth, stale]),
		op,
	);
	const rejectedRead = assert.rejects(
		pendingRead,
		session.SessionRejectedError,
	);
	await new Promise((resolve) => setImmediate(resolve));
	session.applySessionToken(token('PATIENT'));
	deliver();
	await rejectedRead;
	check(
		userVar().memberType === 'PATIENT',
		'late private responses from the previous identity are discarded',
	);
	console.log('FRONTEND_AUTH_VERIFIED ' + checks + ' checks');
}
main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
