import { servicePriceForDisplay } from '@/libs/components/service/service-price';
import { useState } from 'react';
import ServiceBookingOptions from '@/libs/components/service/ServiceBookingOptions';
import {
	BookingOption,
	getBookingOptions,
} from '@/libs/components/service/bookingOptions';
import ServiceImageGallery from '@/libs/components/service/ServiceImageGallery';
import ServiceDirectoryCard from '@/libs/components/service/ServiceDirectoryCard';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import LikeButton from '@/libs/components/common/LikeButton';
import CommentsSection from '@/libs/components/comment/CommentsSection';
import { ReferenceGroup } from '@/libs/components/comment/enums/comment.enum';
import ServiceLoading from '@/libs/components/service/ServiceLoading';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '@/libs/components/common/currency';
import {
	GET_RECOMMENDED_SERVICES,
	GET_SERVICE,
	GET_SERVICE_BOOKING_OPTIONS,
} from '@/apollo/service/query';
import { LIKE_TARGET_SERVICE } from '@/apollo/service/mutation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import { MessageKey } from '@/libs/i18n/messages';
import { ServiceType } from '@/libs/components/service/enums/service.enum';
import { Service } from '@/libs/components/service/types/service';
import { MemberStatus } from '@/libs/components/member/enums/member.enum';

const previewServices: Record<string, { title: MessageKey; description: MessageKey; type: ServiceType }> = {
	'general-medicine': {
		title: 'services.demoGeneral',
		description: 'services.demoGeneralDesc',
		type: ServiceType.CONSULTATION,
	},
	cardiology: {
		title: 'services.demoCardiology',
		description: 'services.demoCardiologyDesc',
		type: ServiceType.CARDIOLOGY,
	},
	laboratory: {
		title: 'services.demoLaboratory',
		description: 'services.demoLaboratoryDesc',
		type: ServiceType.LABORATORY,
	},
	pediatrics: {
		title: 'services.demoPediatrics',
		description: 'services.demoPediatricsDesc',
		type: ServiceType.PEDIATRICS,
	},
	neurology: {
		title: 'services.demoNeurology',
		description: 'services.demoNeurologyDesc',
		type: ServiceType.NEUROLOGY,
	},
	dentistry: {
		title: 'services.demoDentistry',
		description: 'services.demoDentistryDesc',
		type: ServiceType.DENTISTRY,
	},
};

type ServiceDetail = Omit<Service, 'memberData'> & {
	memberData?: (NonNullable<Service['memberData']> & { memberStatus: MemberStatus }) | null;
	meLiked?: Array<{ myFavorite: boolean }>;
};

