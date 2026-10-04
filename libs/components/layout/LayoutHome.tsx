import Head from 'next/head';
import { ComponentType, ReactNode } from 'react';
import Top from '../Top';
import Footer from '../Footer';
import { useEffect } from 'react';
import { getJwtToken, updateUserInfo } from '@/libs/auth';
import MobileBottomNav from '../common/MobileBottomNav';
import AdvertisementRail from '../advertisement/AdvertisementRail';
import { useRouter } from 'next/router';

const withLayoutMain = <P extends object>(Component: ComponentType<P>) => {
	const Layout = (props: P & { children?: ReactNode }) => {
		const router = useRouter();
		const isHome = router.pathname === '/';
		useEffect(() => { const token = getJwtToken(); if (token) updateUserInfo(token); }, []);
		return <>
			<Head>
				<title>MN Hospital | Clinical Precision & Empathetic Care</title>
				<meta name="description" content="Expert medical care available 24/7 at MN Hospital." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" type="image/png" href="/favicon.png" />
			</Head>
			<div id="pc-wrap" className="clinical-shell app-frame">
				<Top />
				<main id="main">{isHome ? <Component {...props} /> : <div className="clinical-workspace clinical-inner-workspace"><AdvertisementRail side="left" /><div className="clinical-center-column"><Component {...props} /></div><AdvertisementRail side="right" /></div>}</main>
				<Footer />
				<MobileBottomNav />
			</div>
		</>;
	};

	return Layout;
};

export default withLayoutMain;
