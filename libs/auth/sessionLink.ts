import { ApolloLink, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { jwtDecode } from 'jwt-decode';
import { getJwtToken } from './token';
import {
	ensureAccessToken,
	refreshSessionToken,
	SessionRejectedError,
} from './session';

const publicAuth = new Set([
	'Login',
	'Signup',
	'SocialAuthenticate',
	'LoginDoctor',
	'LoginAdmin',
	'LoginReceptionist',
	'RefreshSession',
	'LogoutSession',
]);
function identity(token: string): string {
	try {
		const claims = jwtDecode<{ _id: string; memberType: string; sid: string }>(
			token,
		);
		return `${claims.memberType}:${claims._id}:${claims.sid}`;
	} catch {
		return '';
	}
}
export function createSessionLinks() {
	const auth = new ApolloLink(
		(operation, forward) =>
			new Observable((observer) => {
				let stopped = false;
				let subscription: { unsubscribe: () => void } | undefined;
				void (async () => {
					let token = '';
					if (!publicAuth.has(operation.operationName)) {
						try {
							token = await ensureAccessToken();
						} catch (error) {
							if (!(error instanceof SessionRejectedError)) throw error;
						}
					}
					if (stopped) return;
					const expectedAccount = operation.getContext().expectedAccount;
					if (expectedAccount && identity(token).split(':').slice(0, 2).join(':') !== expectedAccount)
						throw new SessionRejectedError('Account changed');
					operation.setContext(({ headers = {} }) => {
						const nextHeaders: Record<string, string> = {
							...headers,
							'Apollo-Require-Preflight': 'true',
						};
						delete nextHeaders.Authorization;
						if (token) nextHeaders.Authorization = `Bearer ${token}`;
						return { headers: nextHeaders, sessionToken: token };
					});
					const owner = identity(token);
					subscription = forward(operation).subscribe({
						next: (result) => {
							if (owner && owner !== identity(getJwtToken())) {
								observer.error(new SessionRejectedError('Session changed'));
								return;
							}
							observer.next(result);
						},
						error: (error) => observer.error(error),
						complete: () => observer.complete(),
					});
				})().catch((error) => {
					if (!stopped) observer.error(error);
				});
				return () => {
					stopped = true;
					subscription?.unsubscribe();
				};
			}),
	);
	const errors = onError(
		({ graphQLErrors, networkError, operation, forward }) => {
			const unauthorized = graphQLErrors?.some(
				(error) =>
					((error as { code?: string }).code ?? error.extensions?.code) ===
					'UNAUTHENTICATED',
			);
			if (
				unauthorized &&
				!publicAuth.has(operation.operationName) &&
				!operation.getContext().sessionRetried &&
				operation.getContext().sessionToken
			) {
				operation.setContext({ sessionRetried: true });
				return new Observable((observer) => {
					let stopped = false;
					let subscription: { unsubscribe: () => void } | undefined;
					const sentToken = operation.getContext().sessionToken as string;
					const renewal =
						getJwtToken() && getJwtToken() !== sentToken
							? ensureAccessToken()
							: refreshSessionToken();
					void renewal
						.then(() => {
							if (!stopped)
								subscription = forward(operation).subscribe(observer);
						})
						.catch((error) => {
							if (stopped) return;
							// Guests may still read public pages after a revoked session.
							// Private operations remain protected by the API guards.
							if (error instanceof SessionRejectedError) subscription = forward(operation).subscribe(observer);
							else observer.error(error);
						});
					return () => {
						stopped = true;
						subscription?.unsubscribe();
					};
				});
			}
			graphQLErrors?.forEach(({ message, path }) =>
				console.error(
					`[GraphQL:${operation.operationName}] ${message}`,
					path ?? '',
				),
			);
			if (networkError)
				console.error(
					`[Network:${operation.operationName}] ${networkError.message}`,
				);
		},
	);
	return { auth, errors };
}
