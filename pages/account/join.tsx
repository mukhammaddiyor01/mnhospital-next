import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { signUp } from '@/libs/auth';

const JoinPage = () => {
	const router = useRouter();
	const [form, setForm] = useState({ memberNick: '', memberPassword: '', memberPhone: '', memberFullName: '' });
	const [error, setError] = useState('');
	const submitHandler = async (event: FormEvent) => { event.preventDefault(); setError(''); try { await signUp(form.memberNick, form.memberPassword, form.memberPhone, form.memberFullName); await router.push('/'); } catch (err: any) { setError(err.message ?? 'Unable to create account'); } };
	return <div className="inner-page"><div className="container auth-container"><form className="placeholder-panel auth-panel" onSubmit={submitHandler}><span className="brand"><span className="brand-mark"><Icon name="health_and_safety" /></span>MN <strong>Hospital</strong></span><span className="eyebrow">Patient portal</span><h1>Create account.</h1><p>Start managing appointments and your care history online.</p>{[['memberFullName', 'Full name', 'Jane Doe'], ['memberNick', 'Username', 'patient01'], ['memberPhone', 'Phone number', '+998 90 000 00 00'], ['memberPassword', 'Password', '••••••••']].map(([key, label, placeholder]) => <label key={key}>{label}<input type={key === 'memberPassword' ? 'password' : 'text'} value={form[key as keyof typeof form]} placeholder={placeholder} onChange={(event) => setForm({ ...form, [key]: event.target.value })} required /></label>)}{error && <p className="form-error">{error}</p>}<button className="button button-primary" type="submit">Create account</button><small>Already registered? <Link href="/account/signin">Sign in</Link></small></form></div></div>;
};

export default withLayoutMain(JoinPage);
