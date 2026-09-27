import Link from 'next/link';
import Icon from './common/Icon';

const Footer = () => (
	<footer className="site-footer">
		<div className="container footer-grid">
			<div className="footer-brand">
				<Link className="brand brand-light" href="/">
					<span className="brand-mark"><Icon name="health_and_safety" /></span>
					<span>MN <strong>Hospital</strong></span>
				</Link>
				<p>Clinical precision and empathetic care, designed around every patient.</p>
			</div>
			<div>
				<h4>Explore</h4>
				<Link href="/service">Services</Link>
				<Link href="/doctor">Doctors</Link>
				<Link href="/about">About Us</Link>
			</div>
			<div>
				<h4>Support</h4>
				<Link href="/contact">Contact</Link>
				<Link href="/account/signin">Patient Portal</Link>
				<a href="tel:103">Emergency 103</a>
			</div>
			<div className="footer-info">
				<h4>Information</h4>
				<p><Icon name="schedule" /> Mon–Sun, 24/7</p>
				<p><Icon name="location_on" /> Tashkent, Chilanzar district</p>
				<p><Icon name="call" /> +998 71 200 00 00</p>
			</div>
		</div>
		<div className="container footer-bottom">
			<span>© {new Date().getFullYear()} MN Hospital. All rights reserved.</span>
			<span>Privacy Policy · Terms of Service</span>
		</div>
	</footer>
);

export default Footer;
