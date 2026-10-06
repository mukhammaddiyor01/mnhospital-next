import Link from 'next/link';
import { ClinicalServiceCard } from './types/clinical-home';
import { useTranslation } from '@/libs/i18n/useTranslation';

// Keep the existing component boundary for callers. The service catalogue is
// easier to scan as a list than as the previous coverflow carousel.
const DepartmentSwiper = ({ services }: { services: ClinicalServiceCard[] }) => {
  const t = useTranslation();

  return <div className={`clinical-department-list${services.length === 1 ? ' is-single' : ''}`} aria-label={t('home.department.aria')}>
    {services.map((service) => <article className="clinical-department" key={service._id}>
      <span className="clinical-department-type">{String(service.serviceType ?? '').replaceAll('_', ' ')}</span>
      <h3>{service.serviceTitle || t('home.department.fallback')}</h3>
      {service.serviceDesc && <p>{service.serviceDesc}</p>}
      <Link href={`/service/${service._id}`}>{t('home.department.explore')} <span aria-hidden="true">→</span></Link>
    </article>)}
  </div>;
};

export default DepartmentSwiper;
