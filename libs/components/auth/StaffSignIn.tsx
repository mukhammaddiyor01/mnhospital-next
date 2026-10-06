import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { logInAdmin, logInReceptionist } from '@/libs/auth';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const StaffSignIn = ({ role }: { role: 'admin' | 'receptionist' }) => {
  const t = useTranslation();
  const router = useRouter();
  const session = useReactiveVar(userVar);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = role === 'admin';
  const signedInForRole = Boolean(session._id) && session.memberType === (isAdmin ? MemberType.ADMIN : MemberType.RECEPTIONIST);
  useEffect(() => { if (signedInForRole && !submitting) void router.replace('/mypage/dashboard'); }, [router, signedInForRole, submitting]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (isAdmin) await logInAdmin(nickname.trim(), password);
      else await logInReceptionist(nickname.trim(), password);
      await router.replace('/mypage/dashboard');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('dashboard.signinError'));
    } finally { setSubmitting(false); }
  };

  if (signedInForRole) return <p className="clinical-query-status" role="status">{t('dashboard.loading')}</p>;

  return <div className="clinical-inner-page"><section className="clinical-inner-hero"><span className="clinical-eyebrow">{t('dashboard.kicker')}</span><h1>{isAdmin ? t('dashboard.adminTitle') : t('dashboard.receptionistTitle')}</h1><p>{t('dashboard.signinIntro')}</p></section><section className="clinical-inner-section"><form className="clinical-contact-form clinical-doctor-signin" onSubmit={submit}><label>{t('dashboard.username')}<input autoComplete="username" value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={isAdmin ? 3 : undefined} maxLength={isAdmin ? 30 : undefined} required /></label><label>{t('auth.password')}<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={isAdmin ? 8 : undefined} maxLength={isAdmin ? 32 : undefined} required /></label>{error && <p className="clinical-form-error" role="alert">{error}</p>}<button className="clinical-primary-button" type="submit" disabled={submitting}>{submitting ? t('auth.signingIn') : t('auth.signin')}</button><Link href="/account/signin">{t('auth.patientSignin')}</Link></form></section></div>;
};

export default StaffSignIn;
