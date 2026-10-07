import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { ReceptionistDashboardStats, WorkspaceAppointment } from './types';
import { appointmentStatusKeys } from './staffLabels';
import ReceptionTaskPreview from './ReceptionTaskPreview';

type QueueFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS';

const ReceptionistDashboard = ({ stats, appointments, loading, error }: {
  stats: ReceptionistDashboardStats;
  appointments?: WorkspaceAppointment[];
  loading: boolean;
  error: boolean;
}) => {
  const t = useTranslation();
  const { language } = usePreferences();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<QueueFilter>('ALL');
  const [selectedId, setSelectedId] = useState('');
  const format = new Intl.DateTimeFormat({ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language], { dateStyle: 'medium', timeStyle: 'short' });
  const term = search.trim().toLocaleLowerCase();
  const visible = (appointments ?? []).filter((item) =>
    (filter === 'ALL' || item.appointmentStatus === filter) &&
    (!term || `${item.appointmentCode} ${item.appointmentReason}`.toLocaleLowerCase().includes(term)),
  );
  const selected = visible.find((item) => item._id === selectedId) ?? visible[0];
  const openTasks = stats.pendingTaskCount + stats.acceptedTaskCount + stats.inProgressTaskCount;
  const metrics = [
    { icon: 'hourglass_top', label: t('dashboard.pendingTasks'), value: stats.pendingTaskCount },
    { icon: 'assignment_turned_in', label: t('dashboard.acceptedTasks'), value: stats.acceptedTaskCount },
    { icon: 'pending_actions', label: t('dashboard.inProgressTasks'), value: stats.inProgressTaskCount },
    { icon: 'task_alt', label: t('dashboard.completedTasks'), value: stats.completedTaskCount },
    { icon: 'cancel', label: t('dashboard.cancelledTasks'), value: stats.cancelledTaskCount },
  ];
  const filters: QueueFilter[] = ['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS'];

  return <div className="clinical-reception-dashboard">
    <div className="clinical-resource-actions"><Link href="/receptionist-workspace/bookings">{t('dashboard.bookings')}</Link></div>
    <section className="clinical-reception-ledger" aria-labelledby="reception-ledger-heading">
      <header><div><Icon name="support_agent" /><h2 id="reception-ledger-heading">{t('dashboard.receptionistTasks')}</h2></div><span>{t('dashboard.allTasks')} <strong>{stats.taskCount.toLocaleString()}</strong></span></header>
      <div className="clinical-reception-ledger-grid">
        <article className="clinical-reception-open"><div><small>{t('dashboard.pendingWork')}</small><strong>{openTasks.toLocaleString()}</strong><p>{t('dashboard.pendingTasks')} + {t('dashboard.acceptedTasks')} + {t('dashboard.inProgressTasks')}</p></div><Icon name="assignment" /></article>
        {metrics.map((metric) => <article key={metric.label}><div><small>{metric.label}</small><Icon name={metric.icon} /></div><strong>{metric.value.toLocaleString()}</strong></article>)}
      </div>
    </section>

    <div className="clinical-reception-board">
      <section className="clinical-reception-queue" aria-labelledby="reception-queue-heading">
        <header><div><Icon name="calendar_view_day" /><h2 id="reception-queue-heading">{t('dashboard.receptionQueue')}</h2><span>{appointments?.length ?? 0}</span></div><Link href="/receptionist-workspace/appointments">{t('dashboard.myAppointments')} <Icon name="arrow_forward" /></Link></header>
        <div className="clinical-reception-controls"><label><Icon name="search" /><span className="sr-only">{t('dashboard.receptionSearch')}</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('dashboard.receptionSearch')} /></label><div className="clinical-reception-filters" role="group" aria-label={t('dashboard.appointmentStatus')}>{filters.map((status) => <button key={status} type="button" aria-pressed={filter === status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>{t(status === 'ALL' ? 'notifications.all' : appointmentStatusKeys[status])}</button>)}</div></div>
        {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
        {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('dashboard.appointmentsError')}</p>}
        {!loading && !error && !visible.length && <p className="clinical-staff-state">{t('dashboard.noAppointments')}</p>}
        {!loading && !error && visible.length > 0 && <div className="clinical-reception-queue-list">{visible.map((item) => <button key={item._id} type="button" className={`clinical-reception-queue-row${selected?._id === item._id ? ' active' : ''}`} aria-pressed={selected?._id === item._id} onClick={() => setSelectedId(item._id)}><span className="clinical-reception-row-top"><strong>{item.appointmentCode}</strong><time dateTime={item.startsAt}>{format.format(new Date(item.startsAt))}</time></span><span className="clinical-reception-row-bottom"><span>{item.appointmentReason || '—'}</span><span className={`clinical-staff-status status-${item.appointmentStatus.toLowerCase()}`}>{t(appointmentStatusKeys[item.appointmentStatus])}</span><Icon name="chevron_right" /></span></button>)}</div>}
      </section>

      <div className="clinical-reception-context">
        <section className="clinical-reception-detail" aria-labelledby="reception-detail-heading"><header><Icon name="event_note" /><h2 id="reception-detail-heading">{t('dashboard.selectedAppointment')}</h2></header>
          {selected && !loading && !error ? <div className="clinical-reception-detail-body"><div className="clinical-reception-detail-lead"><strong>{selected.appointmentCode}</strong><span className={`clinical-staff-status status-${selected.appointmentStatus.toLowerCase()}`}>{t(appointmentStatusKeys[selected.appointmentStatus])}</span></div><dl><div><dt>{t('dashboard.appointmentTime')}</dt><dd><time dateTime={selected.startsAt}>{format.format(new Date(selected.startsAt))}</time></dd></div><div><dt>{t('staff.reason')}</dt><dd>{selected.appointmentReason || '—'}</dd></div></dl><div className="clinical-reception-detail-actions"><Link href="/receptionist-workspace/appointments"><Icon name="event_available" />{t('dashboard.myAppointments')}</Link><Link href={`/receptionist-workspace/tasks?appointmentId=${selected._id}`}><Icon name="post_add" />{t('staff.createTask')}</Link></div></div> : <p className="clinical-staff-state">{t('dashboard.selectAppointment')}</p>}
        </section>
        <ReceptionTaskPreview />
        <nav className="clinical-reception-comms" aria-label={t('dashboard.workspaceNavigation')}><Link href="/receptionist-workspace/messages"><Icon name="mail" />{t('messages.title')}</Link><Link href="/receptionist-workspace/notifications"><Icon name="notifications" />{t('notifications.title')}</Link></nav>
      </div>
    </div>
  </div>;
};

export default ReceptionistDashboard;
