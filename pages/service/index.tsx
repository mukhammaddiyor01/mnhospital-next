import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { ServiceType } from '@/libs/components/service/enums/service.enum';

const serviceList = [
	{ id: 'general-medicine', title: 'General Medicine', type: ServiceType.CONSULTATION, icon: 'stethoscope', description: 'Comprehensive care for adult patients, from prevention to treatment.' },
	{ id: 'cardiology', title: 'Cardiology', type: ServiceType.CARDIOLOGY, icon: 'favorite', description: 'Advanced diagnostic and therapeutic care for your heart.' },
	{ id: 'laboratory', title: 'Laboratory', type: ServiceType.LABORATORY, icon: 'science', description: 'Fast, accurate testing to support confident clinical decisions.' },
	{ id: 'pediatrics', title: 'Pediatrics', type: ServiceType.PEDIATRICS, icon: 'child_care', description: 'Compassionate care for infants, children, and adolescents.' },
	{ id: 'neurology', title: 'Neurology', type: ServiceType.NEUROLOGY, icon: 'neurology', description: 'Diagnosis and treatment for brain and nervous system disorders.' },
	{ id: 'dentistry', title: 'Dentistry', type: ServiceType.DENTISTRY, icon: 'dentistry', description: 'Preventive, restorative, and cosmetic dental care.' },
];

const ServicesPage = () => (
	<div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow">Our medical services</span><h1>Care that fits your life.</h1><p>Discover comprehensive clinical care delivered with precision and empathy. Explore our specialized departments and choose the right next step for your health journey.</p></div><div className="service-grid">{serviceList.map((service) => <article className="service-card" key={service.id}><div className="service-icon"><Icon name={service.icon} /></div><span className="service-label">{service.type.replace('_', ' ')}</span><h3>{service.title}</h3><p>{service.description}</p><div className="service-card-bottom"><span>Available 24/7</span><Link href={`/service/${service.id}`}>Learn more <span>↗</span></Link></div></article>)}</div></div></div>
);

export default withLayoutMain(ServicesPage);
