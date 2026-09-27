import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { logIn } from '@/libs/auth';

const SignInPage = () => {
	const router = useRouter();
	const [memberNick, setMemberNick] = useState('');
	const [memberPassword, setMemberPassword] = useState('');
	const [error, setError] = useState('');
	const submitHandler = async (event: FormEvent) => { event.preventDefault(); setError(''); try { await logIn(memberNick, memberPassword); await router.push('/'); } catch (err: any) { setError(err.message ?? 'Unable to sign in'); } };
	return <div className="inner-page"><div className="container auth-container"><form className="placeholder-panel auth-panel" onSubmit={submitHandler}><span className="brand"><span className="brand-mark"><Icon name="health_and_safety" /></span>MN <strong>Hospital</strong></span><span className="eyebrow">Patient portal</span><h1>Welcome back.</h1><p>Sign in to manage your appointments and care.</p><label>Username<input value={memberNick} onChange={(event) => setMemberNick(event.target.value)} placeholder="patient01" required /></label><label>Password<input value={memberPassword} onChange={(event) => setMemberPassword(event.target.value)} type="password" placeholder="••••••••" required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" type="submit">Sign in</button><small>Don't have an account? <Link href="/account/join">Create an account</Link></small></form></div></div>;
};

export default withLayoutMain(SignInPage);
