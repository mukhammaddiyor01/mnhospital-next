import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { AdminDashboardStats } from './types';
import { useTranslation } from '@/libs/i18n/useTranslation';

const SummaryCard = ({ icon, label, value, detail }: { icon: string; label: string; value: number; detail?: string }) =>
  <article className="clinical-admin-summary-card"><span className="clinical-admin-summary-icon"><Icon name={icon} /></span><div><small>{label}</small><strong>{value.toLocaleString()}{detail && <em>{detail}</em>}</strong></div></article>;

const AdminDashboard = ({ stats, adminName }: { stats: AdminDashboardStats; adminName: string }) => {
  const t = useTranslation();
  return <div className="clinical-admin-board" id="admin-overview">
    <aside className="clinical-admin-sidebar">
      <div className="clinical-admin-brand"><span><Icon name="local_hospital" /></span><div><strong>MN Hospital</strong><small>{t('dashboard.adminWorkspace')}</small></div></div>
      <nav aria-label={t('dashboard.adminNavigation')}>
        <a className="active" href="#admin-overview" aria-current="page"><Icon name="dashboard" />{t('dashboard.title')}</a>
        <Link href="/doctor"><Icon name="stethoscope" />{t('nav.doctors')}</Link>
        <Link href="/service"><Icon name="medical_services" />{t('nav.services')}</Link>
        <Link href="/mypage/messages"><Icon name="mail" />{t('messages.title')}</Link>
        <Link href="/mypage/notifications"><Icon name="notifications" />{t('notifications.title')}</Link>
      </nav>
      <Link className="clinical-admin-profile-link" href="/mypage"><Icon name="person" /><span>{adminName}</span></Link>
    </aside>
    <div className="clinical-admin-main">
      <div className="clinical-admin-heading"><div><span className="clinical-section-kicker">{t('dashboard.kicker')}</span><h2>{t('dashboard.adminTitle')}</h2><p>{t('dashboard.intro')}</p></div><Link href="/mypage/notifications" aria-label={t('notifications.title')}><Icon name="notifications" /></Link></div>
      <div className="clinical-admin-summary">
        <SummaryCard icon="groups" label={t('dashboard.patients')} value={stats.totalPatients} />
        <SummaryCard icon="event" label={t('dashboard.appointments')} value={stats.totalAppointments} />
        <SummaryCard icon="stethoscope" label={t('dashboard.activeDoctors')} value={stats.activeDoctors} detail={` / ${stats.totalDoctors}`} />
        <SummaryCard icon="receipt_long" label={t('dashboard.bookings')} value={stats.totalBookings} />
      </div>
      <div className="clinical-admin-panels">
        <section className="clinical-admin-panel" id="admin-operations"><header><h3>{t('dashboard.adminOperations')}</h3></header><dl>
          <div><dt>{t('dashboard.activePatients')}</dt><dd>{stats.activePatients.toLocaleString()}</dd></div>
          <div><dt>{t('dashboard.patients')}</dt><dd>{stats.totalPatients.toLocaleString()}</dd></div>
          <div><dt>{t('dashboard.bookings')}</dt><dd>{stats.totalBookings.toLocaleString()}</dd></div>
          <div><dt>{t('dashboard.appointments')}</dt><dd>{stats.totalAppointments.toLocaleString()}</dd></div>
        </dl></section>
        <section className="clinical-admin-panel" id="admin-staff"><header><h3>{t('dashboard.adminStaff')}</h3></header><dl>
          <div><dt>{t('dashboard.activeDoctors')}</dt><dd>{stats.activeDoctors.toLocaleString()} / {stats.totalDoctors.toLocaleString()}</dd></div>
          <div><dt>{t('dashboard.activeReceptionists')}</dt><dd>{stats.activeReceptionists.toLocaleString()} / {stats.totalReceptionists.toLocaleString()}</dd></div>
        </dl><Link className="clinical-admin-panel-link" href="/doctor">{t('nav.doctors')} <Icon name="arrow_forward" /></Link></section>
      </div>
    </div>
  </div>;
};

export default AdminDashboard;
