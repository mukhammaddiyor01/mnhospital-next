import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_ADVERTISEMENTS } from '@/apollo/advertisement/query';
import { formatKrw } from '../common/currency';
import { AdvertisementCardVariant } from './enums/advertisement.enum';
import { Advertisement, AdvertisementPreview } from './types/advertisement';
import Icon from '../common/Icon';
import { resolveApiAsset } from '@/libs/config';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';

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
	{ _id: 'ambulance', advertisementTitle: 'Ambulance & Trauma', advertisementContent: 'Instant GPS-dispatched emergency ambulance response.', advertisementLink: 'tel:1800662273', previewLabel: '24/7 DIRECT LINE', previewAction: '1-800-MN-CARE' },
	{ _id: 'robotic-suite', advertisementTitle: 'Robotic Surgery Excellence', advertisementContent: 'Minimally invasive 3D HD-enabled procedures with sub-millimeter accuracy.', advertisementLink: '/service', previewLabel: 'TECHNOLOGY', previewAction: 'Learn More' },
	{ _id: 'rapid-care', advertisementTitle: 'Fast-Track Specialist Booking', advertisementContent: 'Skip wait times. Book priority consultations with department directors within 3 hours.', advertisementLink: '/appointment', previewLabel: 'RAPID CARE', previewRank: 'Active Now', previewAction: 'Book Rapid Slot' },
	{ _id: 'cardiac-camp', advertisementTitle: 'Free Cardiac Screening', advertisementContent: 'This Saturday, 9 AM–2 PM. Complimentary lipid profile, BP & cardiologist triage.', advertisementLink: '/appointment', previewLabel: 'COMMUNITY CAMP', previewRank: 'Free', previewAction: 'Reserve Seat' },
	{ _id: 'clinical-promo', advertisementTitle: 'Full Body Health Checkup', advertisementContent: 'Comprehensive package includes 72 pathology tests, 3T MRI screen, ECG & expert consult.', advertisementLink: '/service', previewLabel: 'SPECIAL PROMO', previewPrice: 149000, previewOriginalPrice: 220000, previewDiscount: '30% OFF', previewAction: 'View Package' },
	{ _id: 'telehealth', advertisementTitle: 'Instant Video Consult', advertisementContent: 'Connect securely with certified physicians from your home in under 60 seconds.', advertisementLink: '/appointment', previewLabel: 'TELEHEALTH', previewRank: 'Available', previewAction: 'Start Teleconsult' },
	{ _id: 'hospital-update', advertisementTitle: 'Hospital Announcement', advertisementContent: 'New Advanced Da Vinci Xi Robotic Suite now operational for urological and spinal surgeries.', advertisementLink: '/article', previewLabel: 'ANNOUNCEMENT' },
	{ _id: 'accreditation', advertisementTitle: 'JCI & NABH Gold', advertisementContent: 'Global safety standard.', advertisementLink: '/about', previewLabel: 'ACCREDITED' },
];

const advertisementVariants: Record<AdvertisementRailSide, AdvertisementCardVariant[]> = {
	left: [AdvertisementCardVariant.SUPPORT, AdvertisementCardVariant.SERVICE, AdvertisementCardVariant.PROMO, AdvertisementCardVariant.NEWS],
	right: [AdvertisementCardVariant.TECHNOLOGY, AdvertisementCardVariant.COMMUNITY, AdvertisementCardVariant.TECHNOLOGY, AdvertisementCardVariant.SUPPORT],
};

