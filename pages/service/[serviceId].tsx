import { useRouter } from 'next/router';
import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';

const ServiceDetailPage = () => {
	const router = useRouter();
	const title = String(router.query.serviceId ?? 'medical service').replaceAll('-', ' ');
	return <div className="inner-page"><div className="container"><div className="placeholder-panel"><span className="eyebrow"><Icon name="medical_services" /> Service detail</span><h1>{title.charAt(0).toUpperCase() + title.slice(1)}</h1><p>Our clinical team combines modern diagnostics with a thoughtful, patient-first experience. Service detail data will be loaded from the MN Hospital GraphQL API.</p><Link className="button button-primary" href="/appointment">Book this service <span>→</span></Link></div></div></div>;
};

export default withLayoutMain(ServiceDetailPage);
