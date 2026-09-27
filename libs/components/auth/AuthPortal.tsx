import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { logIn, signUp } from '@/libs/auth';
import Icon from '@/libs/components/common/Icon';
import SocialAuthButtons from './SocialAuthButtons';

type AuthMode = 'login' | 'register';

const AuthPortal = ({ initialMode }: { initialMode: AuthMode }) => {
	const router = useRouter();
	const [mode, setMode] = useState<AuthMode>(initialMode);
	const [showLoginPassword, setShowLoginPassword] = useState(false);
	const [showRegisterPassword, setShowRegisterPassword] = useState(false);
	const [loginForm, setLoginForm] = useState({ memberNick: '', memberPassword: '' });
	const [registerForm, setRegisterForm] = useState({ memberFullName: '', memberNick: '', memberPhone: '', memberPassword: '' });
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const switchMode = (nextMode: AuthMode) => {
		setError('');
		setMode(nextMode);
	};
	const submitLogin = async (event: FormEvent) => {
		event.preventDefault();
		setError('');
		setSubmitting(true);
		try {
			await logIn(loginForm.memberNick, loginForm.memberPassword);
			await router.push('/mypage');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Unable to sign in. Please check your details.');
		} finally { setSubmitting(false); }
	};
	const submitRegister = async (event: FormEvent) => {
		event.preventDefault();
		setError('');
		setSubmitting(true);
		try {
			await signUp(registerForm.memberNick, registerForm.memberPassword, registerForm.memberPhone, registerForm.memberFullName);
			await router.push('/mypage');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Unable to create your patient account.');
		} finally { setSubmitting(false); }
	};

	return <div className="clinical-auth-page">
		<div className={`clinical-auth-card ${mode === 'register' ? 'is-register' : ''}`}>
			<div className="clinical-auth-visual" aria-live="polite">
				<div className="clinical-auth-visual-content clinical-auth-welcome-register"><span className="clinical-auth-shield"><Icon name="health_and_safety" /></span><span className="clinical-auth-kicker">ALREADY A PATIENT?</span><h2>Welcome back.</h2><p>Sign in to review appointments and continue your care journey.</p><button type="button" onClick={() => switchMode('login')}>Sign In</button></div>
				<div className="clinical-auth-visual-content clinical-auth-welcome-login"><span className="clinical-auth-shield"><Icon name="favorite" /></span><span className="clinical-auth-kicker">NEW TO MN HOSPITAL?</span><h2>Hello there.</h2><p>Create your secure patient account and manage care in one place.</p><button type="button" onClick={() => switchMode('register')}>Create Account</button></div>
			</div>

			<form className="clinical-auth-form clinical-login-form" onSubmit={submitLogin} aria-hidden={mode !== 'login'}>
				<Link className="clinical-auth-brand" href="/"><span><Icon name="local_hospital" /></span><strong>MN Hospital</strong></Link>
				<span className="clinical-section-kicker">PATIENT PORTAL</span><h1>Sign in</h1><p>Use your patient username and password.</p>
				<label>Username<div className="clinical-auth-field"><Icon name="person" /><input autoComplete="username" value={loginForm.memberNick} onChange={(event) => setLoginForm({ ...loginForm, memberNick: event.target.value })} placeholder="patient01" required /></div></label>
				<label>Password<div className="clinical-auth-field"><Icon name="lock" /><input autoComplete="current-password" value={loginForm.memberPassword} onChange={(event) => setLoginForm({ ...loginForm, memberPassword: event.target.value })} type={showLoginPassword ? 'text' : 'password'} placeholder="••••••••" required /><button type="button" onClick={() => setShowLoginPassword((value) => !value)} aria-label={showLoginPassword ? 'Hide password' : 'Show password'}><Icon name={showLoginPassword ? 'visibility' : 'visibility_off'} /></button></div></label>
				{mode === 'login' && error ? <p className="clinical-auth-error" role="alert">{error}</p> : null}
				<button className="clinical-auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign In'} <Icon name="arrow_forward" /></button>
				<SocialAuthButtons mode="login" disabled={submitting} onError={setError} />
				<button className="clinical-auth-mobile-switch" type="button" onClick={() => switchMode('register')}>New patient? <b>Create account</b></button>
			</form>

			<form className="clinical-auth-form clinical-register-form" onSubmit={submitRegister} aria-hidden={mode !== 'register'}>
				<Link className="clinical-auth-brand" href="/"><span><Icon name="local_hospital" /></span><strong>MN Hospital</strong></Link>
				<span className="clinical-section-kicker">SECURE REGISTRATION</span><h1>Create account</h1><p>Register once to book and manage your care.</p>
				<div className="clinical-auth-form-grid"><label>Full name<div className="clinical-auth-field"><Icon name="badge" /><input autoComplete="name" value={registerForm.memberFullName} onChange={(event) => setRegisterForm({ ...registerForm, memberFullName: event.target.value })} placeholder="Jane Doe" required /></div></label><label>Phone number<div className="clinical-auth-field"><Icon name="call" /><input autoComplete="tel" value={registerForm.memberPhone} onChange={(event) => setRegisterForm({ ...registerForm, memberPhone: event.target.value })} placeholder="+998 90 000 00 00" required /></div></label></div>
				<label>Username<div className="clinical-auth-field"><Icon name="person" /><input autoComplete="username" value={registerForm.memberNick} onChange={(event) => setRegisterForm({ ...registerForm, memberNick: event.target.value })} placeholder="patient01" required /></div></label>
				<label>Password<div className="clinical-auth-field"><Icon name="lock" /><input autoComplete="new-password" value={registerForm.memberPassword} onChange={(event) => setRegisterForm({ ...registerForm, memberPassword: event.target.value })} type={showRegisterPassword ? 'text' : 'password'} placeholder="••••••••" minLength={6} required /><button type="button" onClick={() => setShowRegisterPassword((value) => !value)} aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}><Icon name={showRegisterPassword ? 'visibility' : 'visibility_off'} /></button></div></label>
				{mode === 'register' && error ? <p className="clinical-auth-error" role="alert">{error}</p> : null}
				<button className="clinical-auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : 'Create Account'} <Icon name="arrow_forward" /></button>
				<SocialAuthButtons mode="register" disabled={submitting} onError={setError} />
				<button className="clinical-auth-mobile-switch" type="button" onClick={() => switchMode('login')}>Already registered? <b>Sign in</b></button>
			</form>
		</div>
		<div className="clinical-auth-trust"><span><Icon name="lock" /> Secure patient access</span><span><Icon name="verified_user" /> Privacy-first records</span><span><Icon name="support_agent" /> 24/7 care support</span></div>
	</div>;
};

export default AuthPortal;
