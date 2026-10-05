import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules';
import Icon from '../common/Icon';
import { ClinicalServiceCard } from './types/clinical-home';

const iconForService = (serviceType?: string) => ({ CARDIOLOGY: 'cardiology', NEUROLOGY: 'neurology', ORTHOPEDICS: 'orthopedics', PEDIATRICS: 'child_care' }[serviceType ?? ''] ?? 'medical_services');
const labelForService = (serviceType?: string) => String(serviceType ?? 'Clinical service').replaceAll('_', ' ');
const fallbackHighlights = ['Cath Lab 24/7', 'Stroke Center', 'Robotic Joint Care', 'NICU Level III'];
const fallbackStats = ['14 Surgeons • 98.6% Success', '11 Specialists • Rapid TPA', '16 Consultants • MAKO Robotic', '18 Pediatricians • Warm Care'];

const DepartmentSwiper = ({ services, usingFallback }: { services: ClinicalServiceCard[]; usingFallback: boolean }) => <div className={`clinical-department-swiper${services.length < 3 ? ' is-compact' : ''}${services.length === 1 ? ' is-single' : ''}`} aria-label="Explore MN Hospital services">
	<Swiper
		key={services.map((service) => service._id).join('|')}
		modules={[EffectCoverflow, Pagination, A11y, Keyboard, Navigation]}
		effect={services.length >= 3 ? 'coverflow' : 'slide'}
		grabCursor
		simulateTouch
		centeredSlides={services.length >= 3}
		loop={services.length >= 4}
		initialSlide={services.length === 3 ? 1 : 0}
		speed={600}
		slidesPerView={services.length === 1 ? 1 : 1.12}
		spaceBetween={12}
		breakpointsBase="container"
		breakpoints={{ 480: { slidesPerView: services.length === 1 ? 1 : 1.55 }, 700: { slidesPerView: services.length === 1 ? 1 : services.length === 2 ? 1.55 : 2.25 } }}
		coverflowEffect={{ rotate: 10, stretch: 0, depth: 100, modifier: 2, slideShadows: false }}
		pagination={{ clickable: true }}
		navigation={services.length > 1}
		keyboard={{ enabled: true, onlyInViewport: true }}
		aria-label="Hospital services carousel"
	>
		{services.map((service, index) => <SwiperSlide key={service._id}><article className="clinical-department"><div className="clinical-department-top"><span className="clinical-dept-icon"><Icon name={iconForService(service.serviceType)} /></span><span className="clinical-dept-status">{usingFallback ? fallbackHighlights[index] : labelForService(service.serviceType)}</span></div><h3>{service.serviceTitle || 'Clinical service'}</h3><p>{service.serviceDesc}</p><div className="clinical-dept-bottom"><span>{usingFallback ? fallbackStats[index] : `${Number(service.serviceViews ?? 0).toLocaleString('ko-KR')} views`}</span><Link href={usingFallback ? '/service' : `/service/${service._id}`}>Explore <Icon name="chevron_right" /></Link></div></article></SwiperSlide>)}
	</Swiper>
</div>;

export default DepartmentSwiper;
