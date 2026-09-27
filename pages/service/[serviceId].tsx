import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import LikeButton from '@/libs/components/common/LikeButton';
import CommentsSection from '@/libs/components/comment/CommentsSection';
import ServiceLoading from '@/libs/components/service/ServiceLoading';
import { formatKrw } from '@/libs/components/common/currency';
import { GET_RECOMMENDED_SERVICES, GET_SERVICE } from '@/apollo/service/query';
import { LIKE_TARGET_SERVICE } from '@/apollo/service/mutation';

const ServiceDetailPage = () => {
	const router = useRouter();
	const serviceId = String(router.query.serviceId ?? '');
	const isApiService = /^[a-f\d]{24}$/i.test(serviceId);
	const fallbackTitle = serviceId.replaceAll('-', ' ');
	const { data, loading, error } = useQuery(GET_SERVICE, { variables: { serviceId }, skip: !isApiService || !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const { data: relatedData } = useQuery(GET_RECOMMENDED_SERVICES, { variables: { serviceId, limit: 3 }, skip: !isApiService || !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-first' });
	const service = data?.getService;
	const relatedServices = relatedData?.getRecommendedServices?.list ?? [];
	const title = service?.serviceTitle ?? fallbackTitle;
	if (!router.isReady || (loading && !service)) return <div className="inner-page"><div className="container"><ServiceLoading /></div></div>;
	return <div className="inner-page"><div className="container"><div className="detail-layout"><article className="detail-panel"><div className="detail-header"><div className="detail-icon"><Icon name="medical_services" /></div>{service && <LikeButton mutation={LIKE_TARGET_SERVICE} id={service._id} variableName="serviceId" initialLiked={Boolean(service.meLiked?.[0]?.myFavorite)} />}</div><span className="eyebrow">{service?.serviceType ?? 'Clinical service'}</span><h1>{title.charAt(0).toUpperCase() + title.slice(1)}</h1><p>{service?.serviceDesc ?? 'Our clinical team combines modern diagnostics with a thoughtful, patient-first experience.'}</p><div className="detail-meta"><span><Icon name="schedule" /> {service?.serviceDuration ?? 'Available 24/7'}</span><span><Icon name="payments" /> {service?.servicePrice ? formatKrw(service.servicePrice) : 'Price on request'}</span><span><Icon name="location_on" /> {service?.serviceRoom ?? 'MN Hospital'}</span></div><Link className="button button-primary" href={`/appointment?service=${service?._id ?? serviceId}`}>Book this service <span>→</span></Link></article><aside className="detail-aside"><span className="eyebrow">Your care, connected</span><h2>Precision starts with the right next step.</h2><p>Choose a specialist and time that works for you. Your request is securely connected to the hospital booking flow.</p><Link className="button button-secondary" href="/doctor">Find a doctor</Link></aside></div>{loading && <span className="query-status">Loading service details…</span>}{error && <span className="query-status">Showing the service overview while the clinical API reconnects.</span>}{relatedServices.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">You may also need</span><h2>Related services</h2></div></div><div className="related-grid">{relatedServices.map((item: any) => <Link className="related-card" href={`/service/${item._id}`} key={item._id}><Icon name="arrow_outward" /><strong>{item.serviceTitle}</strong><span>{item.serviceDesc}</span></Link>)}</div></section>}{service && <CommentsSection serviceId={service._id} />}</div></div>;
};

export default withLayoutMain(ServiceDetailPage);
