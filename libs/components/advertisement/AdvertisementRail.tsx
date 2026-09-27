import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_ADVERTISEMENTS } from '@/apollo/advertisement/query';
import { Advertisement } from './types/advertisement';

type AdvertisementRailSide = 'left' | 'right';

interface AdvertisementRailProps {
	side: AdvertisementRailSide;
}

const fallbackAdvertisements: Advertisement[] = [
	{ _id: 'clinical-promo', advertisementTitle: 'Full body health checkup', advertisementContent: 'Pathology tests, ECG, imaging and expert consultation.', advertisementLink: '/appointment' },
	{ _id: 'hospital-update', advertisementTitle: 'A new wing for a better patient experience', advertisementContent: 'More comfortable spaces and faster access for every patient.', advertisementLink: '/article/new-wing' },
	{ _id: 'robotic-suite', advertisementTitle: 'Advanced robotic surgery suite', advertisementContent: 'New clinical technology is now available for selected surgical pathways.', advertisementLink: '/service' },
	{ _id: 'telehealth', advertisementTitle: 'Instant video consultation', advertisementContent: 'Connect securely with a certified physician from home.', advertisementLink: '/appointment' },
];

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
		{visibleAdvertisements.slice(0, 4).map((advertisement, index) => <article className={`clinical-rail-card clinical-ad-card clinical-ad-card-${index % 4}`} key={advertisement._id}>
			<div className="clinical-rail-row"><span className={`clinical-tag ${index % 2 ? 'clinical-tag-green' : 'clinical-tag-blue'}`}>{index % 2 ? 'HOSPITAL UPDATE' : 'FEATURED CARE'}</span><span className="clinical-ad-mark">AD</span></div>
			{advertisement.advertisementImage && <div className="clinical-ad-image" style={{ backgroundImage: `url(${advertisement.advertisementImage})` }} aria-label={advertisement.advertisementTitle} />}
			<h3>{advertisement.advertisementTitle}</h3><p>{advertisement.advertisementContent}</p>
			<Link href={advertisement.advertisementLink || '/appointment'}>Learn more →</Link>
		</article>)}
	</aside>;
};

export default AdvertisementRail;
