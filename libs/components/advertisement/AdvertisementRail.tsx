import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_ADVERTISEMENTS } from '@/apollo/advertisement/query';
import { AdvertisementCardVariant } from './enums/advertisement.enum';
import { Advertisement } from './types/advertisement';

type AdvertisementRailSide = 'left' | 'right';

interface AdvertisementRailProps {
	side: AdvertisementRailSide;
}

interface AdvertisementCardProps {
	advertisement: Advertisement;
	index: number;
	side: AdvertisementRailSide;
}

const fallbackAdvertisements: Advertisement[] = [
	{ _id: 'general-medicine', advertisementTitle: 'General Medicine', advertisementContent: 'Primary care, prevention, diagnosis, and treatment from the MN Hospital team.', advertisementLink: '/service' },
	{ _id: 'clinical-promo', advertisementTitle: 'Full body health checkup', advertisementContent: 'Pathology tests, ECG, imaging and expert consultation.', advertisementLink: '/appointment' },
	{ _id: 'hospital-update', advertisementTitle: 'A new wing for a better patient experience', advertisementContent: 'More comfortable spaces and faster access for every patient.', advertisementLink: '/article/new-wing' },
	{ _id: 'patient-support', advertisementTitle: 'Need help choosing?', advertisementContent: 'Our care coordinator can help you find the right service and doctor.', advertisementLink: '/contact' },
	{ _id: 'cardiology', advertisementTitle: 'Cardiology', advertisementContent: 'Heart health diagnostics and treatment plans with experienced specialists.', advertisementLink: '/service' },
	{ _id: 'heart-health', advertisementTitle: 'Five simple ways to support your heart health', advertisementContent: 'Small, consistent choices can make a meaningful difference long term.', advertisementLink: '/article' },
	{ _id: 'robotic-suite', advertisementTitle: 'Advanced robotic surgery suite', advertisementContent: 'New clinical technology is now available for selected surgical pathways.', advertisementLink: '/service' },
	{ _id: 'telehealth', advertisementTitle: 'Instant video consultation', advertisementContent: 'Connect securely with a certified physician from home.', advertisementLink: '/appointment' },
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

	return <article className={`clinical-rail-card clinical-ad-card ${variant} clinical-ad-card-${index % 4}`}>
		{isService && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-blue">FEATURED SERVICE</span><span className="service-rank">#{index + 1}</span></div>}
		{isPromo && <div className="clinical-rail-row"><span className="clinical-rail-kicker">SERVICE PROMO</span><b>FEATURED</b></div>}
		{isNews && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">HOSPITAL UPDATE</span><span className="news-views">PROMOTED</span></div>}
		{isSupport && <div className="clinical-rail-kicker">PATIENT SUPPORT</div>}
		{isCommunity && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">TELEHEALTH</span><b>AVAILABLE</b></div>}
		{!isService && !isPromo && !isNews && !isSupport && !isCommunity && <div className="clinical-rail-kicker">✦ HOSPITAL UPDATE</div>}
		{advertisement.advertisementImage && <div className="clinical-ad-image" style={{ backgroundImage: `url(${advertisement.advertisementImage})` }} aria-label={advertisement.advertisementTitle} />}
		<h3>{advertisement.advertisementTitle}</h3>
		<p>{advertisement.advertisementContent}</p>
		{isService && <div className="service-meta"><span>MN Hospital</span><span>Featured care</span></div>}
		{isPromo && <div className="promo-price">Clinical care <small>MN Hospital</small></div>}
		<Link className={isSupport || isCommunity ? 'clinical-support-action' : undefined} href={advertisement.advertisementLink || '/appointment'}>{isService ? 'View service →' : isPromo ? 'View package →' : isNews ? 'Read hospital update →' : isSupport ? 'Talk to support →' : isCommunity ? 'Start consultation →' : 'Learn more →'}</Link>
	</article>;
};

const AdvertisementRail = ({ side }: AdvertisementRailProps) => {
	const { data } = useQuery<{ getAdvertisements: { list: Advertisement[] } }>(GET_ADVERTISEMENTS, {
		variables: { input: { page: 1, limit: 8 } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-first',
	});
	const advertisements = data?.getAdvertisements?.list?.length ? data.getAdvertisements.list : fallbackAdvertisements;
	const sideAdvertisements = advertisements.filter((_, index) => index % 2 === (side === 'left' ? 0 : 1));
	const visibleAdvertisements = sideAdvertisements.length ? sideAdvertisements : advertisements.slice(0, 2);

	return <aside className={`clinical-rail clinical-rail-${side}`} aria-label={`${side} advertisements`}>
		{visibleAdvertisements.slice(0, 4).map((advertisement, index) => <AdvertisementCard advertisement={advertisement} index={index} side={side} key={`${advertisement._id}-${side}`} />)}
	</aside>;
};

export default AdvertisementRail;