const ServiceDetailPage = () => {
	const t = useTranslation();
	const [selectedOptionId, setSelectedOptionId] = useState('');
	const clinic = useClinicSettings();
	const typeLabel = useServiceTypeLabel();
	const router = useRouter();
	const serviceId = typeof router.query.serviceId === 'string' ? router.query.serviceId : '';
	const isApiService = /^[a-f\d]{24}$/i.test(serviceId);
	const previewService = previewServices[serviceId];
	const { data, loading, error, refetch } = useQuery<{ getService: ServiceDetail }>(GET_SERVICE, {
		variables: { serviceId }, skip: !router.isReady || !isApiService, fetchPolicy: 'cache-and-network',
	});
	const service = data?.getService?._id === serviceId ? data.getService : undefined;
	const { data: relatedData } = useQuery<{ getRecommendedServices: { list: Service[] } }>(GET_RECOMMENDED_SERVICES, {
		variables: { serviceId, limit: 3 }, skip: !service, fetchPolicy: 'cache-first',
	});
	const optionsQuery = useQuery<{
		getServiceBookingOptions: { list: BookingOption[] };
	}>(GET_SERVICE_BOOKING_OPTIONS, {
		variables: { serviceId },
		skip: !service,
		fetchPolicy: 'cache-and-network',
	});
	const options = service
		? getBookingOptions(
				service,
				optionsQuery.error
					? []
					: (optionsQuery.data?.getServiceBookingOptions.list ?? []),
			)
		: [];
	const selectedOption =
		options.find((option) => option._id === selectedOptionId) ??
		options.find((row) => row._id === service?._id) ??
		options[0];
	const relatedServices = relatedData?.getRecommendedServices?.list ?? [];
	const title = service?.serviceTitle || service?.serviceName || (previewService ? t(previewService.title) : t('nav.services'));
	const description = service ? service.serviceDesc : previewService ? t(previewService.description) : undefined;
	const canBook = Boolean(selectedOption);
	if (!router.isReady || (isApiService && loading && !service))
		return (
			<div className="inner-page clinical-service-page"><div className="container"><ServiceLoading /></div></div>
		);
	if (!service && !previewService)
		return (
			<div className="inner-page clinical-service-page">
				<div className="container">
					<section className="detail-panel clinical-service-error" role="alert">
						<h1>{isApiService ? t('activity.unavailable') : t('notFound.title')}</h1>
						<div className="clinical-service-error-actions">
							{isApiService && (
								<button type="button" className="button button-primary" onClick={() => void refetch().catch(() => undefined)}>{t('patient.retry')}</button>
							)}
							<Link className="button button-outline" href="/service">{t('nav.services')}</Link>
						</div>
					</section>
				</div>
			</div>
		);
	return (
		<div className="inner-page clinical-service-page">
			<div className="container">
				<div className="detail-layout">
					<article className="detail-panel">
						<div className="detail-header">
							<div className="detail-icon"><Icon name="medical_services" /></div>
							{service && (
								<LikeButton mutation={LIKE_TARGET_SERVICE} id={service._id} variableName="serviceId" initialLiked={Boolean(service.meLiked?.[0]?.myFavorite)} />
							)}
						</div>
						<span className="eyebrow">{typeLabel(service?.serviceType ?? previewService?.type)}</span>
						<h1>{title}</h1>
						{service && (
							<ServiceImageGallery key={service._id} images={service.serviceImages} title={title} />
						)}
						{description && <p>{description}</p>}
						<div className="detail-meta">
							{(service?.serviceDuration || previewService) && (
								<span>
									<Icon name="schedule" />{' '}
									{service?.serviceDuration || t('serviceDetail.available')}
								</span>
							)}
							<span>
								<Icon name="payments" />{' '}
								{service && Number.isFinite(service.servicePrice)
									? formatMoney(servicePriceForDisplay(service, clinic.currency), clinic.currency)
									: t('serviceDetail.priceRequest')}
							</span>
							<span>
								<Icon name="location_on" />{' '}
								{service?.serviceRoom || 'MN Hospital'}
							</span>
						</div>
						{canBook && selectedOption && service ? (
							<ServiceBookingOptions
								options={options}
								selected={selectedOption}
								baseId={service.packageBaseServiceId || service._id}
								currency={clinic.currency}
								loading={optionsQuery.loading}
								failed={Boolean(optionsQuery.error)}
								onChange={setSelectedOptionId}
								onRetry={() => void optionsQuery.refetch().catch(() => undefined)}
							/>
						) : (
							<p className="query-status" role="status">{t('booking.unavailable')}</p>
						)}
					</article>
					<aside className="detail-aside"><span className="eyebrow">{t('serviceDetail.asideKicker')}</span><h2>{t('serviceDetail.asideTitle')}</h2><p>{t('serviceDetail.asideIntro')}</p><Link className="button button-secondary" href="/doctor">{t('serviceDetail.findDoctor')}</Link></aside>
				</div>
				{loading && (
					<p className="query-status" role="status">{t('serviceDetail.loading')}</p>
				)}
				{error && (
					<p className="query-status" role="alert">{t('activity.unavailable')}</p>
				)}
				{relatedServices.length > 0 && (
					<section className="related-section">
						<div className="section-heading"><div><span className="eyebrow">{t('serviceDetail.relatedKicker')}</span><h2>{t('serviceDetail.relatedTitle')}</h2></div></div>
						<div className="related-grid">
							{relatedServices.map((item) => (
								<ServiceDirectoryCard service={item} currency={clinic.currency} key={item._id} />
							))}
						</div>
					</section>
				)}
				{service && (
					<CommentsSection key={service._id} targetId={service._id} group={ReferenceGroup.SERVICE} />
				)}
			</div>
		</div>
	);
};

export default withLayoutMain(ServiceDetailPage);
