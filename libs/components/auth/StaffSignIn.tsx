import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { logInAdmin, logInReceptionist } from '@/libs/auth';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import Icon from '@/libs/components/common/Icon';
import StaffSignInShell from './StaffSignInShell';

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

  return (
    <StaffSignInShell role={role}>
      <form className="clinical-role-signin-form" onSubmit={submit} aria-busy={submitting}>
        <label>{t('dashboard.username')}
          <span className="clinical-role-signin-field"><Icon name={isAdmin ? 'terminal' : 'person'} /><input autoComplete="username" value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={isAdmin ? 3 : undefined} maxLength={isAdmin ? 30 : undefined} required /></span>
        </label>
        <label>{t('auth.password')}
          <span className="clinical-role-signin-field"><Icon name="lock" /><input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={isAdmin ? 8 : undefined} maxLength={isAdmin ? 32 : undefined} required /></span>
        </label>
        {error && <p className="clinical-role-signin-error" role="alert">{error}</p>}
        <button className="clinical-role-signin-submit" type="submit" disabled={submitting}><span>{submitting ? t('auth.signingIn') : t('auth.signin')}</span><Icon name={submitting ? 'hourglass_top' : 'arrow_forward'} /></button>
      </form>
    </StaffSignInShell>
  );
};

export default StaffSignIn;
