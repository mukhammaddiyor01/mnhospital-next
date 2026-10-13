import Head from 'next/head';
import { ReactNode } from 'react';
import { useSessionReady } from '@/libs/components/auth/SessionBootstrap';
import { useTranslation } from '@/libs/i18n/useTranslation';

const StaffLayout = ({ children }: { children: ReactNode }) => {
	const t = useTranslation();
	const restored = useSessionReady();

	return (
		<>
			<Head>
				<title key="title">{t('dashboard.title')} | MN Hospital</title>
			</Head>
			{restored ? (
				children
			) : (
				<main className="clinical-staff-gate">
					<p role="status">{t('dashboard.loading')}</p>
				</main>
			)}
		</>
	);
};

export default StaffLayout;
