import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_ADVERTISEMENTS } from '@/apollo/advertisement/query';
import { formatKrw } from '../common/currency';
import { AdvertisementCardVariant } from './enums/advertisement.enum';
import { Advertisement, AdvertisementPreview } from './types/advertisement';

type AdvertisementRailSide = 'left' | 'right';

interface AdvertisementRailProps {
	side: AdvertisementRailSide;
}

interface AdvertisementCardProps {
	advertisement: AdvertisementPreview;
	side: AdvertisementRailSide;
	index: number;
}

const fallbackAdvertisements: AdvertisementPreview[] = [
	{ _id: 'general-medicine', advertisementTitle: 'General Medicine', advertisementContent: 'Primary care, prevention, diagnosis, and treatment from the MN Hospital team.', advertisementLink: '/service', previewLabel: 'POPULAR SERVICE', previewRank: '#1', previewPrice: 150000, previewViews: 1284, previewAction: 'View service →' },
	{ _id: 'cardiology', advertisementTitle: 'Cardiology', advertisementContent: 'Heart health diagnostics and treatment plans with experienced specialists.', advertisementLink: '/service', previewLabel: 'MOST REQUESTED', previewRank: '4.9 ★', previewPrice: 250000, previewViews: 856, previewAction: 'View service →' },
	{ _id: 'clinical-promo', advertisementTitle: 'Full body health checkup', advertisementContent: 'Pathology tests, ECG, imaging and expert consultation.', advertisementLink: '/service', previewLabel: 'SERVICE PROMO', previewPrice: 149000, previewOriginalPrice: 220000, previewDiscount: '30% OFF', previewAction: 'View package →' },
	{ _id: 'heart-health', advertisementTitle: 'Five simple ways to support your heart health', advertisementContent: 'Small, consistent choices can make a meaningful difference long term.', advertisementLink: '/article', previewLabel: 'HEALTH ARTICLE', previewReads: 306, previewAction: 'Read article →' },
	{ _id: 'hospital-update', advertisementTitle: 'A new wing for a better patient experience', advertisementContent: 'More comfortable spaces and faster access for every patient.', advertisementLink: '/article', previewLabel: 'ANNOUNCEMENT', previewReads: 420, previewAction: 'Read hospital update →' },
	{ _id: 'robotic-suite', advertisementTitle: 'Advanced robotic surgery suite', advertisementContent: 'New clinical technology is now available for selected surgical pathways.', advertisementLink: '/service', previewLabel: 'HOSPITAL UPDATE', previewAction: 'Learn more →' },
	{ _id: 'patient-support', advertisementTitle: 'Need help choosing?', advertisementContent: 'Our care coordinator can help you find the right service and doctor.', advertisementLink: '/contact', previewLabel: 'PATIENT SUPPORT', previewAction: 'Talk to support →' },
	{ _id: 'telehealth', advertisementTitle: 'Instant video consultation', advertisementContent: 'Connect securely with a certified physician from home.', advertisementLink: '/appointment', previewLabel: 'TELEHEALTH', previewRank: 'Available', previewAction: 'Start consultation →' },
];

const advertisementVariants: Record<AdvertisementRailSide, AdvertisementCardVariant[]> = {
	left: [AdvertisementCardVariant.SERVICE, AdvertisementCardVariant.PROMO, AdvertisementCardVariant.NEWS, AdvertisementCardVariant.SUPPORT],
	right: [AdvertisementCardVariant.SERVICE, AdvertisementCardVariant.NEWS, AdvertisementCardVariant.TECHNOLOGY, AdvertisementCardVariant.COMMUNITY],
};

const AdvertisementCard = ({ advertisement, index, side }: AdvertisementCardProps) => {
	const variant = advertisementVariants[side][index % advertisementVariants[side].length];
	const isService = variant === AdvertisementCardVariant.SERVICE;
	const isPromo = variant === AdvertisementCardVariant.PROMO;
	const isNews = variant === AdvertisementCardVariant.NEWS;
	const isSupport = variant === AdvertisementCardVariant.SUPPORT;
	const isCommunity = variant === AdvertisementCardVariant.COMMUNITY;
	const action = advertisement.previewAction ?? 'Learn more →';

	return <article className={`clinical-rail-card clinical-ad-card ${variant}`}>
		{isService && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-blue">{advertisement.previewLabel ?? 'FEATURED SERVICE'}</span><span className="service-rank">{advertisement.previewRank ?? 'AD'}</span></div>}
		{isPromo && <div className="clinical-rail-row"><span className="clinical-rail-kicker">{advertisement.previewLabel ?? 'PROMOTION'}</span>{advertisement.previewDiscount && <b>{advertisement.previewDiscount}</b>}</div>}
		{isNews && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">{advertisement.previewLabel ?? 'HOSPITAL UPDATE'}</span>{advertisement.previewReads && <span className="news-views">{advertisement.previewReads.toLocaleString('ko-KR')} reads</span>}</div>}
		{isSupport && <div className="clinical-rail-kicker">{advertisement.previewLabel ?? 'PROMOTION'}</div>}
		{isCommunity && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">{advertisement.previewLabel ?? 'FEATURED'}</span>{advertisement.previewRank && <b>{advertisement.previewRank}</b>}</div>}
		{!isService && !isPromo && !isNews && !isSupport && !isCommunity && <div className="clinical-rail-kicker">✦ {advertisement.previewLabel ?? 'HOSPITAL UPDATE'}</div>}
		{advertisement.advertisementImage && <div className="clinical-ad-image" style={{ backgroundImage: `url(${advertisement.advertisementImage})` }} aria-label={advertisement.advertisementTitle} />}
		<h3>{advertisement.advertisementTitle}</h3>
		<p>{advertisement.advertisementContent}</p>
		{isService && advertisement.previewPrice != null && <div className="service-meta"><span>{formatKrw(advertisement.previewPrice)}</span><span>{Number(advertisement.previewViews ?? 0).toLocaleString('ko-KR')} views</span></div>}
		{isPromo && advertisement.previewPrice != null && <div className="promo-price">{formatKrw(advertisement.previewPrice)} {advertisement.previewOriginalPrice != null && <del>{formatKrw(advertisement.previewOriginalPrice)}</del>}</div>}
		<Link href={advertisement.advertisementLink || '/appointment'}>{action}</Link>
	</article>;
};

const AdvertisementRail = ({ side }: AdvertisementRailProps) => {
	const { data } = useQuery<{ getAdvertisements: { list: Advertisement[] } }>(GET_ADVERTISEMENTS, {
		variables: { input: { page: 1, limit: 8 } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-first',
	});
	const advertisements: AdvertisementPreview[] = data?.getAdvertisements?.list?.length ? data.getAdvertisements.list : fallbackAdvertisements;
	const sideAdvertisements = advertisements.filter((_, index) => index % 2 === (side === 'left' ? 0 : 1));
	const visibleAdvertisements = sideAdvertisements.length ? sideAdvertisements : advertisements.slice(0, 2);

	return <aside className={`clinical-rail clinical-rail-${side}`} aria-label={`${side} advertisements`}>
		{visibleAdvertisements.slice(0, 4).map((advertisement, index) => <AdvertisementCard advertisement={advertisement} index={index} side={side} key={`${advertisement._id}-${side}`} />)}
	</aside>;
};

export default AdvertisementRail;
