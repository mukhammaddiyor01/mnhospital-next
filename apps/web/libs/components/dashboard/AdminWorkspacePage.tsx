import { ReactNode } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import StaffLayout from '@/libs/components/layout/StaffLayout';
import StaffWorkspace from './StaffWorkspace';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MessageKey } from '@/libs/i18n/messages';

const AdminWorkspacePage = ({ titleKey, introKey, children }: { titleKey: MessageKey; introKey?: MessageKey; children: ReactNode }) => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  return <StaffLayout>
    {session._id && session.memberType === MemberType.ADMIN
      ? <StaffWorkspace role={MemberType.ADMIN} name={session.memberNick} title={t(titleKey)} intro={introKey ? t(introKey) : undefined}>{children}</StaffWorkspace>
      : <main className="clinical-staff-gate"><div><span>{t('dashboard.staffPortal')}</span><h1>{t('dashboard.restricted')}</h1><p>{t('dashboard.restrictedIntro')}</p><nav><Link href="/account/admin-signin">{t('dashboard.adminSignin')}</Link><Link href="/">{t('dashboard.visitSite')}</Link></nav></div></main>}
  </StaffLayout>;
};

export default AdminWorkspacePage;
