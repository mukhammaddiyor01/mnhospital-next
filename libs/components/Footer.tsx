import Link from 'next/link';

const Footer = () => (
	<footer className="clinical-footer">
		<div className="clinical-footer-grid"><div><strong>▣ MN Hospital</strong><p>Providing compassionate, precision-driven healthcare with leading medical specialists and advanced clinical technology.</p><p>⌖ 742 Evergreen Medical Park, Sector 4<br />☎ +1 (800) 555-0199</p></div><div><strong>Quick Links</strong><Link href="/">Home</Link><Link href="/service">Medical Services</Link><Link href="/doctor">Find a Doctor</Link><Link href="/about">About MN Hospital</Link><Link href="/contact">Contact &amp; Support</Link><Link href="/appointment">Book an Appointment</Link></div><div><strong>Working Hours</strong><p>Emergency Care: <b>24/7 Available</b></p><p>Mon–Fri: 08:00 AM–08:00 PM<br />Saturday: 09:00 AM–05:00 PM<br />Sunday: 10:00 AM–02:00 PM</p><p>◉ NABH &amp; JCI Accredited Hospital</p></div></div>
		<div className="clinical-copyright"><span>© 2026 MN Hospital. All rights reserved.</span><span>Privacy Policy&nbsp;&nbsp;&nbsp; Terms of Service</span></div>
	</footer>
);

export default Footer;
