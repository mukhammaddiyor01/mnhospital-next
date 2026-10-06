import { ReactNode, useState } from 'react';
import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import GeneralChat from '@/libs/components/chat/GeneralChat';
import { logOut } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { MessageKey } from '@/libs/i18n/messages';
import { useRouter } from 'next/router';

type StaffRole = MemberType.ADMIN | MemberType.DOCTOR | MemberType.RECEPTIONIST;

const StaffWorkspace = ({ role, name, title, intro, children }: {
  role: StaffRole;
  name: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) => {
  const t = useTranslation();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const isAdmin = role === MemberType.ADMIN;
  const dashboardHref = '/mypage/dashboard';
  const workspaceRoot = isAdmin ? '/admin' : role === MemberType.DOCTOR ? '/doctor-workspace' : '/receptionist-workspace';
  const profileHref = isAdmin ? dashboardHref : `${workspaceRoot}/profile`;
  const notificationHref = `${workspaceRoot}/notifications`;
  const roleLabel: MessageKey = role === MemberType.ADMIN ? 'dashboard.adminWorkspace' : role === MemberType.DOCTOR ? 'dashboard.doctorTitle' : 'dashboard.receptionistTitle';
  const nav: { href: string; icon: string; label: MessageKey }[] = [
    { href: dashboardHref, icon: 'dashboard', label: 'dashboard.title' },
    ...(!isAdmin ? [{ href: profileHref, icon: 'account_circle', label: 'dashboard.profileLink' as MessageKey }] : []),
    ...(role === MemberType.ADMIN ? [
      { href: '/admin/doctors', icon: 'stethoscope', label: 'nav.doctors' as MessageKey },
      { href: '/admin/services', icon: 'medical_services', label: 'nav.services' as MessageKey },
      { href: '/admin/receptionists', icon: 'support_agent', label: 'dashboard.receptionists' as MessageKey },
    ] : role === MemberType.DOCTOR ? [
      { href: `${workspaceRoot}/appointments`, icon: 'event', label: 'dashboard.myAppointments' as MessageKey },
      { href: `${workspaceRoot}/services`, icon: 'medical_services', label: 'dashboard.myServices' as MessageKey },
      { href: `${workspaceRoot}/reports`, icon: 'description', label: 'dashboard.myReports' as MessageKey },
    ] : [
      { href: `${workspaceRoot}/appointments`, icon: 'event', label: 'dashboard.myAppointments' as MessageKey },
      { href: `${workspaceRoot}/tasks`, icon: 'assignment', label: 'dashboard.pendingWork' as MessageKey },
      { href: `${workspaceRoot}/reports`, icon: 'description', label: 'dashboard.myReports' as MessageKey },
    ]),
    { href: `${workspaceRoot}/messages`, icon: 'mail', label: 'messages.title' },
    { href: notificationHref, icon: 'notifications', label: 'notifications.title' },
  ];

  return <div className={`clinical-staff-shell clinical-staff-${role.toLowerCase()}`}>
    <aside className="clinical-staff-sidebar">
      <Link className="clinical-staff-brand" href={dashboardHref}><span><Icon name="local_hospital" /></span><div><strong>MN Hospital</strong><small>{t('dashboard.staffPortal')}</small></div></Link>
      <div className="clinical-staff-role">{t(roleLabel)}</div>
      <nav aria-label={t('dashboard.workspaceNavigation')}>
        {nav.map((item) => <Link key={item.href} className={router.pathname === item.href ? 'active' : ''} href={item.href} aria-current={router.pathname === item.href ? 'page' : undefined}><Icon name={item.icon} /><span>{t(item.label)}</span></Link>)}
      </nav>
      <div className="clinical-staff-sidebar-footer"><Link href="/"><Icon name="open_in_new" />{t('dashboard.visitSite')}</Link><button type="button" onClick={() => void logOut()}><Icon name="logout" />{t('patient.signoutTitle')}</button></div>
    </aside>
    <div className="clinical-staff-column">
      <header className="clinical-staff-topbar"><div><span>{t('dashboard.staffPortal')}</span><strong>{t(roleLabel)}</strong></div><div className="clinical-staff-top-actions"><button type="button" onClick={() => setChatOpen(true)} aria-label={t('chat.open')}><Icon name="chat_bubble" /></button><Link href={notificationHref} aria-label={t('notifications.title')}><Icon name="notifications" /></Link><Link className="clinical-staff-avatar" href={profileHref} aria-label={t(isAdmin ? 'dashboard.title' : 'dashboard.profileLink')}><Icon name="person" /></Link></div></header>
      <main className="clinical-staff-content"><div className="clinical-staff-page-heading"><div><span>{t(roleLabel)}</span><h1>{title}</h1><p>{intro ?? t('dashboard.intro')}</p></div><Link href={profileHref}><Icon name="person" />{name}</Link></div>{children}</main>
    </div>
    <GeneralChat open={chatOpen} onClose={() => setChatOpen(false)} />
  </div>;
};

export default StaffWorkspace;
