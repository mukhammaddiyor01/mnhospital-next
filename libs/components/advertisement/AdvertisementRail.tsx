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
}

const fallbackAdvertisements: Advertisement[] = [
	{ _id: 'clinical-promo', advertisementTitle: 'Full body health checkup', advertisementContent: 'Pathology tests, ECG, imaging and expert consultation.', advertisementLink: '/appointment' },
	{ _id: 'hospital-update', advertisementTitle: 'A new wing for a better patient experience', advertisementContent: 'More comfortable spaces and faster access for every patient.', advertisementLink: '/article/new-wing' },
	{ _id: 'robotic-suite', advertisementTitle: 'Advanced robotic surgery suite', advertisementContent: 'New clinical technology is now available for selected surgical pathways.', advertisementLink: '/service' },
	{ _id: 'telehealth', advertisementTitle: 'Instant video consultation', advertisementContent: 'Connect securely with a certified physician from home.', advertisementLink: '/appointment' },
];

const advertisementVariants = [
	AdvertisementCardVariant.SERVICE,
	AdvertisementCardVariant.NEWS,
	AdvertisementCardVariant.TECHNOLOGY,
	AdvertisementCardVariant.SUPPORT,
];

const AdvertisementCard = ({ advertisement, index }: AdvertisementCardProps) => {
	const variant = advertisementVariants[index % advertisementVariants.length];
	const isService = variant === AdvertisementCardVariant.SERVICE;
	const isNews = variant === AdvertisementCardVariant.NEWS;
	const isSupport = variant === AdvertisementCardVariant.SUPPORT;

	return <article className={`clinical-rail-card clinical-ad-card ${variant} clinical-ad-card-${index % 4}`}>
		{isService && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-blue">FEATURED SERVICE</span><span className="service-rank">#{index + 1}</span></div>}
		{isNews && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">HOSPITAL UPDATE</span><span className="news-views">PROMOTED</span></div>}
		{isSupport && <div className="clinical-rail-kicker">PATIENT SUPPORT</div>}
		{!isService && !isNews && !isSupport && <div className="clinical-rail-kicker">✦ HOSPITAL UPDATE</div>}
		{advertisement.advertisementImage && <div className="clinical-ad-image" style={{ backgroundImage: `url(${advertisement.advertisementImage})` }} aria-label={advertisement.advertisementTitle} />}
		<h3>{advertisement.advertisementTitle}</h3>
		<p>{advertisement.advertisementContent}</p>
		{isService && <div className="service-meta"><span>MN Hospital</span><span>Featured care</span></div>}
		<Link className={isSupport ? 'clinical-support-action' : undefined} href={advertisement.advertisementLink || '/appointment'}>{isService ? 'View service →' : isNews ? 'Read hospital update →' : isSupport ? 'Talk to support →' : 'Learn more →'}</Link>
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
		{visibleAdvertisements.slice(0, 4).map((advertisement, index) => <AdvertisementCard advertisement={advertisement} index={index} key={advertisement._id} />)}
	</aside>;
};

export default AdvertisementRail;
