import UnreadProvider from '@/libs/components/notification/UnreadProvider';
import type { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useApollo } from '@/apollo/client';
import { createQueryClient } from '@/libs/query/query-client';
import { PreferenceProvider } from '@/libs/components/preference/PreferenceProvider';
import SessionBootstrap from '@/libs/components/auth/SessionBootstrap';
import { useRouter } from 'next/router';
import SeoHead from '@/libs/components/seo/SeoHead';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import '@/scss/app.scss';

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const apolloClient = useApollo(pageProps.initialApolloState);
	const [queryClient] = useState(createQueryClient);

	return (
		<>
			<SeoHead asPath={router.pathname === '/404' || router.pathname === '/_error' ? router.pathname : router.asPath} meta={pageProps.seo} />
			<ApolloProvider client={apolloClient}>
				<QueryClientProvider client={queryClient}>
					<SessionBootstrap>
						<PreferenceProvider>
							<UnreadProvider><Component {...pageProps} /></UnreadProvider>
						</PreferenceProvider>
					</SessionBootstrap>
				</QueryClientProvider>
			</ApolloProvider>
		</>
	);
}
