import Link from 'next/link';
import { useState } from 'react';
import Icon from '../common/Icon';
import SectionHeading from '../common/SectionHeading';
import { HomeServiceCard } from './types/homepage';
import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '@/apollo/service/query';
import { ServiceType } from '../service/enums/service.enum';
import { formatKrw } from '../common/currency';

const initialServices: HomeServiceCard[] = [
	{ _id: 'general-medicine', serviceTitle: 'General Medicine', serviceDesc: 'Comprehensive primary care for adults, focused on prevention, diagnosis, and treatment.', servicePrice: 150000, icon: 'stethoscope', label: 'Consultation' },
	{ _id: 'cardiology', serviceTitle: 'Cardiology', serviceDesc: 'Expert diagnostics and treatment plans for a healthier heart and active life.', servicePrice: 250000, icon: 'favorite', label: 'Specialty care' },
	{ _id: 'laboratory', serviceTitle: 'Laboratory', serviceDesc: 'Fast, accurate diagnostic testing to support confident clinical decisions.', servicePrice: 80000, icon: 'science', label: 'Diagnostics' },
];

const iconForService = (serviceType?: ServiceType) => {
	switch (serviceType) {
		case ServiceType.CARDIOLOGY: return 'favorite';
		case ServiceType.LABORATORY: return 'science';
		case ServiceType.PEDIATRICS: return 'child_care';
		default: return 'stethoscope';
	}
};

const Services = () => {
	const [services, setServices] = useState<HomeServiceCard[]>(initialServices);
	const { loading } = useQuery(GET_SERVICES, {
		variables: { input: { page: 1, limit: 6, sort: 'serviceViews', direction: 'DESC', search: {} } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-and-network',
		onCompleted: (data) => {
			const result = data?.getServices?.list ?? [];
			if (result.length) setServices(result.map((service: any) => ({ _id: service._id, serviceTitle: service.serviceTitle ?? service.serviceName ?? 'Clinical service', serviceDesc: service.serviceDesc ?? 'Thoughtful care from the MN Hospital clinical team.', servicePrice: Number(service.servicePrice ?? 0), icon: iconForService(service.serviceType), label: String(service.serviceType ?? 'consultation').replaceAll('_', ' ') })));
		},
	});

	return (
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
						<div className="service-card-bottom"><span>From <strong>{formatKrw(service.servicePrice)}</strong></span><Link href={`/service/${service._id}`} aria-label={`Learn more about ${service.serviceTitle}`}><Icon name="arrow_outward" /></Link></div>
					</article>
				))}
			</div>
			{loading && <span className="query-status">Updating services from the clinical portal…</span>}
		</div>
	</section>
 	);
};

export default Services;
