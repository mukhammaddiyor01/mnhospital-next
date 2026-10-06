import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import LikeButton from '@/libs/components/common/LikeButton';
import { ServiceType } from '@/libs/components/service/enums/service.enum';
import { GET_SERVICES } from '@/apollo/service/query';
import { LIKE_TARGET_SERVICE } from '@/apollo/service/mutation';
import { formatKrw } from '@/libs/components/common/currency';
import { useTranslation } from '@/libs/i18n/useTranslation';

const serviceList = [
	{ id: 'general-medicine', title: 'General Medicine', type: ServiceType.CONSULTATION, icon: 'stethoscope', description: 'Preventive care, everyday health concerns, and personalized treatment plans.', price: 150000 },
	{ id: 'cardiology', title: 'Cardiology', type: ServiceType.CARDIOLOGY, icon: 'favorite', description: 'Heart health screenings, diagnostics, and long-term cardiovascular care.', price: 250000 },
	{ id: 'laboratory', title: 'Laboratory', type: ServiceType.LABORATORY, icon: 'science', description: 'Accurate blood tests and diagnostics with fast, secure results.', price: 80000 },
	{ id: 'pediatrics', title: 'Pediatrics', type: ServiceType.PEDIATRICS, icon: 'child_care', description: 'Gentle, thoughtful medical care for children and growing families.', price: 160000 },
	{ id: 'neurology', title: 'Neurology', type: ServiceType.NEUROLOGY, icon: 'neurology', description: 'Diagnosis and treatment for brain and nervous system disorders.', price: 220000 },
	{ id: 'dentistry', title: 'Dentistry', type: ServiceType.DENTISTRY, icon: 'dentistry', description: 'Modern preventive, restorative, and cosmetic dental treatment.', price: 200000 },
];

const iconForType = (type?: string) => type === ServiceType.CARDIOLOGY ? 'favorite' : type === ServiceType.LABORATORY ? 'science' : type === ServiceType.PEDIATRICS ? 'child_care' : type === ServiceType.NEUROLOGY ? 'neurology' : 'stethoscope';

const ServicesPage = () => {
	const t = useTranslation();
	const [search, setSearch] = useState('');
	const [type, setType] = useState('');
	const [page, setPage] = useState(1);
	const inquiry = { page, limit: 6, sort: 'serviceRank', direction: 'DESC', search: { ...(search ? { text: search } : {}), ...(type ? { serviceTypeList: [type] } : {}) } };
	const { data, loading } = useQuery(GET_SERVICES, { variables: { input: inquiry }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const usingFallback = !data?.getServices?.list?.length;
	const services = usingFallback ? serviceList : data.getServices.list;
	const totalCounter = data?.getServices?.metaCounter;
	const total = Array.isArray(totalCounter) ? totalCounter[0]?.total ?? services.length : totalCounter?.total ?? services.length;
	const submitHandler = (event: FormEvent) => { event.preventDefault(); setPage(1); };

	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div>
			<div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('nav.services')}</div>
			<span className="clinical-eyebrow">{t('services.eyebrow')}</span>
			<h1>{t('services.hero1')}<br /><em>{t('services.hero2')}</em></h1>
			<p>{t('services.intro')}</p>
		</div></section>
		<section className="clinical-inner-section">
			<h2>{t('services.heading')}</h2><p>{t('services.description')}</p>
			<form className="clinical-filter-bar" onSubmit={submitHandler}>
				<label><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('services.searchPlaceholder')} aria-label={t('services.searchAria')} /></label>
				<select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} aria-label={t('services.filterDepartment')}>
					<option value="">{t('services.allDepartments')}</option>
					<option value={ServiceType.CARDIOLOGY}>{t('services.cardiology')}</option>
					<option value={ServiceType.LABORATORY}>{t('services.laboratory')}</option>
					<option value={ServiceType.PEDIATRICS}>{t('services.pediatrics')}</option>
					<option value={ServiceType.NEUROLOGY}>{t('services.neurology')}</option>
				</select>
				<button className="clinical-primary-button" type="submit">{t('services.search')}</button>
			</form>
			<div className="clinical-service-detail-grid">{services.map((service: any) => {
				const id = service._id ?? service.id;
				const title = service.serviceTitle ?? service.title;
				const price = service.servicePrice ?? service.price;
				return <article className="clinical-service-detail" key={id}>
					<div className="clinical-service-detail-top"><span className="clinical-service-detail-icon"><Icon name={service.icon ?? iconForType(service.serviceType ?? service.type)} /></span>{!usingFallback && <LikeButton mutation={LIKE_TARGET_SERVICE} id={id} variableName="serviceId" initialLiked={Boolean(service.meLiked?.[0]?.myFavorite)} />}</div>
					<span className="clinical-section-kicker">{String(service.serviceType ?? service.type ?? t('services.clinicalCare')).replaceAll('_', ' ')}</span>
					<h3>{title}</h3><p>{service.serviceDesc ?? service.description}</p>
					<div className="clinical-service-detail-bottom"><span>{price ? t('services.from').replace('{price}', formatKrw(price)) : t('services.alwaysAvailable')}</span><Link href={`/service/${id}`}>{t('services.explore')}</Link></div>
				</article>;
			})}</div>
			{loading && <p className="clinical-query-status">{t('services.loading')}</p>}
			<div className="clinical-pagination"><span>{t('services.showing').replace('{shown}', String(services.length)).replace('{total}', String(total))}</span><div><button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>←</button><b>{page}</b><button disabled={services.length < 6} onClick={() => setPage((value) => value + 1)}>→</button></div></div>
			<Link className="clinical-primary-button clinical-inline-button" href="/appointment">{t('services.book')} <span>↗</span></Link>
		</section>
	</div>;
};

export default withLayoutMain(ServicesPage);
