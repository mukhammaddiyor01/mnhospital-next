import Link from 'next/link';
import { useRouter } from 'next/router';
import Icon from './Icon';
import { MessageKey } from '@/libs/i18n/messages';
import { useTranslation } from '@/libs/i18n/useTranslation';

const navigationItems: { label: MessageKey; href: string; icon: string }[] = [
	{ label: 'nav.home', href: '/', icon: 'home' },
	{ label: 'nav.services', href: '/service', icon: 'medical_services' },
	{ label: 'nav.doctors', href: '/doctor', icon: 'stethoscope' },
	{ label: 'nav.articles', href: '/article', icon: 'article' },
	{ label: 'nav.appointments', href: '/appointment', icon: 'calendar_month' },
	{ label: 'nav.contact', href: '/contact', icon: 'support_agent' },
];

const MobileBottomNav = ({ chatOpen, onChatToggle, assistantOpen = false, onAssistantToggle }: { chatOpen: boolean; onChatToggle: () => void; assistantOpen?: boolean; onAssistantToggle?: () => void }) => {
	const router = useRouter();
	const t = useTranslation();
	const isActive = (href: string) => href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

	return <nav className="bottom-nav clinical-bottom-nav" aria-label={t('nav.primary')}>
		{navigationItems.map((item) => <Link className={isActive(item.href) ? 'active' : ''} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} key={item.href}><Icon name={item.icon} /><span>{t(item.label)}</span></Link>)}
		<button className={chatOpen ? 'clinical-bottom-chat active' : 'clinical-bottom-chat'} type="button" aria-expanded={chatOpen} aria-controls="general-chat" aria-label={chatOpen ? t('chat.close') : t('chat.open')} onClick={onChatToggle}><Icon name={chatOpen ? 'close' : 'chat_bubble'} /><span>{t('chat.open')}</span></button>
		{onAssistantToggle && <button className={assistantOpen ? 'clinical-bottom-chat active' : 'clinical-bottom-chat'} type="button" aria-expanded={assistantOpen} aria-controls="hospital-assistant" aria-label={t(assistantOpen ? 'chat.close' : 'assistant.open')} onClick={onAssistantToggle}><Icon name={assistantOpen ? 'close' : 'smart_toy'} /><span>{t('assistant.open')}</span></button>}
	</nav>;
};

export default MobileBottomNav;
