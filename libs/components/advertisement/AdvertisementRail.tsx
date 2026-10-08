import cardInteraction from '@/libs/components/common/CardInteraction.module.scss';
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

	return <article className={`clinical-rail-card clinical-ad-card ${cardInteraction.surface} ${variant} ${isEmergency ? 'emergency' : ''} ${isAccreditation ? 'accreditation' : ''}`}>
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
		<Link className={cardInteraction.primaryLink} href={advertisement.advertisementLink || '/appointment'}>{action}</Link>
	</article>;
};

const AdvertisementRail = ({ side }: AdvertisementRailProps) => {
	const t = useTranslation();
	const { data, loading, error } = useQuery<{ getAdvertisements: { list: Advertisement[] } }>(GET_ADVERTISEMENTS, {
		variables: { input: { page: 1, limit: 8 } },
		fetchPolicy: 'cache-first',
	});
	const advertisements: AdvertisementPreview[] = data?.getAdvertisements?.list ?? [];
	const sideAdvertisements = advertisements.filter((_, index) => index % 2 === (side === 'left' ? 0 : 1));
	const visibleAdvertisements = sideAdvertisements.length ? sideAdvertisements : advertisements.slice(0, 2);

	return <aside className={`clinical-rail clinical-rail-${side}`} aria-label={side === 'left' ? t('ads.leftRail') : t('ads.rightRail')}>
		{!advertisements.length && <p className="clinical-rail-status" role="status">{t(loading ? 'ads.loading' : error ? 'ads.unavailable' : 'ads.empty')}</p>}
		{visibleAdvertisements.slice(0, 4).map((advertisement, index) => <AdvertisementCard advertisement={advertisement} index={index} side={side} key={`${advertisement._id}-${side}`} />)}
	</aside>;
};

export default AdvertisementRail;
