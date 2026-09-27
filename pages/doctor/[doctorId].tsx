import { useRouter } from 'next/router';
import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';

const DoctorDetailPage = () => {
	const router = useRouter();
	const name = String(router.query.doctorId ?? 'doctor').replaceAll('-', ' ');
	return <div className="inner-page"><div className="container"><div className="placeholder-panel"><span className="eyebrow"><Icon name="stethoscope" /> Specialist profile</span><h1>{name.charAt(0).toUpperCase() + name.slice(1)}</h1><p>Doctor profile, availability, services, and reviews will be loaded from the MN Hospital GraphQL API.</p><Link className="button button-primary" href={`/appointment?doctor=${router.query.doctorId ?? ''}`}>Book an appointment <span>→</span></Link></div></div></div>;
};

export default withLayoutMain(DoctorDetailPage);
