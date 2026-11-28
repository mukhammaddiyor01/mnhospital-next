type SocialName = 'Instagram' | 'Telegram' | 'KakaoTalk';

const SocialIcon = ({ name }: { name: SocialName }) => {
	if (name === 'Instagram') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
	if (name === 'Telegram') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.4 3.1 2.8 10.3c-1.3.5-1.2 1.2-.2 1.5l4.8 1.5 11.1-7c.5-.3 1-.1.6.3l-9 8.1-.3 4.4c.4 0 .6-.2.9-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.5c.3-1.2-.5-1.7-1.2-1.5Z" /></svg>;
	return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.7c-5.5 0-10 3.5-10 7.8 0 2.7 1.8 5.1 4.7 6.5l-1 3.8c-.1.4.3.7.7.5l4.5-2.9c.4.1.8.1 1.1.1 5.5 0 10-3.5 10-7.9s-4.5-7.9-10-7.9Z" /></svg>;
};

export default SocialIcon;
