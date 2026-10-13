import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'mn-hospital-tab-access-token';
const ENDED_TAB_KEY = 'mn-hospital-tab-session-ended';
const SESSION_HINT_KEY = 'mn-hospital-session-hint';
export const SESSION_ROLE_HEADER = 'X-MN-Session-Role';
export const SESSION_EVENT_KEY = 'mn-hospital-role-session-event';
export type SessionRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
export type SessionIdentity = { memberType: SessionRole; sid: string };
const roles: SessionRole[] = ['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'];
function validIdentity(value: unknown): value is SessionIdentity {
	if (!value || typeof value !== 'object') return false;
	const identity = value as Partial<SessionIdentity>;
	return roles.includes(identity.memberType as SessionRole) && typeof identity.sid === 'string' && /^[a-f\d]{24}$/i.test(identity.sid);
}
export function getJwtToken(): string {
	if (typeof window === 'undefined') return '';
	return window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
}
export function setJwtToken(token: string): void {
	if (typeof window !== 'undefined') {
		window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
		window.sessionStorage.removeItem(ENDED_TAB_KEY);
	}
}
export function removeJwtToken(): void {
	if (typeof window !== 'undefined') window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
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
export function rememberedSessionIdentity(): SessionIdentity | undefined {
	if (typeof window === 'undefined') return undefined;
	try {
		const identity = JSON.parse(window.localStorage.getItem(SESSION_HINT_KEY) ?? 'null');
		return validIdentity(identity) ? identity : undefined;
	} catch { return undefined; }
}
export function restorableSessionIdentity(): SessionIdentity | undefined {
	if (typeof window === 'undefined' || window.sessionStorage.getItem(ENDED_TAB_KEY)) return undefined;
	return rememberedSessionIdentity();
}
export function rememberSessionIdentity(identity: SessionIdentity): void {
	if (typeof window !== 'undefined' && validIdentity(identity))
		window.localStorage.setItem(SESSION_HINT_KEY, JSON.stringify(identity));
}
export function forgetSessionIdentity(identity: SessionIdentity | undefined): void {
	if (typeof window === 'undefined' || !identity) return;
	const remembered = rememberedSessionIdentity();
	if (remembered?.memberType === identity.memberType && remembered.sid === identity.sid)
		window.localStorage.removeItem(SESSION_HINT_KEY);
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
