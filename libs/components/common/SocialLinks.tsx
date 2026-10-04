import SocialIcon from './SocialIcon';

const socialLinks = [
	{ name: 'Instagram' as const, href: process.env.NEXT_PUBLIC_MN_INSTAGRAM_URL },
	{ name: 'Telegram' as const, href: process.env.NEXT_PUBLIC_MN_TELEGRAM_URL },
	{ name: 'KakaoTalk' as const, href: process.env.NEXT_PUBLIC_MN_KAKAOTALK_URL },
];

const SocialLinks = () => <div className="clinical-footer-socials" aria-label="MN Hospital social media">
	{socialLinks.map(({ name, href }) => href
		? <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`MN Hospital on ${name}`} title={name}><SocialIcon name={name} /></a>
		: <span key={name} className="is-unavailable" aria-label={`${name} link coming soon`} title={`${name} link coming soon`}><SocialIcon name={name} /></span>)}
</div>;

export default SocialLinks;
