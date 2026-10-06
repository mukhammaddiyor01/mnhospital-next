import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';
import AppointmentList from './AppointmentList';
import { ReceptionistDashboardStats, WorkspaceAppointment } from './types';

const ReceptionistDashboard = ({ stats, appointments, loading, error }: {
  stats: ReceptionistDashboardStats;
  appointments?: WorkspaceAppointment[];
  loading: boolean;
  error: boolean;
}) => {
  const t = useTranslation();
  const openTasks = stats.pendingTaskCount + stats.acceptedTaskCount + stats.inProgressTaskCount;
  const cards = [
    { icon: 'assignment', label: t('dashboard.pendingWork'), value: openTasks },
    { icon: 'hourglass_top', label: t('dashboard.pendingTasks'), value: stats.pendingTaskCount },
    { icon: 'pending_actions', label: t('dashboard.inProgressTasks'), value: stats.inProgressTaskCount },
    { icon: 'task_alt', label: t('dashboard.completedTasks'), value: stats.completedTaskCount },
  ];

  return <div className="clinical-staff-dashboard-content">
    <div className="clinical-staff-metrics">{cards.map((card) => <article key={card.label} className="clinical-staff-metric"><div><span>{card.label}</span><Icon name={card.icon} /></div><strong>{card.value.toLocaleString()}</strong></article>)}</div>
    <div className="clinical-staff-panels">
      <AppointmentList appointments={appointments} loading={loading} error={error} />
      <section className="clinical-staff-panel clinical-staff-side-panel"><header><div><span className="clinical-staff-panel-kicker">{t('dashboard.receptionistQueue')}</span><h2>{t('dashboard.queueSummary')}</h2></div></header><div className="clinical-staff-detail-row"><span>{t('dashboard.allTasks')}</span><strong>{stats.taskCount.toLocaleString()}</strong></div><div className="clinical-staff-detail-row"><span>{t('dashboard.acceptedTasks')}</span><strong>{stats.acceptedTaskCount.toLocaleString()}</strong></div><div className="clinical-staff-detail-row"><span>{t('dashboard.cancelledTasks')}</span><strong>{stats.cancelledTaskCount.toLocaleString()}</strong></div><Link href="/mypage/messages"><Icon name="mail" />{t('messages.title')}</Link><Link href="/mypage/notifications"><Icon name="notifications" />{t('notifications.title')}</Link></section>
    </div>
  </div>;
};

export default ReceptionistDashboard;
