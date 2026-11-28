import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { clearSocialAuthTransaction, completeSocialAuth, readSocialAuthTransaction } from '@/libs/auth';
import Icon from '@/libs/components/common/Icon';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { useTranslation } from '@/libs/i18n/useTranslation';

type CallbackError = { code: 'expired' | 'unverified' | 'failed' } | { message: string };

const SocialAuthCallbackPage = () => {
	const t = useTranslation();
	const router = useRouter();
	const handled = useRef(false);
	const [error, setError] = useState<CallbackError | null>(null);
	const errorMessage = error && ('message' in error ? error.message : error.code === 'expired' ? t('auth.oauthExpired') : error.code === 'unverified' ? t('auth.oauthUnverified') : t('auth.oauthFailed'));

	useEffect(() => {
		if (!router.isReady || handled.current) return;
		handled.current = true;
		const authorizationCode = typeof router.query.code === 'string' ? router.query.code : '';
		const returnedState = typeof router.query.state === 'string' ? router.query.state : '';
		const providerError = typeof router.query.error_description === 'string' ? router.query.error_description : typeof router.query.error === 'string' ? router.query.error : '';
		const transaction = readSocialAuthTransaction();

		const finish = async () => {
			try {
				if (providerError) { setError({ message: providerError }); return; }
				if (!transaction) { setError({ code: 'expired' }); return; }
				if (!authorizationCode || !returnedState || returnedState !== transaction.state) { setError({ code: 'unverified' }); return; }
				window.history.replaceState({}, document.title, '/account/oauth/callback');
				await completeSocialAuth(transaction, authorizationCode);
				await router.replace('/mypage');
			} catch (authError: unknown) {
				setError(authError instanceof Error ? { message: authError.message } : { code: 'failed' });
			} finally {
				clearSocialAuthTransaction();
			}
		};

		void finish();
	}, [router]);

	return <section className="clinical-oauth-callback" aria-live="polite">
		<span className={`clinical-oauth-status ${error ? 'is-error' : ''}`}><Icon name={error ? 'error' : 'verified_user'} /></span>
		<span className="clinical-section-kicker">{t('auth.oauthKicker')}</span>
		<h1>{error ? t('auth.oauthIncomplete') : t('auth.oauthVerifying')}</h1>
		<p>{errorMessage || t('auth.oauthProgress')}</p>
		{error ? <Link className="clinical-primary-button" href="/account/signin">{t('auth.oauthBack')}</Link> : <span className="clinical-oauth-loader" aria-hidden="true" />}
	</section>;
};

export default withLayoutMain(SocialAuthCallbackPage);
