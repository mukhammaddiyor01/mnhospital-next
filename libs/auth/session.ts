import { jwtDecode } from 'jwt-decode';
import { print } from 'graphql';
import { userVar } from '@/apollo/store';
import { REFRESH_SESSION, LOGOUT_SESSION } from '@/apollo/auth/mutation';
import { GET_MY_PREFERENCES } from '@/apollo/preference/query';
import { MemberSession } from '@/libs/components/member/types/member';
import { getJwtToken, setJwtToken, removeJwtToken, endTabSession, storedSessionIdentity, waitForTabSession, publishSessionEvent, SESSION_ROLE_HEADER, SessionRole } from './token';

type Claims = MemberSession & {
	exp?: number;
	sid?: string;
	tokenType?: string;
	docNick?: string;
	docFullName?: string;
	docImage?: string;
	receptionistNick?: string;
	receptionistFullName?: string;
	receptionistImage?: string;
	adminNick?: string;
	adminImage?: string;
};
const apiUrl =
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:2001/graphql';
let pendingRefresh: Promise<string> | undefined;
let loggingOut = false;

export class SessionRejectedError extends Error {}
const HEARTBEAT_LEAD_MS = 3 * 60 * 1000;
function canRenewSession(): boolean {
	return (typeof document === 'undefined' || document.visibilityState !== 'hidden') &&
		(typeof navigator === 'undefined' || navigator.onLine !== false);
}
export function applySessionToken(token: string, member?: MemberSession): void {
	if (loggingOut) return;
	const claims = jwtDecode<Claims>(token);
	if (
		!claims.exp ||
		claims.exp * 1000 <= Date.now() ||
		!claims.sid ||
		claims.tokenType !== 'access'
	)
		throw new SessionRejectedError('Session expired');
	const previous = userVar();
	const existing =
		previous._id === claims._id && previous.memberType === claims.memberType
			? previous
			: {};
	setJwtToken(token);
	userVar({
		...existing,
		...claims,
		...member,
		_id: String(claims._id),
		memberNick:
			member?.memberNick ??
			claims.memberNick ??
			claims.docNick ??
			claims.receptionistNick ??
			claims.adminNick ??
			'',
		memberFullName:
			member?.memberFullName ??
			claims.memberFullName ??
			claims.docFullName ??
			claims.receptionistFullName,
		memberImage:
			member?.memberImage ??
			claims.memberImage ??
			claims.docImage ??
			claims.receptionistImage ??
			claims.adminImage ??
			'',
		accessToken: token,
	});
	if (
		previous._id &&
		(previous._id !== claims._id ||
			previous.memberType !== claims.memberType ||
			(previous as Claims).sid !== claims.sid)
	)
		window.dispatchEvent(new Event('mn-hospital-session-changed'));
}
export function clearSession(broadcast = true): void {
	if (broadcast) publishSessionEvent('logout');
	removeJwtToken();
	endTabSession();
	userVar({ _id: '', memberNick: '' });
	window.dispatchEvent(new Event('mn-hospital-session-ended'));
}
export function hasStoredSession(): boolean {
	return (
		typeof window !== 'undefined' &&
		Boolean(storedSessionIdentity())
	);
}
export async function withBrowserSessionLock<T>(
	action: () => Promise<T>,
	role: SessionRole | undefined = storedSessionIdentity()?.memberType,
): Promise<T> {
	// Same-role tabs share one HttpOnly cookie; different roles rotate independently.
	if (typeof navigator !== 'undefined' && navigator.locks)
		return navigator.locks.request(`mn-hospital-auth-session-${role ?? 'legacy'}`, action);
	return action();
}
async function requestSession(action: 'check' | 'refresh' | 'logout') {
	const identity = storedSessionIdentity();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);
	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			credentials: 'include',
			signal: controller.signal,
			headers: {
				'Content-Type': 'application/json',
				'Apollo-Require-Preflight': 'true',
				...(identity ? { [SESSION_ROLE_HEADER]: identity.memberType } : {}),
				...(getJwtToken()
					? { Authorization: `Bearer ${getJwtToken()}` }
					: {}),
			},
			body: JSON.stringify({
				query: print({ check: GET_MY_PREFERENCES, refresh: REFRESH_SESSION, logout: LOGOUT_SESSION }[action]),
			}),
		});
		const body = await response.json();
		if (
			body.errors?.some(
				(error: { code?: string; extensions?: { code?: string } }) =>
					['UNAUTHENTICATED', 'FORBIDDEN'].includes(
						error.code ?? error.extensions?.code ?? '',
					),
			)
		)
			throw new SessionRejectedError('Session is unavailable');
		if (!response.ok || body.errors?.length || !body.data)
			throw new Error('Session request failed');
		return body.data;
	} finally {
		clearTimeout(timeout);
	}
}
export function refreshSessionToken(): Promise<string> {
	if (loggingOut)
		return Promise.reject(new SessionRejectedError('Logout is in progress'));
	if (pendingRefresh) return pendingRefresh;
	if (!canRenewSession()) return Promise.reject(new Error('Session renewal waits for an online visible tab'));
	const expected = storedSessionIdentity();
	const sameSession = () => {
		const current = storedSessionIdentity();
		return Boolean(expected && current?.sid === expected.sid && current.memberType === expected.memberType);
	};
	pendingRefresh = withBrowserSessionLock(async () => {
		if (!canRenewSession()) throw new Error('Session renewal waits for an online visible tab');
		if (loggingOut || !hasStoredSession() || !sameSession())
			throw new SessionRejectedError('No login session');
		const data = await requestSession('refresh');
		if (!data.refreshSession?.accessToken)
			throw new SessionRejectedError('Session is unavailable');
		const renewed = jwtDecode<Claims>(data.refreshSession.accessToken);
		if (!sameSession() || !expected || renewed.memberType !== expected.memberType || renewed.sid !== expected.sid)
			throw new SessionRejectedError('Session was replaced');
		applySessionToken(data.refreshSession.accessToken);
		return data.refreshSession.accessToken as string;
	})
		.catch((error) => {
			if (error instanceof SessionRejectedError && !loggingOut && sameSession()) clearSession();
			throw error;
		})
		.finally(() => {
			pendingRefresh = undefined;
		});
	return pendingRefresh;
}
function hasUsableAccessToken(token: string): boolean {
	try {
		const claims = jwtDecode<Claims>(token);
		return Boolean(claims.sid && claims.tokenType === 'access' &&
			Number.isFinite(claims.exp) && claims.exp! * 1000 > Date.now() + 60000);
	} catch {
		return false;
	}
}
export async function renewVisibleSession(): Promise<void> {
	await waitForTabSession();
	if (!canRenewSession() || !hasStoredSession() || loggingOut) return;
	const access = getJwtToken();
	try {
		const claims = jwtDecode<Claims>(access);
		if (claims.tokenType === 'access' && claims.sid && Number.isFinite(claims.exp) &&
			claims.exp! * 1000 > Date.now() + HEARTBEAT_LEAD_MS) return;
	} catch {
		// A remembered cookie can restore an expired or missing tab access token.
	}
	await refreshSessionToken();
}
export async function ensureAccessToken(): Promise<string> {
	if (typeof window === 'undefined' || loggingOut) return '';
	await waitForTabSession();
	const token = getJwtToken();
	if (hasUsableAccessToken(token)) return token;
	if (!hasStoredSession()) return '';
	return refreshSessionToken();
}
export async function restoreSession(): Promise<void> {
	await waitForTabSession();
	if (loggingOut || !hasStoredSession() || !canRenewSession()) return;
	const savedToken = getJwtToken();
	const savedIdentity = storedSessionIdentity();
	try {
		if (hasUsableAccessToken(savedToken)) {
			// Guards verify session revocation and active role/profile using the bearer token.
			// Reloading a valid session does not need to rotate its refresh cookie.
			const data = await requestSession('check');
			if (!data.getMyPreferences) throw new Error('Session check failed');
			if (!loggingOut && getJwtToken() === savedToken) applySessionToken(savedToken);
		} else {
			await refreshSessionToken();
		}
	} catch (error) {
		// A response for the old account must not restore or clear a replacement session.
		const currentIdentity = storedSessionIdentity();
		if (loggingOut || getJwtToken() !== savedToken || currentIdentity?.memberType !== savedIdentity?.memberType || currentIdentity?.sid !== savedIdentity?.sid) return;
		if (error instanceof SessionRejectedError) {
			clearSession();
			return;
		}
		// Connection failures keep local credentials so a later request can retry.
		try {
			applySessionToken(savedToken);
		} catch {
			/* Wait for a successful connection. */
		}
	}
}
export async function revokeBrowserSession(): Promise<void> {
	loggingOut = true;
	try {
		// Also wait within this tab when the browser does not provide Web Locks.
		await pendingRefresh?.catch(() => undefined);
		await withBrowserSessionLock(async () => {
			await requestSession('logout');
			clearSession();
		});
	} finally {
		loggingOut = false;
	}
}
