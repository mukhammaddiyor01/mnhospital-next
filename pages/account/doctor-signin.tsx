import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { logInDoctor } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';

const DoctorSignIn = () => {
	const t = useTranslation();
	const router = useRouter();
	const [docNick, setDocNick] = useState('');
	const [docPassword, setDocPassword] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setError('');
		try {
			const doctor = await logInDoctor(docNick.trim(), docPassword);
			const destination = typeof router.query.redirect === 'string' && router.query.redirect.startsWith('/') && !router.query.redirect.startsWith('//') ? router.query.redirect : `/doctor/${doctor._id}`;
			await router.push(destination);
		} catch (err) {
			setError(err instanceof Error ? err.message : t('auth.doctorError'));
		} finally { setSubmitting(false); }
	};
	return <div className="clinical-inner-page"><section className="clinical-inner-hero"><span className="clinical-eyebrow">{t('auth.doctorPortal')}</span><h1>{t('auth.doctorWelcome')}</h1><p>{t('auth.doctorIntro')}</p></section><section className="clinical-inner-section"><form className="clinical-contact-form clinical-doctor-signin" onSubmit={submit}><label>{t('auth.doctorUsername')}<input autoComplete="username" value={docNick} onChange={(event) => setDocNick(event.target.value)} required /></label><label>{t('auth.password')}<input autoComplete="current-password" type="password" value={docPassword} onChange={(event) => setDocPassword(event.target.value)} required /></label>{error && <p className="clinical-form-error" role="alert">{error}</p>}<button className="clinical-primary-button" type="submit" disabled={submitting}>{submitting ? t('auth.signingIn') : t('auth.signin')}</button><Link href="/account/signin">{t('auth.patientSignin')}</Link></form></section></div>;
};

export default withLayoutMain(DoctorSignIn);
