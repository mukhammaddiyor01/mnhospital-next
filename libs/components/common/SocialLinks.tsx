import SocialIcon from './SocialIcon';
import { useTranslation } from '@/libs/i18n/useTranslation';

const socialLinks = [
	{ name: 'Instagram' as const, href: process.env.NEXT_PUBLIC_MN_INSTAGRAM_URL },
	{ name: 'Telegram' as const, href: process.env.NEXT_PUBLIC_MN_TELEGRAM_URL },
	{ name: 'KakaoTalk' as const, href: process.env.NEXT_PUBLIC_MN_KAKAOTALK_URL },
];

const SocialLinks = () => {
	const t = useTranslation();
	return <div className="clinical-footer-socials" aria-label={t('social.media')}>
	{socialLinks.map(({ name, href }) => href
		? <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={t('social.on').replace('{name}', name)} title={name}><SocialIcon name={name} /></a>
		: <span key={name} className="is-unavailable" aria-label={t('social.comingSoon').replace('{name}', name)} title={t('social.comingSoon').replace('{name}', name)}><SocialIcon name={name} /></span>)}
</div>;
};

export default SocialLinks;
