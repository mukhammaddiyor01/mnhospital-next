import Link from 'next/link';

const MobileBottomNav = () => <nav className="clinical-bottom-nav" aria-label="Mobile navigation"><Link className="active" href="/"><span>⌂</span><small>Home</small></Link><Link href="/service"><span>▣</span><small>Services</small></Link><Link href="/doctor"><span>♧</span><small>Doctors</small></Link><Link href="/appointment"><span>□</span><small>Appointments</small></Link><Link href="/contact"><span>◎</span><small>Contact</small></Link><Link className="clinical-bottom-book" href="/appointment">Book now</Link></nav>;

export default MobileBottomNav;
