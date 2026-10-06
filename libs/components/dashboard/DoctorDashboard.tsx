import { useState } from 'react';
import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { MessageKey } from '@/libs/i18n/messages';
import { DoctorDashboardStats, WorkspaceAppointment } from './types';

const statusKeys: Record<WorkspaceAppointment['appointmentStatus'], MessageKey> = {
  PENDING: 'dashboard.statusPending', CONFIRMED: 'dashboard.statusConfirmed',
  IN_PROGRESS: 'dashboard.statusInProgress', ENDED: 'dashboard.statusEnded',
  COMPLETED: 'dashboard.statusCompleted', CANCELLED: 'dashboard.statusCancelled',
  NO_SHOW: 'dashboard.statusNoShow',
};
type QueueFilter = 'ALL' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED';

const DoctorDashboard = ({ stats, appointments, loading, error, doctorId }: {
  stats: DoctorDashboardStats;
  appointments?: WorkspaceAppointment[];
  loading: boolean;
  error: boolean;
  doctorId: string;
}) => {
  const t = useTranslation();
  const { language } = usePreferences();
  const [filter, setFilter] = useState<QueueFilter>('ALL');
  const [selectedId, setSelectedId] = useState('');
  const format = new Intl.DateTimeFormat({ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language], { dateStyle: 'medium', timeStyle: 'short' });
  const visible = (appointments ?? []).filter((item) => filter === 'ALL' || item.appointmentStatus === filter);
  const selected = visible.find((item) => item._id === selectedId) ?? visible[0];
  const filters: { value: QueueFilter; label: string }[] = [
    { value: 'ALL', label: t('notifications.all') },
    { value: 'CONFIRMED', label: t('dashboard.statusConfirmed') },
    { value: 'IN_PROGRESS', label: t('dashboard.statusInProgress') },
    { value: 'COMPLETED', label: t('dashboard.statusCompleted') },
  ];
  const metrics = [
    { icon: 'event', label: t('dashboard.myAppointments'), value: stats.appointmentCount },
    { icon: 'task_alt', label: t('dashboard.completedAppointments'), value: stats.completedAppointmentCount },
    { icon: 'groups', label: t('dashboard.myPatients'), value: stats.patientCount },
    { icon: 'description', label: t('dashboard.myReports'), value: stats.reportCount },
    { icon: 'medical_services', label: t('dashboard.myServices'), value: stats.serviceCount },
  ];

  return <div className="clinical-doctor-dashboard">
    <section className="clinical-doctor-ribbon" aria-label={t('dashboard.workSummary')}>
      <div className="clinical-doctor-ribbon-heading"><span className="clinical-doctor-ribbon-mark" /><span>{t('dashboard.doctorCare')}</span><small>{t('dashboard.intro')}</small></div>
      <div className="clinical-doctor-ribbon-grid">{metrics.map((metric) => <article key={metric.label}><div><span>{metric.label}</span><Icon name={metric.icon} /></div><strong>{metric.value.toLocaleString()}</strong></article>)}</div>
    </section>

    <div className="clinical-doctor-board">
      <section className="clinical-doctor-queue" aria-labelledby="doctor-queue-heading">
        <header><div><Icon name="calendar_view_day" /><h2 id="doctor-queue-heading">{t('dashboard.doctorQueue')}</h2><span>{appointments?.length ?? 0}</span></div><Link href="/doctor-workspace/appointments">{t('dashboard.myAppointments')} <Icon name="arrow_forward" /></Link></header>
        <div className="clinical-doctor-filters" role="group" aria-label={t('dashboard.appointmentStatus')}>{filters.map((item) => <button key={item.value} type="button" className={filter === item.value ? 'active' : ''} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div>
        {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
        {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('dashboard.appointmentsError')}</p>}
        {!loading && !error && !visible.length && <p className="clinical-staff-state">{t('dashboard.noAppointments')}</p>}
        {!loading && !error && !!visible.length && <div className="clinical-doctor-queue-list">{visible.map((item) => <button key={item._id} type="button" className={`clinical-doctor-queue-item${selected?._id === item._id ? ' active' : ''}`} aria-pressed={selected?._id === item._id} onClick={() => setSelectedId(item._id)}><span className="clinical-doctor-queue-item-top"><strong>{item.appointmentCode}</strong><time dateTime={item.startsAt}>{format.format(new Date(item.startsAt))}</time></span><span className="clinical-doctor-queue-item-bottom"><span>{item.appointmentReason || t('staff.reason')}</span><span className={`clinical-staff-status status-${item.appointmentStatus.toLowerCase()}`}>{t(statusKeys[item.appointmentStatus])}</span></span></button>)}</div>}
      </section>

      <div className="clinical-doctor-detail-column">
        <section className="clinical-doctor-detail" aria-labelledby="doctor-detail-heading"><header><Icon name="clinical_notes" /><h2 id="doctor-detail-heading">{t('dashboard.selectedAppointment')}</h2></header>
          {selected && !loading && !error ? <div className="clinical-doctor-detail-body"><div className="clinical-doctor-detail-lead"><span className="clinical-doctor-detail-icon"><Icon name="event" /></span><div><small>{t('dashboard.appointmentCode')}</small><strong>{selected.appointmentCode}</strong></div><span className={`clinical-staff-status status-${selected.appointmentStatus.toLowerCase()}`}>{t(statusKeys[selected.appointmentStatus])}</span></div><dl><div><dt>{t('dashboard.appointmentTime')}</dt><dd><time dateTime={selected.startsAt}>{format.format(new Date(selected.startsAt))}</time></dd></div><div><dt>{t('staff.reason')}</dt><dd>{selected.appointmentReason || '—'}</dd></div><div><dt>{t('dashboard.appointmentStatus')}</dt><dd>{t(statusKeys[selected.appointmentStatus])}</dd></div></dl><div className="clinical-doctor-detail-actions"><Link href="/doctor-workspace/appointments"><Icon name="sync_alt" />{t('staff.nextStatus')}</Link>{(selected.appointmentStatus === 'ENDED' || selected.appointmentStatus === 'COMPLETED') && <Link href={`/doctor-workspace/reports?appointmentId=${selected._id}`}><Icon name="post_add" />{t('staff.createReport')}</Link>}</div></div> : <p className="clinical-staff-state">{t('dashboard.selectAppointment')}</p>}
        </section>
        <section className="clinical-doctor-links" aria-labelledby="doctor-links-heading"><header><Icon name="dashboard_customize" /><h2 id="doctor-links-heading">{t('dashboard.workSummary')}</h2></header><nav><Link href="/doctor-workspace/services"><Icon name="medical_services" />{t('dashboard.myServices')}<Icon name="arrow_forward" /></Link><Link href="/doctor-workspace/reports"><Icon name="description" />{t('dashboard.myReports')}<Icon name="arrow_forward" /></Link><Link href="/doctor-workspace/messages"><Icon name="mail" />{t('messages.title')}<Icon name="arrow_forward" /></Link><Link href={`/doctor/${doctorId}`}><Icon name="open_in_new" />{t('patient.openDoctor')}<Icon name="arrow_forward" /></Link></nav></section>
      </div>
    </div>
  </div>;
};

export default DoctorDashboard;
