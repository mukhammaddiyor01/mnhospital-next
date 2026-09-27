import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, NormalizedCacheObject, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { getJwtToken } from '@/libs/auth/token';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;
const apiUrl = process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:3007/graphql';

function getHeaders(): Record<string, string> {
	const token = getJwtToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function createApolloLink() {
	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({ headers: { ...headers, ...getHeaders() } }));
		return forward(operation);
	});
	const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
		graphQLErrors?.forEach(({ message, path }) => console.error(`[GraphQL:${operation.operationName}] ${message}`, path ?? ''));
		if (networkError) console.error(`[Network:${operation.operationName}] ${networkError.message}`);
	});
	const uploadLink = createUploadLink({ uri: apiUrl, credentials: 'same-origin' });
	return from([errorLink, authLink.concat(uploadLink)]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createApolloLink(),
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						getServices: { merge: false },
						getDoctors: { merge: false },
						getArticles: { merge: false },
					},
				},
			},
		}),
		devtools: { enabled: process.env.NODE_ENV !== 'production' },
	});
}

export function initializeApollo(initialState?: NormalizedCacheObject) {
	const client = apolloClient ?? createApolloClient();
	if (initialState) client.cache.restore(initialState);
	if (typeof window === 'undefined') return client;
	if (!apolloClient) apolloClient = client;
	return client;
}

export function useApollo(initialState?: NormalizedCacheObject) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
