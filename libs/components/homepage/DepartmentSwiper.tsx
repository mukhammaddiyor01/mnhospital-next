import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import { catalogText } from '@/libs/i18n/catalog';
import cardInteraction from '@/libs/components/common/CardInteraction.module.scss';
import Link from 'next/link';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules';
import Icon from '../common/Icon';
import { ClinicalServiceCard } from './types/clinical-home';
import { MessageKey } from '@/libs/i18n/messages';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '../preference/PreferenceProvider';
import { resolveApiAsset } from '@/libs/config';

const iconForService = (serviceType?: string) => ({ CARDIOLOGY: 'cardiology', NEUROLOGY: 'neurology', ORTHOPEDICS: 'orthopedics', PEDIATRICS: 'child_care' }[serviceType ?? ''] ?? 'medical_services');
const fallbackTitles: MessageKey[] = ['home.department.title1', 'home.department.title2', 'home.department.title3', 'home.department.title4'];
const fallbackDescriptions: MessageKey[] = ['home.department.desc1', 'home.department.desc2', 'home.department.desc3', 'home.department.desc4'];

const DepartmentPhoto = ({ asset }: { asset?: string }) => {
	const [failed, setFailed] = useState(false);
	return <img className="mn-department-photo" src={asset && !failed ? resolveApiAsset(asset) : '/img/hospital-care-1.png'} alt="" width={480} height={280} loading="lazy" onError={() => setFailed(true)} />;
};

const DepartmentSwiper = ({ services, usingFallback }: { services: ClinicalServiceCard[]; usingFallback: boolean }) => {
	const t = useTranslation();
	const typeLabel = useServiceTypeLabel();
	const { language } = usePreferences();
	return <div className={`clinical-department-swiper${services.length < 3 ? ' is-compact' : ''}${services.length === 1 ? ' is-single' : ''}`} aria-label={t('home.department.aria')}>
	<Swiper
		key={services.map((service) => service._id).join('|')}
		modules={[EffectCoverflow, Pagination, A11y, Keyboard, Navigation]}
		effect={services.length > 1 ? 'coverflow' : 'slide'}
		grabCursor
		simulateTouch
		centeredSlides={services.length > 1}
		loop={services.length >= 4}
		initialSlide={services.length === 3 ? 1 : 0}
		speed={600}
		slidesPerView={services.length === 1 ? 1 : 1.12}
		spaceBetween={12}
		breakpointsBase="container"
		breakpoints={{ 480: { slidesPerView: services.length === 1 ? 1 : 1.55 }, 700: { slidesPerView: services.length === 1 ? 1 : services.length === 2 ? 1.55 : 2.25 } }}
		coverflowEffect={{ rotate: 8, stretch: 0, depth: 140, modifier: 1.8, slideShadows: false }}
		pagination={{ clickable: true }}
		navigation={services.length > 1}
		keyboard={{ enabled: true, onlyInViewport: true }}
		aria-label={t('home.department.carousel')}
	>
		{services.map((service, index) => {
			const locale = language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
			const formatCount = (value?: number) => !usingFallback && value !== undefined ? value.toLocaleString(locale) : '—';
			return <SwiperSlide key={service._id}><article className={`clinical-department mn-department-card ${cardInteraction.surface}`}>
				<Link className="mn-department-image-link" href={usingFallback ? '/service' : `/service/${service._id}`} aria-label={usingFallback ? t(fallbackTitles[index]) : catalogText(service.serviceTitle, language) || t('home.department.fallback')}><DepartmentPhoto key={service.serviceImages?.[0]} asset={service.serviceImages?.[0]} /></Link>
				<div className="mn-department-copy">
					<div className="clinical-department-top"><span className="clinical-dept-icon"><Icon name={iconForService(service.serviceType)} /></span><span className="clinical-dept-status">{usingFallback ? t('home.department.preview') : typeLabel(service.serviceType)}</span></div>
					<h3><Link className={cardInteraction.primaryLink} href={usingFallback ? '/service' : `/service/${service._id}`}>{usingFallback ? t(fallbackTitles[index]) : catalogText(service.serviceTitle, language) || t('home.department.fallback')}</Link></h3>
					<p>{usingFallback ? t(fallbackDescriptions[index]) : catalogText(service.serviceDesc, language)}</p>
					<div className="mn-department-engagement" title={usingFallback ? t('home.department.metricsUnavailable') : undefined}>
						<span><Icon name="favorite" />{formatCount(service.serviceLikes)} <small>{t('home.department.likes')}</small></span>
						<span><Icon name="visibility" />{formatCount(service.serviceViews)} <small>{t('home.department.views')}</small></span>
					</div>
					<div className="clinical-dept-bottom"><Link href={usingFallback ? '/service' : `/service/${service._id}`}>{t('home.department.explore')} <Icon name="chevron_right" /></Link></div>
				</div>
			</article></SwiperSlide>;
		})}
	</Swiper>
</div>;
};

export default DepartmentSwiper;
