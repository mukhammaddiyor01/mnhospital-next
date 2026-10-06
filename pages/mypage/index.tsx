import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientProfile from '@/libs/components/mypage/PatientProfile';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';

const MyPage = () => {
	const t = useTranslation();
	const session = useReactiveVar(userVar);
	const isStaff = session.memberType && session.memberType !== MemberType.PATIENT;
	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">{t('page.home')}</Link> / {t('page.profile')}</div><span className="clinical-eyebrow">{isStaff ? t('dashboard.kicker') : t('page.patientPortal')}</span><h1>{isStaff ? t('page.profile') : <>{t('page.profileTitle1')}<br /><em>{t('page.profileTitle2')}</em></>}</h1><p>{isStaff ? t('dashboard.intro') : t('page.profileIntro')}</p></div></section>
		<PatientProfile />
	</div>;
};

export default withLayoutMain(MyPage);
