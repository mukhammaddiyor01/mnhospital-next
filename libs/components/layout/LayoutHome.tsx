import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ComponentType, ReactNode, useEffect, useState } from 'react';
import Top from '../Top';
import Footer from '../Footer';
import MobileBottomNav from '../common/MobileBottomNav';
import AdvertisementRail from '../advertisement/AdvertisementRail';
import RightAdvertisementRail from '../advertisement/RightAdvertisementRail';
import GeneralChat from '../chat/GeneralChat';
import ChatLauncher from '../chat/ChatLauncher';
import { useRouter } from 'next/router';
import { useTranslation } from '@/libs/i18n/useTranslation';

const HospitalAssistant = dynamic(() => import('../chat/HospitalAssistant'), {
	ssr: false,
});

const withLayoutMain = <P extends object>(Component: ComponentType<P>) => {
	const Layout = (props: P & { children?: ReactNode }) => {
		const router = useRouter();
		const t = useTranslation();
		const isHome = router.pathname === '/';
		const focused = router.pathname === '/appointment' || router.pathname.startsWith('/booking/');
		const [chatOpen, setChatOpen] = useState(false);
		const [assistantOpen, setAssistantOpen] = useState(false);
		useEffect(() => {
			if (!router.isReady || window.location.hash || window.scrollY > 24) return;
			const targetSelector: Record<string, string> = {
				'/service': '#main .clinical-inner-page > .clinical-inner-section',
				'/doctor': '#main .clinical-inner-page > .clinical-inner-section',
				'/article': '#main .clinical-article-page > .clinical-content-section',
				'/mypage/appointments': '#main .clinical-center-column',
			};
			const selector = targetSelector[router.pathname];
			if (!selector) return;
			const timer = window.setTimeout(() => {
				const target = document.querySelector(selector);
				if (target && window.scrollY <= 24 && !window.location.hash) {
					target.scrollIntoView({
						behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
						block: 'start',
					});
				}
			}, 220);
			return () => window.clearTimeout(timer);
		}, [router.isReady, router.pathname]);
		return (
			<>
				<div id="pc-wrap" className={`clinical-shell app-frame${focused ? ' clinical-focused-shell' : ''}`}>
					<Top />
					<ChatLauncher
						inviteEnabled={!focused && !router.pathname.startsWith('/account')}
						chatOpen={chatOpen}
						onChatToggle={() => {
							setAssistantOpen(false);
							setChatOpen((value) => !value);
						}}
						assistantOpen={assistantOpen}
						onAssistantToggle={() => {
							setChatOpen(false);
							setAssistantOpen((value) => !value);
						}}
					/>
					<main id="main">
						{isHome ? (
							<Component {...props} />
						) : (
							<div className={`clinical-workspace clinical-inner-workspace${focused ? ' clinical-focused-workspace' : ''}`}>
								{!focused && <AdvertisementRail side="left" />}
								<div className="clinical-center-column">
									<Component {...props} />
								</div>
								{!focused && <RightAdvertisementRail />}
							</div>
						)}
					</main>
					{focused ? <footer className="clinical-booking-support"><Link href="/visit-guide">{t('visit.title')}</Link><Link href="/contact">{t('nav.contact')}</Link></footer> : <Footer />}
					<GeneralChat open={chatOpen} onClose={() => setChatOpen(false)} />
					<HospitalAssistant
						open={assistantOpen}
						onClose={() => setAssistantOpen(false)}
					/>
					<MobileBottomNav />
				</div>
			</>
		);
	};

	return Layout;
};

export default withLayoutMain;
