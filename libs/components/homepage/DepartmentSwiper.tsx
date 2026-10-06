import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, EffectCoverflow, Keyboard, Navigation, Pagination } from 'swiper/modules';
import Icon from '../common/Icon';
import { ClinicalServiceCard } from './types/clinical-home';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '../preference/PreferenceProvider';

const iconForService = (serviceType?: string) => ({ CARDIOLOGY: 'cardiology', NEUROLOGY: 'neurology', ORTHOPEDICS: 'orthopedics', PEDIATRICS: 'child_care' }[serviceType ?? ''] ?? 'medical_services');

const DepartmentSwiper = ({ services }: { services: ClinicalServiceCard[] }) => {
  const t = useTranslation();
  const { language } = usePreferences();
  const locale = language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';

  return <div className={`clinical-department-swiper${services.length === 1 ? ' is-single' : ''}`} aria-label={t('home.department.aria')}>
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
      {services.map((service) => <SwiperSlide key={service._id}><article className="clinical-department">
        <div className="clinical-department-top"><span className="clinical-dept-icon"><Icon name={iconForService(service.serviceType)} /></span><span className="clinical-dept-status">{String(service.serviceType ?? '').replaceAll('_', ' ')}</span></div>
        <h3>{service.serviceTitle || t('home.department.fallback')}</h3>
        {service.serviceDesc && <p>{service.serviceDesc}</p>}
        <div className="clinical-dept-bottom"><span>{Number(service.serviceViews ?? 0).toLocaleString(locale)} {t('home.department.views')}</span><Link href={`/service/${service._id}`}>{t('home.department.explore')} <Icon name="chevron_right" /></Link></div>
      </article></SwiperSlide>)}
    </Swiper>
  </div>;
};

export default DepartmentSwiper;
