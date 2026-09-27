import { useMemo } from 'react';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, NormalizedCacheObject, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function createApolloClient() {
	const authLink = new ApolloLink((operation, forward) => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
		operation.setContext(({ headers = {} }) => ({ headers: { ...headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) } }));
		return forward(operation);
	});
	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors) graphQLErrors.forEach((error) => console.error('[GraphQL error]', error.message));
		if (networkError) console.error('[Network error]', networkError.message);
	});
	const httpLink = new HttpLink({ uri: process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:3007/graphql' });

	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: from([errorLink, authLink.concat(httpLink)]),
		cache: new InMemoryCache(),
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
