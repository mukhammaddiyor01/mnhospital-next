import Link from 'next/link';
import Icon from './Icon';

const MobileBottomNav = () => <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><Link href="/"><Icon name="home" /><span>Home</span></Link><Link href="/appointment"><Icon name="event" /><span>Book</span></Link><Link href="/doctor"><Icon name="stethoscope" /><span>Doctors</span></Link><Link href="/account/signin"><Icon name="person" /><span>Profile</span></Link></nav>;

export default MobileBottomNav;
