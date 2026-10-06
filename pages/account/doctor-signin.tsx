import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { logInDoctor } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';

const DoctorSignIn = () => {
	const t = useTranslation();
	const router = useRouter();
	const session = useReactiveVar(userVar);
	const [docNick, setDocNick] = useState('');
	const [docPassword, setDocPassword] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const signedInDoctor = Boolean(session._id && session.memberType === MemberType.DOCTOR);
	useEffect(() => { if (signedInDoctor && !submitting) void router.replace('/mypage/dashboard'); }, [router, signedInDoctor, submitting]);
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setError('');
		try {
			await logInDoctor(docNick.trim(), docPassword);
			const destination = typeof router.query.redirect === 'string' && router.query.redirect.startsWith('/doctor-workspace/') ? router.query.redirect : '/mypage/dashboard';
			await router.replace(destination);
		} catch (err) {
			setError(err instanceof Error ? err.message : t('auth.doctorError'));
		} finally { setSubmitting(false); }
	};
	if (signedInDoctor) return <p className="clinical-query-status" role="status">{t('dashboard.loading')}</p>;
	return <div className="clinical-inner-page"><section className="clinical-inner-hero"><span className="clinical-eyebrow">{t('auth.doctorPortal')}</span><h1>{t('auth.doctorWelcome')}</h1><p>{t('auth.doctorIntro')}</p></section><section className="clinical-inner-section"><form className="clinical-contact-form clinical-doctor-signin" onSubmit={submit}><label>{t('auth.doctorUsername')}<input autoComplete="username" value={docNick} onChange={(event) => setDocNick(event.target.value)} required /></label><label>{t('auth.password')}<input autoComplete="current-password" type="password" value={docPassword} onChange={(event) => setDocPassword(event.target.value)} required /></label>{error && <p className="clinical-form-error" role="alert">{error}</p>}<button className="clinical-primary-button" type="submit" disabled={submitting}>{submitting ? t('auth.signingIn') : t('auth.signin')}</button><Link href="/account/signin">{t('auth.patientSignin')}</Link></form></section></div>;
};

export default withLayoutMain(DoctorSignIn);
