import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import GeneralChat from '@/libs/components/chat/GeneralChat';
import { logOut } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { MessageKey } from '@/libs/i18n/messages';

type StaffRole = MemberType.ADMIN | MemberType.DOCTOR | MemberType.RECEPTIONIST;

const StaffWorkspace = ({ role, name, title, children, doctorId }: {
  role: StaffRole;
  name: string;
  title: string;
  children: ReactNode;
  doctorId?: string;
}) => {
  const t = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const roleLabel: MessageKey = role === MemberType.ADMIN ? 'dashboard.adminWorkspace' : role === MemberType.DOCTOR ? 'dashboard.doctorTitle' : 'dashboard.receptionistTitle';
  const nav: { href: string; icon: string; label: MessageKey }[] = [
    { href: '/mypage/dashboard', icon: 'dashboard', label: 'dashboard.title' },
    { href: '/mypage', icon: 'account_circle', label: 'dashboard.profileLink' },
    ...(role === MemberType.ADMIN ? [
      { href: '/doctor', icon: 'stethoscope', label: 'nav.doctors' as MessageKey },
      { href: '/service', icon: 'medical_services', label: 'nav.services' as MessageKey },
    ] : role === MemberType.DOCTOR && doctorId ? [
      { href: `/doctor/${doctorId}`, icon: 'stethoscope', label: 'patient.openDoctor' as MessageKey },
    ] : []),
    { href: '/mypage/messages', icon: 'mail', label: 'messages.title' },
    { href: '/mypage/notifications', icon: 'notifications', label: 'notifications.title' },
  ];

  return <div className={`clinical-staff-shell clinical-staff-${role.toLowerCase()}`}>
    <aside className="clinical-staff-sidebar">
      <Link className="clinical-staff-brand" href="/mypage/dashboard"><span><Icon name="local_hospital" /></span><div><strong>MN Hospital</strong><small>{t('dashboard.staffPortal')}</small></div></Link>
      <div className="clinical-staff-role">{t(roleLabel)}</div>
      <nav aria-label={t('dashboard.workspaceNavigation')}>
        {nav.map((item) => <Link key={item.href} className={item.href === '/mypage/dashboard' ? 'active' : ''} href={item.href} aria-current={item.href === '/mypage/dashboard' ? 'page' : undefined}><Icon name={item.icon} /><span>{t(item.label)}</span></Link>)}
      </nav>
      <div className="clinical-staff-sidebar-footer"><Link href="/"><Icon name="open_in_new" />{t('dashboard.visitSite')}</Link><button type="button" onClick={() => void logOut()}><Icon name="logout" />{t('patient.signoutTitle')}</button></div>
    </aside>
    <div className="clinical-staff-column">
      <header className="clinical-staff-topbar"><div><span>{t('dashboard.staffPortal')}</span><strong>{t(roleLabel)}</strong></div><div className="clinical-staff-top-actions"><button type="button" onClick={() => setChatOpen(true)} aria-label={t('chat.open')}><Icon name="chat_bubble" /></button><Link href="/mypage/notifications" aria-label={t('notifications.title')}><Icon name="notifications" /></Link><Link className="clinical-staff-avatar" href="/mypage" aria-label={t('dashboard.profileLink')}><Icon name="person" /></Link></div></header>
      <main className="clinical-staff-content"><div className="clinical-staff-page-heading"><div><span>{t(roleLabel)}</span><h1>{title}</h1><p>{t('dashboard.intro')}</p></div><Link href="/mypage"><Icon name="person" />{name}</Link></div>{children}</main>
    </div>
    <GeneralChat open={chatOpen} onClose={() => setChatOpen(false)} />
  </div>;
};

export default StaffWorkspace;
