import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { clearSocialAuthTransaction, completeSocialAuth, readSocialAuthTransaction } from '@/libs/auth';
import Icon from '@/libs/components/common/Icon';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const SocialAuthCallbackPage = () => {
	const router = useRouter();
	const handled = useRef(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!router.isReady || handled.current) return;
		handled.current = true;
		const authorizationCode = typeof router.query.code === 'string' ? router.query.code : '';
		const returnedState = typeof router.query.state === 'string' ? router.query.state : '';
		const providerError = typeof router.query.error_description === 'string' ? router.query.error_description : typeof router.query.error === 'string' ? router.query.error : '';
		const transaction = readSocialAuthTransaction();

		const finish = async () => {
			try {
				if (providerError) throw new Error(providerError);
				if (!transaction) throw new Error('This sign-in request expired. Please start again.');
				if (!authorizationCode || !returnedState || returnedState !== transaction.state) throw new Error('The sign-in response could not be verified. Please start again.');
				window.history.replaceState({}, document.title, '/account/oauth/callback');
				await completeSocialAuth(transaction, authorizationCode);
				clearSocialAuthTransaction();
				await router.replace('/mypage');
			} catch (authError: unknown) {
				clearSocialAuthTransaction();
				setError(authError instanceof Error ? authError.message : 'Social authentication failed.');
			}
		};

		void finish();
	}, [router]);

	return <section className="clinical-oauth-callback" aria-live="polite">
		<span className={`clinical-oauth-status ${error ? 'is-error' : ''}`}><Icon name={error ? 'error' : 'verified_user'} /></span>
		<span className="clinical-section-kicker">SECURE PATIENT ACCESS</span>
		<h1>{error ? 'Sign-in was not completed' : 'Verifying your account…'}</h1>
		<p>{error || 'MN Hospital is securely completing your provider sign-in.'}</p>
		{error ? <Link className="clinical-primary-button" href="/account/signin">Back to sign in</Link> : <span className="clinical-oauth-loader" aria-hidden="true" />}
	</section>;
};

export default withLayoutMain(SocialAuthCallbackPage);
