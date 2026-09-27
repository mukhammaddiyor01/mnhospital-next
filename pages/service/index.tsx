import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { ServiceType } from '@/libs/components/service/enums/service.enum';
import { GET_SERVICES } from '@/apollo/service/query';

const serviceList = [
	{ id: 'general-medicine', title: 'General Medicine', type: ServiceType.CONSULTATION, icon: 'stethoscope', description: 'Comprehensive care for adult patients, from prevention to treatment.' },
	{ id: 'cardiology', title: 'Cardiology', type: ServiceType.CARDIOLOGY, icon: 'favorite', description: 'Advanced diagnostic and therapeutic care for your heart.' },
	{ id: 'laboratory', title: 'Laboratory', type: ServiceType.LABORATORY, icon: 'science', description: 'Fast, accurate testing to support confident clinical decisions.' },
	{ id: 'pediatrics', title: 'Pediatrics', type: ServiceType.PEDIATRICS, icon: 'child_care', description: 'Compassionate care for infants, children, and adolescents.' },
	{ id: 'neurology', title: 'Neurology', type: ServiceType.NEUROLOGY, icon: 'neurology', description: 'Diagnosis and treatment for brain and nervous system disorders.' },
	{ id: 'dentistry', title: 'Dentistry', type: ServiceType.DENTISTRY, icon: 'dentistry', description: 'Preventive, restorative, and cosmetic dental care.' },
];

const iconForType = (type?: string) => type === ServiceType.CARDIOLOGY ? 'favorite' : type === ServiceType.LABORATORY ? 'science' : type === ServiceType.PEDIATRICS ? 'child_care' : type === ServiceType.NEUROLOGY ? 'neurology' : 'stethoscope';

const ServicesPage = () => {
	const [search, setSearch] = useState('');
	const [type, setType] = useState('');
	const [page, setPage] = useState(1);
	const [services, setServices] = useState<any[]>(serviceList);
	const inquiry = { page, limit: 6, sort: 'serviceRank', direction: 'DESC', search: { ...(search ? { text: search } : {}), ...(type ? { serviceTypeList: [type] } : {}) } };
	const { data, loading } = useQuery(GET_SERVICES, { variables: { input: inquiry }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network', onCompleted: (result) => { if (result?.getServices?.list?.length) setServices(result.getServices.list); } });
	const total = data?.getServices?.metaCounter?.[0]?.total ?? services.length;
	const submitHandler = (event: FormEvent) => { event.preventDefault(); setPage(1); };

	return <div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow">Our medical services</span><h1>Care that fits your life.</h1><p>Discover comprehensive clinical care delivered with precision and empathy. Explore our specialized departments and choose the right next step for your health journey.</p></div><form className="list-toolbar" onSubmit={submitHandler}><label className="service-search"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services..." /></label><select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} aria-label="Filter by service type"><option value="">All departments</option><option value={ServiceType.CARDIOLOGY}>Cardiology</option><option value={ServiceType.LABORATORY}>Laboratory</option><option value={ServiceType.PEDIATRICS}>Pediatrics</option><option value={ServiceType.NEUROLOGY}>Neurology</option></select><button className="button button-primary button-small" type="submit">Search</button></form><div className="service-grid">{services.map((service: any) => <article className="service-card" key={service._id ?? service.id}><div className="service-icon"><Icon name={service.icon ?? iconForType(service.serviceType)} /></div><span className="service-label">{String(service.serviceType ?? service.type).replaceAll('_', ' ')}</span><h3>{service.serviceTitle ?? service.title}</h3><p>{service.serviceDesc ?? service.description}</p><div className="service-card-bottom"><span>{service.servicePrice ? `${Number(service.servicePrice).toLocaleString('en-US')} UZS` : 'Available 24/7'}</span><Link href={`/service/${service._id ?? service.id}`}>Learn more <span>↗</span></Link></div></article>)}</div>{loading && <span className="query-status">Loading services from the clinical portal…</span>}<div className="pagination-row"><span>Showing {services.length} of {total} services</span><div><button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>←</button><b>{page}</b><button disabled={services.length < 6} onClick={() => setPage((value) => value + 1)}>→</button></div></div></div></div>;
};

export default withLayoutMain(ServicesPage);
