import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';

const SignInPage = () => <div className="inner-page"><div className="container auth-container"><div className="placeholder-panel auth-panel"><span className="brand"><span className="brand-mark"><Icon name="health_and_safety" /></span>MN <strong>Hospital</strong></span><span className="eyebrow">Patient portal</span><h1>Welcome back.</h1><p>Sign in to manage your appointments and care.</p><label>Email address<input type="email" placeholder="patient@example.com" /></label><label>Password<input type="password" placeholder="••••••••" /></label><button className="button button-primary">Sign in</button><small>Don't have an account? <Link href="/appointment">Book an appointment</Link></small></div></div></div>;

export default withLayoutMain(SignInPage);
