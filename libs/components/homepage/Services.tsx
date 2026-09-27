import Link from 'next/link';
import Icon from '../common/Icon';
import SectionHeading from '../common/SectionHeading';
import { HomeServiceCard } from './types/homepage';

const services: HomeServiceCard[] = [
	{ _id: 'general-medicine', serviceTitle: 'General Medicine', serviceDesc: 'Comprehensive primary care for adults, focused on prevention, diagnosis, and treatment.', servicePrice: 150000, icon: 'stethoscope', label: 'Consultation' },
	{ _id: 'cardiology', serviceTitle: 'Cardiology', serviceDesc: 'Expert diagnostics and treatment plans for a healthier heart and active life.', servicePrice: 250000, icon: 'favorite', label: 'Specialty care' },
	{ _id: 'laboratory', serviceTitle: 'Laboratory', serviceDesc: 'Fast, accurate diagnostic testing to support confident clinical decisions.', servicePrice: 80000, icon: 'science', label: 'Diagnostics' },
];

const Services = () => (
	<section className="services-section section-light">
		<div className="container">
			<SectionHeading eyebrow="Our services" title="Care for every chapter of life." description="Comprehensive care across multiple specialties, delivered by expert medical teams using advanced technology." linkLabel="View all services" linkHref="/service" />
			<div className="service-grid">
				{services.map((service) => (
					<article className="service-card" key={service._id}>
						<div className="service-icon"><Icon name={service.icon} /></div>
						<span className="service-label">{service.label}</span>
						<h3>{service.serviceTitle}</h3>
						<p>{service.serviceDesc}</p>
						<div className="service-card-bottom"><span>From <strong>{service.servicePrice.toLocaleString('en-US')} UZS</strong></span><Link href={`/service/${service._id}`} aria-label={`Learn more about ${service.serviceTitle}`}><Icon name="arrow_outward" /></Link></div>
					</article>
				))}
			</div>
		</div>
	</section>
);

export default Services;
