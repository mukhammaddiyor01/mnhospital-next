import { jwtDecode } from 'jwt-decode';

const ACCESS_TOKEN_KEY = 'mn-hospital-tab-access-token';
export const SESSION_ROLE_HEADER = 'X-MN-Session-Role';
export const SESSION_EVENT_KEY = 'mn-hospital-role-session-event';
export type SessionRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
export function getJwtToken(): string {
	if (typeof window === 'undefined') return '';
	return window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ?? '';
}
export function setJwtToken(token: string): void {
	if (typeof window !== 'undefined') window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}
export function removeJwtToken(): void {
	if (typeof window !== 'undefined') window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
export function storedSessionIdentity(): { memberType: SessionRole; sid: string } | undefined {
	try {
		const claims = jwtDecode<{ memberType: SessionRole; sid: string }>(getJwtToken());
		if (['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN'].includes(claims.memberType) && claims.sid)
			return claims;
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
