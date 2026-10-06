import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import LikeButton from '@/libs/components/common/LikeButton';
import CommentsSection from '@/libs/components/comment/CommentsSection';
import { ReferenceGroup } from '@/libs/components/comment/enums/comment.enum';
import ServiceLoading from '@/libs/components/service/ServiceLoading';
import { formatKrw } from '@/libs/components/common/currency';
import { GET_RECOMMENDED_SERVICES, GET_SERVICE } from '@/apollo/service/query';
import { LIKE_TARGET_SERVICE } from '@/apollo/service/mutation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';

const ServiceDetailPage = () => {
	const t = useTranslation();
	const typeLabel = useServiceTypeLabel();
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
	return <div className="inner-page"><div className="container">
		<div className="detail-layout">
			<article className="detail-panel">
				<div className="detail-header"><div className="detail-icon"><Icon name="medical_services" /></div>{service && <LikeButton mutation={LIKE_TARGET_SERVICE} id={service._id} variableName="serviceId" initialLiked={Boolean(service.meLiked?.[0]?.myFavorite)} />}</div>
				<span className="eyebrow">{typeLabel(service?.serviceType)}</span>
				<h1>{title.charAt(0).toUpperCase() + title.slice(1)}</h1>
				<p>{service?.serviceDesc ?? t('serviceDetail.summaryFallback')}</p>
				<div className="detail-meta"><span><Icon name="schedule" /> {service?.serviceDuration ?? t('serviceDetail.available')}</span><span><Icon name="payments" /> {service?.servicePrice ? formatKrw(service.servicePrice) : t('serviceDetail.priceRequest')}</span><span><Icon name="location_on" /> {service?.serviceRoom ?? 'MN Hospital'}</span></div>
				<Link className="button button-primary" href={`/appointment?service=${service?._id ?? serviceId}`}>{t('serviceDetail.book')} <span>→</span></Link>
			</article>
			<aside className="detail-aside"><span className="eyebrow">{t('serviceDetail.asideKicker')}</span><h2>{t('serviceDetail.asideTitle')}</h2><p>{t('serviceDetail.asideIntro')}</p><Link className="button button-secondary" href="/doctor">{t('serviceDetail.findDoctor')}</Link></aside>
		</div>
		{loading && <span className="query-status">{t('serviceDetail.loading')}</span>}
		{error && <span className="query-status">{t('serviceDetail.reconnecting')}</span>}
		{relatedServices.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="eyebrow">{t('serviceDetail.relatedKicker')}</span><h2>{t('serviceDetail.relatedTitle')}</h2></div></div><div className="related-grid">{relatedServices.map((item: any) => <Link className="related-card" href={`/service/${item._id}`} key={item._id}><Icon name="arrow_outward" /><strong>{item.serviceTitle}</strong><span>{item.serviceDesc}</span></Link>)}</div></section>}
		{service && <CommentsSection targetId={service._id} group={ReferenceGroup.SERVICE} />}
	</div></div>;
};

export default withLayoutMain(ServiceDetailPage);
