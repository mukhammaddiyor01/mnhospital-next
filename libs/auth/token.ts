import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'mn-hospital-tab-access-token';
const ENDED_TAB_KEY = 'mn-hospital-tab-session-ended';
const TAB_ID_KEY = 'mn-hospital-tab-id';
const LEGACY_SESSION_HINT_KEY = 'mn-hospital-session-hint';
const TAB_CHANNEL = 'mn-hospital-tab-ownership';
const TAB_OWNER_PREFIX = 'mn-hospital-tab-owner:';
export const SESSION_ROLE_HEADER = 'X-MN-Session-Role';
export const SESSION_EVENT_KEY = 'mn-hospital-role-session-event';
export type SessionRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
export type SessionIdentity = { memberType: SessionRole; sid: string };
const roles: SessionRole[] = ['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'];
let tabOwnershipSettled = typeof window === 'undefined';
let pageInstance = '';
function newTabId(): string {
	return window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}
function rawToken(): string {
	return window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
}
function ownerKey(tabId: string): string { return `${TAB_OWNER_PREFIX}${tabId}`; }
function currentOwner(tabId: string): string | null {
	try { return window.localStorage.getItem(ownerKey(tabId)); } catch { return null; }
}
function markOwner(tabId: string): void {
	try { window.localStorage.setItem(ownerKey(tabId), pageInstance); } catch { /* BroadcastChannel remains available. */ }
}
function forgetOwner(tabId: string | null): void {
	if (!tabId) return;
	try {
		if (currentOwner(tabId) === pageInstance) window.localStorage.removeItem(ownerKey(tabId));
	} catch { /* A tab's own credentials are still cleared below. */ }
}
function discardCopiedSession(): void {
	forgetOwner(window.sessionStorage.getItem(TAB_ID_KEY));
	window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
	window.sessionStorage.removeItem(TAB_ID_KEY);
	window.sessionStorage.setItem(ENDED_TAB_KEY, 'true');
}
async function initializeTabOwnership(): Promise<void> {
	// Old versions remembered a role across tabs. Remove that hint without touching cookies.
	try { window.localStorage.removeItem(LEGACY_SESSION_HINT_KEY); } catch { /* No shared hint is needed. */ }
	const page = window as Window & { __mnDocumentInstanceId?: string };
	const instance = page.__mnDocumentInstanceId ?? (page.__mnDocumentInstanceId = newTabId());
	pageInstance = instance;
	let activeDocument = true;
	window.addEventListener?.('pagehide', () => {
		activeDocument = false;
		forgetOwner(window.sessionStorage.getItem(TAB_ID_KEY));
	});
	window.addEventListener?.('pageshow', () => {
		activeDocument = true;
		if (!tabOwnershipSettled) return;
		const id = window.sessionStorage.getItem(TAB_ID_KEY);
		if (id && rawToken()) markOwner(id);
	});
	let channel: BroadcastChannel | undefined;
	try {
		if (typeof window.BroadcastChannel === 'function') channel = new window.BroadcastChannel(TAB_CHANNEL);
	} catch { /* Browser privacy mode can disable the channel. */ }
	let probe: { tabId: string; occupied: () => void } | undefined;
	if (channel) channel.onmessage = (event: MessageEvent) => {
		const data = event.data;
		if (!data || data.instance === instance) return;
		if (activeDocument && data.type === 'probe' && rawToken() && data.tabId === window.sessionStorage.getItem(TAB_ID_KEY))
			channel?.postMessage({ type: 'occupied', tabId: data.tabId, target: data.instance, instance });
		if (data.type === 'occupied' && data.target === instance && data.tabId === probe?.tabId)
			probe?.occupied();
	};
	const original = rawToken();
	if (!original) return;
	const tabId = window.sessionStorage.getItem(TAB_ID_KEY);
	if (!tabId || window.opener) {
		discardCopiedSession();
		return;
	}
	const navigation = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	const sameTabNavigation = navigation?.type === 'reload' || navigation?.type === 'back_forward';
	const owner = currentOwner(tabId);
	if (owner && owner !== instance) {
		discardCopiedSession();
		return;
	}
	if (owner === instance || (!owner && sameTabNavigation)) {
		markOwner(tabId);
		return;
	}
	if (channel) {
		let copied = false;
		await new Promise<void>((resolve) => {
			const timer = window.setTimeout(resolve, 250);
			probe = { tabId, occupied: () => { copied = true; window.clearTimeout(timer); resolve(); } };
			channel?.postMessage({ type: 'probe', tabId, instance });
		});
		probe = undefined;
		if (copied && rawToken() === original) discardCopiedSession();
		else if (rawToken() === original) markOwner(tabId);
		return;
	}
	// Without cross-tab messaging, accept a current-tab reload but fail closed on a copied navigation.
	if (rawToken() === original)
		discardCopiedSession();
}
const tabOwnershipReady = typeof window === 'undefined'
	? Promise.resolve()
	: initializeTabOwnership().catch(() => discardCopiedSession()).finally(() => { tabOwnershipSettled = true; });
export function waitForTabSession(): Promise<void> { return tabOwnershipReady; }
function validIdentity(value: unknown): value is SessionIdentity {
	if (!value || typeof value !== 'object') return false;
	const identity = value as Partial<SessionIdentity>;
	return roles.includes(identity.memberType as SessionRole) && typeof identity.sid === 'string' && /^[a-f\d]{24}$/i.test(identity.sid);
}
export function getJwtToken(): string {
	if (typeof window === 'undefined' || !tabOwnershipSettled) return '';
	return rawToken();
}
export function setJwtToken(token: string): void {
	if (typeof window !== 'undefined') {
		if (!window.sessionStorage.getItem(TAB_ID_KEY)) window.sessionStorage.setItem(TAB_ID_KEY, newTabId());
		window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
		window.sessionStorage.removeItem(ENDED_TAB_KEY);
		markOwner(window.sessionStorage.getItem(TAB_ID_KEY)!);
		tabOwnershipSettled = true;
	}
}
export function removeJwtToken(): void {
	if (typeof window !== 'undefined') {
		forgetOwner(window.sessionStorage.getItem(TAB_ID_KEY));
		window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
		window.sessionStorage.removeItem(TAB_ID_KEY);
	}
}
export function endTabSession(): void {
	if (typeof window !== 'undefined') window.sessionStorage.setItem(ENDED_TAB_KEY, 'true');
}
export function storedSessionIdentity(): SessionIdentity | undefined {
	try {
		const claims = jwtDecode<SessionIdentity>(getJwtToken());
		if (validIdentity(claims)) return claims;
	} catch { /* Guest tab. */ }
	return undefined;
}
export function publishSessionEvent(kind: 'login' | 'logout'): void {
	const identity = storedSessionIdentity();
	if (identity) window.localStorage.setItem(SESSION_EVENT_KEY, JSON.stringify({
		kind, role: identity.memberType, sid: identity.sid, nonce: Math.random().toString(36),
	}));
}
export function sessionEventInvalidatesTab(key: string | null, value: string | null): boolean {
	if (key !== SESSION_EVENT_KEY || !value) return false;
	try {
		const event = JSON.parse(value);
		const identity = storedSessionIdentity();
		return Boolean(identity && event.role === identity.memberType && (
			(event.kind === 'logout' && event.sid === identity.sid) ||
			(event.kind === 'login' && event.sid !== identity.sid)
		));
	} catch { return false; }
}
