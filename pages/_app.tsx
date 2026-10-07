import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useApollo } from '@/apollo/client';
import { createQueryClient } from '@/libs/query/query-client';
import { PreferenceProvider } from '@/libs/components/preference/PreferenceProvider';
import SessionBootstrap from '@/libs/components/auth/SessionBootstrap';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import '@/scss/app.scss';

export default function App({ Component, pageProps }: AppProps) {
	const apolloClient = useApollo(pageProps.initialApolloState);
	const [queryClient] = useState(createQueryClient);

	return (
		<ApolloProvider client={apolloClient}>
			<QueryClientProvider client={queryClient}>
				<SessionBootstrap>
					<PreferenceProvider>
						<Component {...pageProps} />
					</PreferenceProvider>
				</SessionBootstrap>
			</QueryClientProvider>
		</ApolloProvider>
	);
}
