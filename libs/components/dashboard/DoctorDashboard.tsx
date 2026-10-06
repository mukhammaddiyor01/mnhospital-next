import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';
import AppointmentList from './AppointmentList';
import { DoctorDashboardStats, WorkspaceAppointment } from './types';

const DoctorDashboard = ({ stats, appointments, loading, error, doctorId }: {
  stats: DoctorDashboardStats;
  appointments?: WorkspaceAppointment[];
  loading: boolean;
  error: boolean;
  doctorId: string;
}) => {
  const t = useTranslation();
  const cards = [
    { icon: 'event', label: t('dashboard.myAppointments'), value: stats.appointmentCount },
    { icon: 'task_alt', label: t('dashboard.completedAppointments'), value: stats.completedAppointmentCount },
    { icon: 'groups', label: t('dashboard.myPatients'), value: stats.patientCount },
    { icon: 'description', label: t('dashboard.myReports'), value: stats.reportCount },
  ];

  return <div className="clinical-staff-dashboard-content">
    <div className="clinical-staff-metrics">{cards.map((card) => <article key={card.label} className="clinical-staff-metric"><div><span>{card.label}</span><Icon name={card.icon} /></div><strong>{card.value.toLocaleString()}</strong></article>)}</div>
    <div className="clinical-staff-panels">
      <AppointmentList appointments={appointments} loading={loading} error={error} />
      <section className="clinical-staff-panel clinical-staff-side-panel"><header><div><span className="clinical-staff-panel-kicker">{t('dashboard.doctorCare')}</span><h2>{t('dashboard.workSummary')}</h2></div></header><div className="clinical-staff-detail-row"><span>{t('dashboard.myServices')}</span><strong>{stats.serviceCount.toLocaleString()}</strong></div><div className="clinical-staff-detail-row"><span>{t('dashboard.myPatients')}</span><strong>{stats.patientCount.toLocaleString()}</strong></div><Link href={`/doctor/${doctorId}`}><Icon name="open_in_new" />{t('patient.openDoctor')}</Link><Link href="/mypage/messages"><Icon name="mail" />{t('messages.title')}</Link></section>
    </div>
  </div>;
};

export default DoctorDashboard;
