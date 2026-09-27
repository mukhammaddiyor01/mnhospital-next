import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '@/apollo/service/query';
import Icon from '../common/Icon';
import SectionHeading from '../common/SectionHeading';
import LikeButton from '../common/LikeButton';
import { LIKE_TARGET_SERVICE } from '@/apollo/service/mutation';
import { formatKrw } from '../common/currency';

const fallback = [
	{ _id: 'cardiology', serviceTitle: 'Cardiology', serviceDesc: 'Heart health, diagnostics, and treatment plans.', servicePrice: 250000, icon: 'favorite' },
	{ _id: 'laboratory', serviceTitle: 'Laboratory', serviceDesc: 'Fast and accurate clinical testing.', servicePrice: 80000, icon: 'science' },
	{ _id: 'general-medicine', serviceTitle: 'General Medicine', serviceDesc: 'Your first point of contact for better health.', servicePrice: 150000, icon: 'stethoscope' },
];

const PopularServices = () => {
	const { data, loading } = useQuery(GET_SERVICES, {
		variables: { input: { page: 1, limit: 3, sort: 'serviceViews', direction: 'DESC', search: {} } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-first',
	});
	const services = data?.getServices?.list?.length ? data.getServices.list.map((service: any) => ({ ...service, serviceTitle: service.serviceTitle ?? service.serviceName ?? 'Clinical service', serviceDesc: service.serviceDesc ?? 'MN Hospital specialist care.', icon: service.serviceType === 'CARDIOLOGY' ? 'favorite' : service.serviceType === 'LABORATORY' ? 'science' : 'stethoscope' })) : fallback;

	return <section className="popular-services"><div className="container"><SectionHeading eyebrow="Most requested" title="Popular care, trusted by patients." description="The services our patients choose most often, with transparent starting prices." linkLabel="Browse all care" linkHref="/service" /><div className="popular-service-list">{services.map((service: any) => <div className="popular-service-card" key={service._id}><Link href={`/service/${service._id}`} className="popular-service-link"><span className="service-icon"><Icon name={service.icon} /></span><span><strong>{service.serviceTitle}</strong><small>{service.serviceDesc}</small></span><span className="popular-price">{formatKrw(service.servicePrice)} <Icon name="arrow_outward" /></span></Link><LikeButton mutation={LIKE_TARGET_SERVICE} id={service._id} variableName="serviceId" /></div>)}</div>{loading && <span className="query-status">Refreshing popular care…</span>}</div></section>;
};

export default PopularServices;
