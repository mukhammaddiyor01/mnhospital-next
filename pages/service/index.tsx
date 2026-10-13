import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { ServiceType } from '@/libs/components/service/enums/service.enum';
import { GET_SERVICES } from '@/apollo/service/query';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import ServiceDirectoryCard from '@/libs/components/service/ServiceDirectoryCard';
import { Services } from '@/libs/components/service/types/service';
import { useServiceDiscoveryText } from '@/libs/components/service/useServiceDiscoveryText';
import {
	emptyServiceFilters,
	filtersFromQuery,
	filtersToQuery,
	serviceInquiry,
	validPriceRange,
	ServiceFilters,
} from '@/libs/components/service/service-discovery';
import cardStyles from '@/libs/components/common/DirectoryCard.module.scss';
import styles from '@/libs/components/promotions/Promotions.module.scss';
const ServicesPage = () => {
	const t = useTranslation(),
		copy = useServiceDiscoveryText(),
		clinic = useClinicSettings(),
		typeLabel = useServiceTypeLabel(),
		router = useRouter();
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => setHydrated(true), []);
	const queryKey = JSON.stringify(router.query);
	const applied = useMemo(
		() => filtersFromQuery(JSON.parse(queryKey)),
		[queryKey],
	);
	const page =
		typeof router.query.page === 'string' &&
		Number.isFinite(Number(router.query.page))
			? Math.max(1, Math.min(100000, Math.floor(Number(router.query.page))))
			: 1;
	const [draft, setDraft] = useState<ServiceFilters>(emptyServiceFilters),
		[validation, setValidation] = useState('');
	useEffect(() => {
		if (router.isReady) {
			setDraft(applied);
			setValidation('');
		}
	}, [router.isReady, applied]);
	const catalog = useQuery<{ getServices: Services }>(GET_SERVICES, {
		variables: { input: serviceInquiry(applied, page) },
		skip: !hydrated || !router.isReady,
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
	});
	const result = catalog.data?.getServices ?? catalog.previousData?.getServices;
	const services = result?.list ?? [],
		total = result?.metaCounter[0]?.total ?? 0;
	const change = (patch: Partial<ServiceFilters>) => {
		setDraft((current) => ({ ...current, ...patch }));
		setValidation('');
	};
	const navigate = (filter: ServiceFilters, nextPage = 1) => {
		if (!validPriceRange(filter)) {
			setValidation(copy.invalidRange);
			return;
		}
		void router.push(
			{ pathname: '/service', query: filtersToQuery(filter, nextPage) },
			undefined,
			{ shallow: true, scroll: false },
		);
	};
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!event.currentTarget.checkValidity()) {
			setValidation(copy.invalidRange);
			return;
		}
		navigate(draft);
	};
	const chips = [
		...(applied.text ? [{ label: applied.text, patch: { text: '' } }] : []),
		...(applied.category
			? [{ label: typeLabel(applied.category), patch: { category: '' } }]
			: []),
		...(applied.discounted
			? [{ label: copy.discounted, patch: { discounted: false } }]
			: []),
		...(applied.min || applied.max
			? [
					{
						label: `${copy.range}: ${applied.min || '0'} – ${applied.max || '∞'} ${clinic.currency}`,
						patch: { min: '', max: '' },
					},
				]
			: []),
	];
	return (
		<div className={`clinical-inner-page ${styles.publicPage}`}>
			<section className="clinical-inner-hero">
				<div>
					<div className="clinical-crumb">
						<Link href="/">{t('nav.home')}</Link> / {t('nav.services')}
					</div>
					<span className="clinical-eyebrow">{t('services.eyebrow')}</span>
					<h1>
						{t('services.hero1')}
						<br />
						<em>{t('services.hero2')}</em>
					</h1>
					<p>{t('services.intro')}</p>
					<Link href="/visit-guide">{t('visit.title')} <Icon name="arrow_forward" /></Link>
				</div>
			</section>
			<section className="clinical-inner-section">
				<form
					noValidate
					className={styles.discovery}
					onSubmit={submit}
					aria-label={copy.filters}
				>
					<div className={styles.searchRow}>
						<label className={styles.search}>
							<span>{copy.search}</span>
							<div>
								<Icon name="search" />
								<input
									type="search"
									value={draft.text}
									maxLength={100}
									onChange={(event) => change({ text: event.target.value })}
									placeholder={copy.placeholder}
								/>
							</div>
						</label>
						<button className={styles.primary} type="submit">
							<Icon name="search" />
							{copy.apply}
						</button>
					</div>
					<details className={styles.advanced} open={Boolean(applied.category || applied.min || applied.max || applied.sort !== 'recommended' || validation)}>
						<summary>{copy.moreFilters}</summary>
						<div className={styles.filterGrid}>
						<label>
							{copy.category}
							<select
								value={draft.category}
								onChange={(event) => change({ category: event.target.value })}
							>
								<option value="">{copy.all}</option>
								{Object.values(ServiceType).map((value) => (
									<option value={value} key={value}>
										{typeLabel(value)}
									</option>
								))}
							</select>
						</label>
						<label>
							{copy.sort}
							<select
								value={draft.sort}
								onChange={(event) => change({ sort: event.target.value })}
							>
								{(
									['recommended', 'newest', 'low', 'high', 'popular'] as const
								).map((value) => (
									<option value={value} key={value}>
										{copy[value]}
									</option>
								))}
							</select>
						</label>
						<fieldset className={styles.priceRange}>
							<legend>
								{copy.range} · {clinic.currency}
							</legend>
							<label>
								<span className={styles.srOnly}>{copy.minimum}</span>
								<input
									type="number"
									min="0"
									max="1000000000"
									step={clinic.currency === 'KRW' ? '1' : '0.01'}
									value={draft.min}
									placeholder={copy.minimum}
									onChange={(event) => change({ min: event.target.value })}
								/>
							</label>
							<span aria-hidden="true">–</span>
							<label>
								<span className={styles.srOnly}>{copy.maximum}</span>
								<input
									type="number"
									min="0"
									max="1000000000"
									step={clinic.currency === 'KRW' ? '1' : '0.01'}
									value={draft.max}
									placeholder={copy.maximum}
									onChange={(event) => change({ max: event.target.value })}
								/>
							</label>
						</fieldset>
						</div>
						<p className={styles.help}>{copy.priceHelp}</p>
					</details>
					<div className={styles.filterFooter}>
						<label className={styles.check}>
							<input
								type="checkbox"
								checked={draft.discounted}
								onChange={(event) =>
									change({ discounted: event.target.checked })
								}
							/>
							<Icon name="sell" />
							{copy.discounted}
						</label>
						<button
							type="button"
							className={styles.textButton}
							onClick={() => {
								setDraft(emptyServiceFilters);
								navigate(emptyServiceFilters);
							}}
						>
							{copy.reset}
						</button>
					</div>
					{validation && (
						<p role="alert" className={styles.error}>
							{validation}
						</p>
					)}
				</form>
				<div className={styles.resultsHeading}>
					<h2>{copy.available}</h2>
					<span role="status" aria-live="polite">
						{!hydrated || catalog.loading ? copy.loading : `${total} ${copy.results}`}
					</span>
				</div>
				{chips.length > 0 && (
					<div className={styles.chips}>
						{chips.map((chip) => (
							<button
								key={chip.label}
								type="button"
								onClick={() => navigate({ ...applied, ...chip.patch })}
								aria-label={`${copy.remove}: ${chip.label}`}
							>
								{chip.label}
								<Icon name="close" />
							</button>
						))}
					</div>
				)}
				{catalog.error ? (
					<div className={styles.empty} role="alert">
						<Icon name="cloud_off" />
						<h3>{copy.unavailable}</h3>
						<button
							type="button"
							className={styles.secondary}
							onClick={() => void catalog.refetch().catch(() => undefined)}
						>
							{copy.retry}
						</button>
					</div>
				) : (
					<div className={cardStyles.grid} aria-busy={catalog.loading}>
						{services.map((service) => (
							<ServiceDirectoryCard
								key={service._id}
								service={service}
								currency={clinic.currency}
							/>
						))}
					</div>
				)}
				{hydrated && !catalog.loading && !catalog.error && !services.length && (
					<div className={styles.empty}>
						<Icon name="search_off" />
						<h3>{copy.noResults}</h3>
						<p>{copy.noHelp}</p>
						<button
							type="button"
							className={styles.secondary}
							onClick={() => navigate(emptyServiceFilters)}
						>
							{copy.reset}
						</button>
					</div>
				)}
				{total > 0 && (
					<nav className={styles.pagination} aria-label={copy.page}>
						<span>
							{t('services.showing')
								.replace('{shown}', String(services.length))
								.replace('{total}', String(total))}
						</span>
						<div>
							<button
								type="button"
								disabled={page <= 1 || catalog.loading}
								aria-label={copy.previous}
								onClick={() => navigate(applied, page - 1)}
							>
								<Icon name="chevron_left" />
							</button>
							<span>
								{copy.page} {page} / {Math.max(1, Math.ceil(total / 6))}
							</span>
							<button
								type="button"
								disabled={page * 6 >= total || catalog.loading}
								aria-label={copy.next}
								onClick={() => navigate(applied, page + 1)}
							>
								<Icon name="chevron_right" />
							</button>
						</div>
					</nav>
				)}
			</section>
		</div>
	);
};
export default withLayoutMain(ServicesPage);
