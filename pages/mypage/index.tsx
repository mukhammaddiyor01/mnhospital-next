import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientProfile from '@/libs/components/mypage/PatientProfile';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Icon from '@/libs/components/common/Icon';
import { usePatientProfileCompletion } from '@/libs/components/mypage/usePatientProfileCompletion';

const MyPage = () => {
	const t = useTranslation();
	const session = useReactiveVar(userVar);
	const profileIncomplete = usePatientProfileCompletion(session._id, session.memberType === MemberType.PATIENT);
	const router = useRouter();
	const staffProfile = session.memberType === MemberType.ADMIN ? '/mypage/dashboard' : session.memberType === MemberType.DOCTOR ? '/doctor-workspace/profile' : session.memberType === MemberType.RECEPTIONIST ? '/receptionist-workspace/profile' : '';
	useEffect(() => { if (staffProfile) void router.replace(staffProfile); }, [router, staffProfile]);
	if (staffProfile) return null;
	return <div className="clinical-inner-page mn-my-profile-page">
		<header className="mn-profile-page-heading"><div className="clinical-crumb"><Link href="/">{t('page.home')}</Link> / {t('page.profile')}</div>{profileIncomplete && <p className="mn-profile-completion-notice" role="status"><Icon name="error" />{t('page.profileIncomplete')}</p>}<h1>{t('page.profile')}</h1><p>{t('page.profileIntro')}</p></header>
		<PatientProfile />
	</div>;
};

export default withLayoutMain(MyPage);
