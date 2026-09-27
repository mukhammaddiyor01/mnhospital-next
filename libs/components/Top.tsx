import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Icon from './common/Icon';

const Top = () => {
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);

	const closeMenu = () => setMenuOpen(false);

	return (
		<header className="site-header">
			<div className="utility-bar">
				<div className="container utility-inner">
					<span>Your health is our priority</span>
					<a href="tel:103"><Icon name="emergency" /> 24/7 Support: 103</a>
				</div>
			</div>
			<div className="container nav-inner">
				<Link className="brand" href="/" onClick={closeMenu}>
					<span className="brand-mark"><Icon name="health_and_safety" /></span>
					<span>MN <strong>Hospital</strong></span>
				</Link>
				<button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMenuOpen((open) => !open)}>
					<Icon name={menuOpen ? 'close' : 'menu'} />
				</button>
				<nav className={`main-navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
					<Link className={router.pathname === '/' ? 'active' : ''} href="/" onClick={closeMenu}>Home</Link>
					<Link className={router.pathname.startsWith('/service') ? 'active' : ''} href="/service" onClick={closeMenu}>Services</Link>
					<Link className={router.pathname.startsWith('/doctor') ? 'active' : ''} href="/doctor" onClick={closeMenu}>Doctors</Link>
					<Link className={router.pathname === '/about' ? 'active' : ''} href="/about" onClick={closeMenu}>About Us</Link>
					<Link className={router.pathname === '/contact' ? 'active' : ''} href="/contact" onClick={closeMenu}>Contact</Link>
					<div className="mobile-nav-actions">
						<Link className="sign-in-link" href="/account/signin" onClick={closeMenu}>Sign In</Link>
						<Link className="button button-primary" href="/appointment" onClick={closeMenu}>Book an Appointment</Link>
					</div>
				</nav>
				<div className="desktop-nav-actions">
					<Link className="sign-in-link" href="/account/signin">Sign In</Link>
					<Link className="button button-primary button-small" href="/appointment">Book an Appointment</Link>
				</div>
			</div>
		</header>
	);
};

export default Top;
