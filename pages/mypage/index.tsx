import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientProfile from '@/libs/components/mypage/PatientProfile';
import { useTranslation } from '@/libs/i18n/useTranslation';

const MyPage = () => {
	const t = useTranslation();
	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">{t('page.home')}</Link> / {t('page.profile')}</div><span className="clinical-eyebrow">{t('page.patientPortal')}</span><h1>{t('page.profileTitle1')}<br /><em>{t('page.profileTitle2')}</em></h1><p>{t('page.profileIntro')}</p></div></section>
		<PatientProfile />
	</div>;
};

export default withLayoutMain(MyPage);
