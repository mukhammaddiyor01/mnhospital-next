import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientProfile from '@/libs/components/mypage/PatientProfile';

const MyPage = () => <div className="clinical-inner-page">
	<section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">Home</Link> / My profile</div><span className="clinical-eyebrow">PATIENT PORTAL</span><h1>Your care,<br /><em>in one place.</em></h1><p>Manage your MN Hospital identity and quickly continue to the services you use most.</p></div></section>
	<PatientProfile />
</div>;

export default withLayoutMain(MyPage);
