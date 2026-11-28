import SocialIcon from './SocialIcon';
import { useTranslation } from '@/libs/i18n/useTranslation';

const socialLinks = [
	{ name: 'Instagram' as const, href: process.env.NEXT_PUBLIC_MN_INSTAGRAM_URL },
	{ name: 'Telegram' as const, href: process.env.NEXT_PUBLIC_MN_TELEGRAM_URL },
	{ name: 'KakaoTalk' as const, href: process.env.NEXT_PUBLIC_MN_KAKAOTALK_URL },
];

function publicUrl(value?: string): string | undefined {
	if (!value) return undefined;
	try {
		const url = new URL(value.trim());
		return url.protocol === 'https:' ? url.href : undefined;
	} catch {
		return undefined;
	}
}

const SocialLinks = () => {
	const t = useTranslation();
	const available = socialLinks.flatMap(({ name, href }) => {
		const url = publicUrl(href);
		return url ? [{ name, href: url }] : [];
	});
	if (!available.length) return null;
	return <div className="clinical-footer-socials" aria-label={t('social.media')}>
	{available.map(({ name, href }) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={t('social.on').replace('{name}', name)} title={name}><SocialIcon name={name} /></a>)}
</div>;
};

export default SocialLinks;
