import Link from 'next/link';
import { useRouter } from 'next/router';

const MobileBottomNav = () => {
	const router = useRouter();

	const bookNow = () => {
		if (router.pathname === '/') {
			document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
			return;
		}
		void router.push('/appointment');
	};

	return <nav className="bottom-nav clinical-bottom-nav" aria-label="Mobile navigation"><Link className="active" href="/#home"><span>⌂</span><span>Home</span></Link><Link href="/#departments"><span>▣</span><span>Services</span></Link><Link href="/#doctors"><span>♧</span><span>Doctors</span></Link><Link href="/#booking"><span>□</span><span>Appointments</span></Link><Link href="/contact"><span>◎</span><span>Contact</span></Link><button className="bottom-book clinical-bottom-book" onClick={bookNow}>Book now</button></nav>;
};

export default MobileBottomNav;
