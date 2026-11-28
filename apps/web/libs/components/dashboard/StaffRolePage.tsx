import { ReactNode } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import StaffLayout from '@/libs/components/layout/StaffLayout';
import StaffWorkspace from './StaffWorkspace';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MessageKey } from '@/libs/i18n/messages';

type Role = MemberType.DOCTOR | MemberType.RECEPTIONIST;

const StaffRolePage = ({ role, titleKey, introKey, children }: { role: Role; titleKey: MessageKey; introKey?: MessageKey; children: ReactNode }) => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const signInHref = role === MemberType.DOCTOR ? '/account/doctor-signin' : '/account/receptionist-signin';
  return <StaffLayout>
    {session._id && session.memberType === role
      ? <StaffWorkspace role={role} name={session.memberFullName || session.memberNick} title={t(titleKey)} intro={introKey ? t(introKey) : undefined}>{children}</StaffWorkspace>
      : <main className="clinical-staff-gate"><div><span>{t('dashboard.staffPortal')}</span><h1>{t('dashboard.restricted')}</h1><p>{t('dashboard.restrictedIntro')}</p><nav><Link href={signInHref}>{t(role === MemberType.DOCTOR ? 'auth.doctorSignin' : 'dashboard.receptionistSignin')}</Link><Link href="/">{t('dashboard.visitSite')}</Link></nav></div></main>}
  </StaffLayout>;
};

export default StaffRolePage;
