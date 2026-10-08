import cardInteraction from '@/libs/components/common/CardInteraction.module.scss';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules';
import Icon from '../common/Icon';
import { ClinicalServiceCard } from './types/clinical-home';
import { MessageKey } from '@/libs/i18n/messages';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '../preference/PreferenceProvider';

const iconForService = (serviceType?: string) => ({ CARDIOLOGY: 'cardiology', NEUROLOGY: 'neurology', ORTHOPEDICS: 'orthopedics', PEDIATRICS: 'child_care' }[serviceType ?? ''] ?? 'medical_services');
const labelForService = (serviceType?: string) => String(serviceType ?? 'Clinical service').replaceAll('_', ' ');
const fallbackHighlights: MessageKey[] = ['home.department.highlight1', 'home.department.highlight2', 'home.department.highlight3', 'home.department.highlight4'];
const fallbackStats: MessageKey[] = ['home.department.stat1', 'home.department.stat2', 'home.department.stat3', 'home.department.stat4'];
const fallbackTitles: MessageKey[] = ['home.department.title1', 'home.department.title2', 'home.department.title3', 'home.department.title4'];
const fallbackDescriptions: MessageKey[] = ['home.department.desc1', 'home.department.desc2', 'home.department.desc3', 'home.department.desc4'];

const DepartmentSwiper = ({ services, usingFallback }: { services: ClinicalServiceCard[]; usingFallback: boolean }) => {
	const t = useTranslation();
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
		{services.map((service, index) => <SwiperSlide key={service._id}><article className={`clinical-department ${cardInteraction.surface}`}><div className="clinical-department-top"><span className="clinical-dept-icon"><Icon name={iconForService(service.serviceType)} /></span><span className="clinical-dept-status">{usingFallback ? t(fallbackHighlights[index]) : labelForService(service.serviceType)}</span></div><h3><Link className={cardInteraction.primaryLink} href={usingFallback ? '/service' : `/service/${service._id}`}>{usingFallback ? t(fallbackTitles[index]) : service.serviceTitle || t('home.department.fallback')}</Link></h3><p>{usingFallback ? t(fallbackDescriptions[index]) : service.serviceDesc}</p><div className="clinical-dept-bottom"><span>{usingFallback ? t(fallbackStats[index]) : `${Number(service.serviceViews ?? 0).toLocaleString(language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US')} ${t('home.department.views')}`}</span><Link href={usingFallback ? '/service' : `/service/${service._id}`}>{t('home.department.explore')} <Icon name="chevron_right" /></Link></div></article></SwiperSlide>)}
	</Swiper>
</div>;
};

export default DepartmentSwiper;
