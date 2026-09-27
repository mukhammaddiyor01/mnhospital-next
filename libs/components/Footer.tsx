import Link from 'next/link';

const Footer = () => (
	<footer className="clinical-footer">
		<div className="clinical-footer-grid"><div><strong>MN Hospital</strong><p>Compassionate, precision-driven healthcare with leading specialists and advanced clinical technology.</p></div><div><strong>Quick links</strong><Link href="/service">Medical services</Link><Link href="/doctor">Find a doctor</Link><Link href="/appointment">Book appointment</Link></div><div><strong>Working hours</strong><p>Emergency care: <b>24/7 available</b></p><p>Mon–Fri: 08:00–20:00</p><p>Tashkent · International care desk</p></div></div>
	</footer>
);

export default Footer;
