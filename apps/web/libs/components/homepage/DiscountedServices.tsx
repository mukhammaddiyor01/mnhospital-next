import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { catalogText } from '@/libs/i18n/catalog';
import PromoOffers from './PromoOffers';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import { useState } from 'react';
import { GET_SERVICES } from '@/apollo/service/query';
import { Service, Services } from '../service/types/service';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { useServiceDiscoveryText } from '../service/useServiceDiscoveryText';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import { servicePriceForDisplay } from '../service/service-price';
import { resolveApiAsset } from '@/libs/config';
import { formatMoney } from '../common/currency';
import Icon from '../common/Icon';
import cardInteraction from '../common/CardInteraction.module.scss';
import styles from '../promotions/Promotions.module.scss';
export function DiscountedServiceCard({
	service,
	currency,
}: {
	service: Service;
	currency: string;
}) {
	const { language } = usePreferences();
	const text = useServiceDiscoveryText(),
		typeLabel = useServiceTypeLabel(),
		[failed, setFailed] = useState(false);
	const image = resolveApiAsset(service.serviceImages?.[0]),
		price = servicePriceForDisplay(service, currency),
		title = catalogText(service.serviceTitle || service.serviceName, language);
	const href = `/service/${service._id}`;
	return (
		<article className={`${styles.offerCard} ${cardInteraction.surface}`}>
			<div className={styles.offerImage}>
				{image && !failed ? (
					<img
						src={image}
						alt={title}
						width={420}
						height={280}
						loading="lazy"
						decoding="async"
						onError={() => setFailed(true)}
					/>
				) : (
					<div className={styles.offerFallback}>
						<Icon name="medical_services" />
					</div>
				)}
				<span className={styles.offerBadge}>
					{service.serviceDiscountPercent}% {text.off}
				</span>
			</div>
			<div className={styles.offerBody}>
				<span className={styles.category}>
					{typeLabel(service.serviceType)}
				</span>
				<h3>
					<Link href={href} className={cardInteraction.primaryLink}>
						{title}
					</Link>
				</h3>
				<p className={styles.offerMeta}>
					{service.memberData?.docFullName || service.memberData?.docNick}
					{service.serviceDuration && (
						<span>
							<Icon name="schedule" />
							{service.serviceDuration} {text.duration}
						</span>
					)}
				</p>
				<div className={styles.offerPrice}>
					<strong>{formatMoney(price, currency)}</strong>
					<s>{formatMoney(service.servicePrice, currency)}</s>
				</div>
				<p className={styles.savings}>
					{text.savings} {formatMoney(service.servicePrice - price, currency)}
				</p>
				<Link className={styles.offerLink} href={href}>
					{text.details}
					<Icon name="arrow_forward" />
				</Link>
			</div>
		</article>
	);
}
export default function DiscountedServices() {
	const text = useServiceDiscoveryText(),
		clinic = useClinicSettings();
	const catalog = useQuery<{ getServices: Services }>(GET_SERVICES, {
		variables: {
			input: {
				page: 1,
				limit: 3,
				sort: 'updatedAt',
				direction: 'DESC',
				search: { discountedOnly: true },
			},
		},
		fetchPolicy: 'cache-and-network',
	});
	const services = catalog.data?.getServices.list ?? [];
	return (
		<section
			className={`clinical-content-section ${styles.offersSection}`}
			id="discounted-services"
			aria-labelledby="discounted-services-title"
		>
			<PromoOffers />
			<div className={styles.offersHeading}>
				<div>
					<div className={styles.offersTitleRow}>
						<h2 id="discounted-services-title">{text.offersTitle}</h2>
						<details
							className={styles.promoHint}
							onKeyDown={(event) => {
								if (event.key === 'Escape') {
									event.currentTarget.open = false;
									event.currentTarget.querySelector('summary')?.focus();
								}
							}}
						>
							<summary
								aria-label={text.promoTitle}
								title={text.promoTitle}
								aria-controls="homepage-promo-guide"
							>
								<Icon name="local_offer" />
							</summary>
							<div
								className={styles.promoInfo}
								id="homepage-promo-guide"
								role="note"
							>
								<h3>{text.promoTitle}</h3>
								<p>{text.promoHelp}</p>
								<Link href="/service">
									{text.promoCta}
									<Icon name="arrow_forward" />
								</Link>
							</div>
						</details>
					</div>
					<p>{text.offersIntro}</p>
				</div>
				<Link href="/service?discounted=true">
					{text.viewOffers}
					<Icon name="arrow_forward" />
				</Link>
			</div>
			{catalog.error ? (
				<div className={styles.offerEmpty} role="alert">
					<p>{text.unavailable}</p>
					<button
						type="button"
						className={styles.secondary}
						onClick={() => void catalog.refetch().catch(() => undefined)}
					>
						{text.retry}
					</button>
				</div>
			) : (
				<div className={styles.offersGrid} aria-busy={catalog.loading}>
					{services.map((service) => (
						<DiscountedServiceCard
							service={service}
							currency={clinic.currency}
							key={service._id}
						/>
					))}
				</div>
			)}
			{catalog.loading && !services.length && (
				<p role="status">{text.loading}</p>
			)}
			{!catalog.loading && !catalog.error && !services.length && (
				<div className={styles.offerEmpty}>
					<Icon name="medical_services" />
					<div>
						<h3>{text.offersEmpty}</h3>
						<p>{text.offersEmptyHelp}</p>
					</div>
					<Link href="/service" className={styles.secondary}>
						{text.browse}
					</Link>
				</div>
			)}
		</section>
	);
}
