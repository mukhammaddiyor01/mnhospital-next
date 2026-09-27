import Head from 'next/head';
import { ComponentType, ReactNode } from 'react';
import Top from '../Top';
import Footer from '../Footer';

const withLayoutMain = <P extends object>(Component: ComponentType<P>) => {
	const Layout = (props: P & { children?: ReactNode }) => (
		<>
			<Head>
				<title>MN Hospital | Clinical Precision & Empathetic Care</title>
				<meta name="description" content="Expert medical care available 24/7 at MN Hospital." />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.svg" />
			</Head>
			<div id="pc-wrap">
				<Top />
				<main id="main"><Component {...props} /></main>
				<Footer />
			</div>
		</>
	);

	return Layout;
};

export default withLayoutMain;
