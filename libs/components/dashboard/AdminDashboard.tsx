import Link from 'next/link';
import { useQuery } from '@apollo/client';
import Icon from '@/libs/components/common/Icon';
import { GET_MY_NOTIFICATIONS } from '@/apollo/notification/query';
import { NotificationItem } from '@/libs/components/notification/types';
import { AdminDashboardStats } from './types';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';

const SummaryCard = ({ icon, label, value, detail }: { icon: string; label: string; value: number; detail?: string }) =>
  <article className="clinical-admin-summary-card"><span className="clinical-admin-summary-icon"><Icon name={icon} /></span><div><small>{label}</small><strong>{value.toLocaleString()}{detail && <em>{detail}</em>}</strong></div></article>;

const AdminDashboard = ({ stats }: { stats: AdminDashboardStats }) => {
  const t = useTranslation();
  const { language } = usePreferences();
  const format = new Intl.DateTimeFormat({ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language], { dateStyle: 'medium', timeStyle: 'short' });
  const updates = useQuery<{ getMyNotifications: { list: NotificationItem[] } }>(GET_MY_NOTIFICATIONS, {
    variables: { input: { page: 1, limit: 4 } }, fetchPolicy: 'no-cache',
  });
  return <div className="clinical-staff-admin-content">
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
        </dl><Link className="clinical-admin-panel-link" href="/admin/doctors">{t('nav.doctors')} <Icon name="arrow_forward" /></Link></section>
        <section className="clinical-admin-panel clinical-admin-updates" id="admin-updates"><header><h3>{t('dashboard.adminRecent')}</h3><Link href="/admin/notifications">{t('dashboard.adminViewAll')} <Icon name="arrow_forward" /></Link></header>
          {updates.loading && <p className="clinical-query-status">{t('notifications.loading')}</p>}
          {updates.error && <p className="clinical-form-error" role="alert">{t('notifications.loadError')}</p>}
          {!updates.loading && !updates.error && !updates.data?.getMyNotifications.list.length && <p className="clinical-admin-empty">{t('dashboard.adminEmpty')}</p>}
          {!updates.loading && !updates.error && !!updates.data?.getMyNotifications.list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('notifications.title')}</th><th>{t('dashboard.appointmentTime')}</th><th>{t('dashboard.appointmentStatus')}</th></tr></thead><tbody>{updates.data.getMyNotifications.list.map((item) => <tr key={item._id}><td><strong>{item.notificationTitle}</strong><small>{item.notificationDesc}</small></td><td><time dateTime={item.createdAt}>{format.format(new Date(item.createdAt))}</time></td><td><span className={`clinical-staff-status ${item.notificationStatus === 'UNREAD' ? '' : 'status-completed'}`}>{t(item.notificationStatus === 'UNREAD' ? 'notifications.unread' : item.notificationStatus === 'ARCHIVED' ? 'notifications.archived' : 'notifications.read')}</span></td></tr>)}</tbody></table></div>}
        </section>
      </div>
  </div>;
};

export default AdminDashboard;
