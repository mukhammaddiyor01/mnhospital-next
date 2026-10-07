import { useMemo } from 'react';
import {
	ApolloClient,
	InMemoryCache,
	NormalizedCacheObject,
	from,
} from '@apollo/client';
import { createSessionLinks } from '@/libs/auth/sessionLink';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;
const apiUrl =
	process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:2001/graphql';

function createApolloLink() {
	const { auth, errors } = createSessionLinks();
	const uploadLink = createUploadLink({
		uri: apiUrl,
		credentials: 'include',
		headers: { 'Apollo-Require-Preflight': 'true' },
	});
	return from([errors, auth, uploadLink]);
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