const AdvertisementCard = ({ advertisement, index, side }: AdvertisementCardProps) => {
	const t = useTranslation();
	const { language } = usePreferences();
	const locale = language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
	const variant = advertisementVariants[side][index % advertisementVariants[side].length];
	const isEmergency = advertisement._id === 'ambulance';
	const isAccreditation = advertisement._id === 'accreditation';
	const isService = variant === AdvertisementCardVariant.SERVICE;
	const isPromo = variant === AdvertisementCardVariant.PROMO;
	const isNews = variant === AdvertisementCardVariant.NEWS;
	const isSupport = variant === AdvertisementCardVariant.SUPPORT;
	const isCommunity = variant === AdvertisementCardVariant.COMMUNITY;
	const action = advertisement.previewAction ?? t('ads.learnMore');

	return <article className={`clinical-rail-card clinical-ad-card ${variant} ${isEmergency ? 'emergency' : ''} ${isAccreditation ? 'accreditation' : ''}`}>
		{isEmergency && <div className="clinical-emergency-label"><Icon name="ambulance" /> {advertisement.previewLabel}</div>}
		{isService && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-blue">{advertisement.previewLabel ?? t('ads.featuredService')}</span><span className="service-rank">{advertisement.previewRank ?? t('ads.ad')}</span></div>}
		{isPromo && <div className="clinical-rail-row"><span className="clinical-rail-kicker">{advertisement.previewLabel ?? t('ads.promotion')}</span>{advertisement.previewDiscount && <b>{advertisement.previewDiscount}</b>}</div>}
		{isNews && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">{advertisement.previewLabel ?? t('ads.hospitalUpdate')}</span>{advertisement.previewReads && <span className="news-views">{advertisement.previewReads.toLocaleString(locale)} {t('ads.reads')}</span>}</div>}
		{isSupport && !isEmergency && <div className="clinical-rail-kicker">{advertisement.previewLabel ?? t('ads.promotion')}</div>}
		{isCommunity && <div className="clinical-rail-row"><span className="clinical-tag clinical-tag-green">{advertisement.previewLabel ?? t('ads.featured')}</span>{advertisement.previewRank && <b>{advertisement.previewRank}</b>}</div>}
		{!isService && !isPromo && !isNews && !isSupport && !isCommunity && <div className="clinical-rail-kicker"><Icon name={advertisement._id === 'robotic-suite' ? 'smart_toy' : 'video_camera_front'} /> {advertisement.previewLabel ?? t('ads.hospitalUpdate')}</div>}
		{advertisement.advertisementImage && <div className="clinical-ad-image" style={{ backgroundImage: `url(${resolveApiAsset(advertisement.advertisementImage)})` }} aria-label={advertisement.advertisementTitle} />}
		<h3>{advertisement.advertisementTitle}</h3>
		<p>{advertisement.advertisementContent}</p>
		{isService && advertisement.previewPrice != null && <div className="service-meta"><span>{formatKrw(advertisement.previewPrice)}</span><span>{Number(advertisement.previewViews ?? 0).toLocaleString(locale)} {t('ads.views')}</span></div>}
		{isPromo && advertisement.previewPrice != null && <div className="promo-price">{formatKrw(advertisement.previewPrice)} {advertisement.previewOriginalPrice != null && <del>{formatKrw(advertisement.previewOriginalPrice)}</del>}</div>}
		<Link href={advertisement.advertisementLink || '/appointment'}>{action}</Link>
	</article>;
};

const AdvertisementRail = ({ side }: AdvertisementRailProps) => {
	const t = useTranslation();
	const { data } = useQuery<{ getAdvertisements: { list: Advertisement[] } }>(GET_ADVERTISEMENTS, {
		variables: { input: { page: 1, limit: 8 } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-first',
	});
	const advertisements: AdvertisementPreview[] = data?.getAdvertisements?.list?.length ? data.getAdvertisements.list : fallbackAdvertisements;
	const sideAdvertisements = advertisements.filter((_, index) => index % 2 === (side === 'left' ? 0 : 1));
	const visibleAdvertisements = sideAdvertisements.length ? sideAdvertisements : advertisements.slice(0, 2);

	return <aside className={`clinical-rail clinical-rail-${side}`} aria-label={side === 'left' ? t('ads.leftRail') : t('ads.rightRail')}>
		{visibleAdvertisements.slice(0, 4).map((advertisement, index) => <AdvertisementCard advertisement={advertisement} index={index} side={side} key={`${advertisement._id}-${side}`} />)}
	</aside>;
};

export default AdvertisementRail;
