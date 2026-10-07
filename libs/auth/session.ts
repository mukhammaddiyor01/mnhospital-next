import { jwtDecode } from 'jwt-decode';
import { print } from 'graphql';
import { userVar } from '@/apollo/store';
import { REFRESH_SESSION, LOGOUT_SESSION } from '@/apollo/auth/mutation';
import { MemberSession } from '@/libs/components/member/types/member';
import { getJwtToken, setJwtToken, removeJwtToken } from './token';

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
const SESSION_MARKER = 'mn-hospital-session';
let pendingRefresh: Promise<string> | undefined;
let loggingOut = false;

export class SessionRejectedError extends Error {}
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
	window.localStorage.setItem(SESSION_MARKER, 'true');
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
	removeJwtToken();
	window.localStorage.removeItem(SESSION_MARKER);
	if (broadcast) window.localStorage.setItem('logout', Date.now().toString());
	userVar({ _id: '', memberNick: '' });
	window.dispatchEvent(new Event('mn-hospital-session-ended'));
}
export function hasStoredSession(): boolean {
	return (
		typeof window !== 'undefined' &&
		Boolean(getJwtToken() || window.localStorage.getItem(SESSION_MARKER))
	);
}
export async function withBrowserSessionLock<T>(
	action: () => Promise<T>,
): Promise<T> {
	// Cookies are shared by tabs. Serialize rotation/logout across tabs when Web Locks are available.
	if (typeof navigator !== 'undefined' && navigator.locks)
		return navigator.locks.request('mn-hospital-auth-session', action);
	return action();
}
async function requestSession(refresh: boolean) {
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
				...(!refresh && getJwtToken()
					? { Authorization: `Bearer ${getJwtToken()}` }
					: {}),
			},
			body: JSON.stringify({
				query: print(refresh ? REFRESH_SESSION : LOGOUT_SESSION),
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
	pendingRefresh = withBrowserSessionLock(async () => {
		if (loggingOut || !hasStoredSession())
			throw new SessionRejectedError('No login session');
		const data = await requestSession(true);
		if (!data.refreshSession?.accessToken)
			throw new SessionRejectedError('Session is unavailable');
		applySessionToken(data.refreshSession.accessToken);
		return data.refreshSession.accessToken as string;
	})
		.catch((error) => {
			if (error instanceof SessionRejectedError && !loggingOut) clearSession();
			throw error;
		})
		.finally(() => {
			pendingRefresh = undefined;
		});
	return pendingRefresh;
}
export async function ensureAccessToken(): Promise<string> {
	if (typeof window === 'undefined' || loggingOut) return '';
	const token = getJwtToken();
	if (token) {
		try {
			const claims = jwtDecode<Claims>(token);
			if (
				claims.sid &&
				claims.tokenType === 'access' &&
				claims.exp &&
				claims.exp * 1000 > Date.now() + 60000
			)
				return token;
		} catch {
			/* Restore with the server-owned cookie. */
		}
	}
	if (!hasStoredSession()) return '';
	return refreshSessionToken();
}
export async function restoreSession(): Promise<void> {
	if (!hasStoredSession()) return;
	try {
		await refreshSessionToken();
	} catch (error) {
		// Connection failures keep local credentials so a later request can retry.
		if (!(error instanceof SessionRejectedError)) {
			try {
				applySessionToken(getJwtToken());
			} catch {
				/* Wait for a successful connection. */
			}
		}
	}
}
export async function revokeBrowserSession(): Promise<void> {
	loggingOut = true;
	try {
		// Also wait within this tab when the browser does not provide Web Locks.
		await pendingRefresh?.catch(() => undefined);
		await withBrowserSessionLock(async () => {
			await requestSession(false);
			clearSession();
		});
	} finally {
		loggingOut = false;
	}
}
