import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { logInDoctor } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';
import Icon from '@/libs/components/common/Icon';
import StaffSignInShell from '@/libs/components/auth/StaffSignInShell';

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
	return (
		<StaffSignInShell role="doctor">
			<form className="clinical-role-signin-form" onSubmit={submit} aria-busy={submitting}>
				<label>{t('auth.doctorUsername')}
					<span className="clinical-role-signin-field"><Icon name="person" /><input autoComplete="username" value={docNick} onChange={(event) => setDocNick(event.target.value)} required /></span>
				</label>
				<label>{t('auth.password')}
					<span className="clinical-role-signin-field"><Icon name="lock" /><input autoComplete="current-password" type="password" value={docPassword} onChange={(event) => setDocPassword(event.target.value)} required /></span>
				</label>
				{error && <p className="clinical-role-signin-error" role="alert">{error}</p>}
				<button className="clinical-role-signin-submit" type="submit" disabled={submitting}><span>{submitting ? t('auth.signingIn') : t('auth.signin')}</span><Icon name={submitting ? 'hourglass_top' : 'arrow_forward'} /></button>
			</form>
		</StaffSignInShell>
	);
};

export default withLayoutMain(DoctorSignIn);
