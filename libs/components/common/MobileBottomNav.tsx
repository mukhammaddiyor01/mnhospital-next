import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from './Icon';

const navigationItems = [
	{ label: 'Home', href: '/', icon: 'home' },
	{ label: 'Services', href: '/service', icon: 'medical_services' },
	{ label: 'Doctors', href: '/doctor', icon: 'stethoscope' },
	{ label: 'Articles', href: '/article', icon: 'article' },
	{ label: 'Appointments', href: '/appointment', icon: 'calendar_month' },
	{ label: 'Contact', href: '/contact', icon: 'support_agent' },
];

const MobileBottomNav = () => {
	const router = useRouter();
	const isActive = (href: string) => href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

	return <nav className="bottom-nav clinical-bottom-nav" aria-label="Primary navigation">
		{navigationItems.map((item) => <Link className={isActive(item.href) ? 'active' : ''} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} key={item.href}><Icon name={item.icon} /><span>{item.label}</span></Link>)}
	</nav>;
};

export default MobileBottomNav;
