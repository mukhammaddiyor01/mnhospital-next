import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import Icon from './common/Icon';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';

const Top = () => {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const user = useReactiveVar(userVar);

	const closeMenu = () => setMenuOpen(false);
	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const input = event.currentTarget.elements.namedItem('globalSearch') as HTMLInputElement;
		void router.push(input.value.trim() ? `/doctor?search=${encodeURIComponent(input.value.trim())}` : '/doctor');
	};
	const initials = user.memberFullName?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MK';

	return (
		<header className="clinical-header">
			<div className="clinical-header-inner">
				<Link className="clinical-brand" href="/" onClick={closeMenu}><span className="clinical-brand-icon">+</span><span><strong>MN Hospital</strong><small>Clinical Care</small></span></Link>
				<form className="clinical-header-search" onSubmit={searchHandler}><span>⌕</span><input name="globalSearch" placeholder="Search doctors, treatments, services..." aria-label="Search doctors, treatments, services" /></form>
				<nav className="clinical-desktop-navigation" aria-label="Main navigation"><Link className={router.pathname === '/' ? 'active' : ''} href="/">Home</Link><Link className={router.pathname.startsWith('/service') ? 'active' : ''} href="/service">Services</Link><Link className={router.pathname.startsWith('/doctor') ? 'active' : ''} href="/doctor">Doctors</Link><Link className={router.pathname === '/about' ? 'active' : ''} href="/about">About us</Link><Link className={router.pathname === '/contact' ? 'active' : ''} href="/contact">Contact</Link></nav>
				<button className="clinical-mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
				<div className="clinical-header-actions"><Link className="clinical-book-top" href="/appointment">Book appointment</Link>{user._id ? <button className="clinical-profile" title="Log out" onClick={logOut}>{initials}</button> : <Link className="clinical-profile" href="/account/signin">{initials}</Link>}</div>
			</div>
			<nav className={`clinical-mobile-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
				<Link className={router.pathname === '/' ? 'active' : ''} href="/" onClick={closeMenu}>Home</Link><Link className={router.pathname.startsWith('/service') ? 'active' : ''} href="/service" onClick={closeMenu}>Services</Link><Link className={router.pathname.startsWith('/doctor') ? 'active' : ''} href="/doctor" onClick={closeMenu}>Doctors</Link><Link className={router.pathname === '/about' ? 'active' : ''} href="/about" onClick={closeMenu}>About us</Link><Link className={router.pathname === '/contact' ? 'active' : ''} href="/contact" onClick={closeMenu}>Contact</Link><Link href="/account/signin" onClick={closeMenu}>Sign in</Link>
			</nav>
		</header>
	);
};

export default Top;
