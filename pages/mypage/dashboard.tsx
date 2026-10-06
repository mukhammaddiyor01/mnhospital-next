import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { GET_ADMIN_DASHBOARD_STATS, GET_MY_DOCTOR_DASHBOARD_STATS, GET_MY_RECEPTIONIST_DASHBOARD_STATS } from '@/apollo/dashboard/query';
import { AdminDashboardStats, DoctorDashboardStats, ReceptionistDashboardStats } from '@/libs/components/dashboard/types';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MessageKey } from '@/libs/i18n/messages';

const Metric = ({ label, value }: { label: string; value: number }) =>
  <div className="clinical-dashboard-metric"><span>{label}</span><strong>{value.toLocaleString()}</strong></div>;

const Dashboard = () => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const role = session.memberType;
  const admin = useQuery<{ getAdminDashboardStats: AdminDashboardStats }>(GET_ADMIN_DASHBOARD_STATS, {
    skip: !session._id || role !== MemberType.ADMIN, fetchPolicy: 'cache-and-network',
  });
  const doctor = useQuery<{ getMyDoctorDashboardStats: DoctorDashboardStats }>(GET_MY_DOCTOR_DASHBOARD_STATS, {
    skip: !session._id || role !== MemberType.DOCTOR, fetchPolicy: 'cache-and-network',
  });
  const receptionist = useQuery<{ getMyReceptionistDashboardStats: ReceptionistDashboardStats }>(GET_MY_RECEPTIONIST_DASHBOARD_STATS, {
    skip: !session._id || role !== MemberType.RECEPTIONIST, fetchPolicy: 'cache-and-network',
  });
  const request = role === MemberType.ADMIN ? admin : role === MemberType.DOCTOR ? doctor : receptionist;
  const titleKey: MessageKey = role === MemberType.ADMIN ? 'dashboard.adminTitle' : role === MemberType.DOCTOR ? 'dashboard.doctorTitle' : 'dashboard.receptionistTitle';
  const retry = () => { void request.refetch(); };

  return <div className="clinical-inner-page">
    <section className="clinical-inner-hero"><div className="clinical-crumb"><Link href="/">{t('page.home')}</Link> / <Link href="/mypage">{t('page.profile')}</Link> / {t('dashboard.title')}</div><span className="clinical-eyebrow">{t('dashboard.kicker')}</span><h1>{t(titleKey)}</h1><p>{t('dashboard.intro')}</p></section>
    {!session._id || role === MemberType.PATIENT || !role ? <section className="clinical-inner-section clinical-auth-gate"><h2>{t('dashboard.restricted')}</h2><p>{t('dashboard.restrictedIntro')}</p><Link className="clinical-secondary-button" href="/mypage">{t('page.profile')}</Link></section> : <>
      {request.loading && !request.data && <section className="clinical-inner-section"><p className="clinical-query-status">{t('dashboard.loading')}</p></section>}
      {request.error && !request.data && <section className="clinical-inner-section"><p className="clinical-form-error" role="alert">{t('dashboard.loadError')}</p><button type="button" className="clinical-secondary-button" onClick={retry}>{t('patient.retry')}</button></section>}
      {role === MemberType.ADMIN && admin.data && <div className="clinical-dashboard clinical-dashboard-admin">
        <section className="clinical-dashboard-group"><header><span>{t('dashboard.adminPeople')}</span><strong>{t('dashboard.adminOverview')}</strong></header><div className="clinical-dashboard-metrics"><Metric label={t('dashboard.patients')} value={admin.data.getAdminDashboardStats.totalPatients} /><Metric label={t('dashboard.activePatients')} value={admin.data.getAdminDashboardStats.activePatients} /><Metric label={t('dashboard.doctors')} value={admin.data.getAdminDashboardStats.totalDoctors} /><Metric label={t('dashboard.activeDoctors')} value={admin.data.getAdminDashboardStats.activeDoctors} /><Metric label={t('dashboard.receptionists')} value={admin.data.getAdminDashboardStats.totalReceptionists} /><Metric label={t('dashboard.activeReceptionists')} value={admin.data.getAdminDashboardStats.activeReceptionists} /></div></section>
        <section className="clinical-dashboard-group"><header><span>{t('dashboard.adminFlow')}</span><strong>{t('dashboard.adminActivity')}</strong></header><div className="clinical-dashboard-metrics"><Metric label={t('dashboard.bookings')} value={admin.data.getAdminDashboardStats.totalBookings} /><Metric label={t('dashboard.appointments')} value={admin.data.getAdminDashboardStats.totalAppointments} /></div></section>
      </div>}
      {role === MemberType.DOCTOR && doctor.data && <div className="clinical-dashboard clinical-dashboard-doctor">
        <section className="clinical-dashboard-group"><header><span>{t('dashboard.doctorCare')}</span><strong>{session.memberFullName || session.memberNick}</strong></header><div className="clinical-dashboard-metrics"><Metric label={t('dashboard.myServices')} value={doctor.data.getMyDoctorDashboardStats.serviceCount} /><Metric label={t('dashboard.myPatients')} value={doctor.data.getMyDoctorDashboardStats.patientCount} /><Metric label={t('dashboard.myAppointments')} value={doctor.data.getMyDoctorDashboardStats.appointmentCount} /><Metric label={t('dashboard.completedAppointments')} value={doctor.data.getMyDoctorDashboardStats.completedAppointmentCount} /><Metric label={t('dashboard.myReports')} value={doctor.data.getMyDoctorDashboardStats.reportCount} /></div></section>
        <section className="clinical-dashboard-links"><Link href={`/doctor/${session._id}`}>{t('patient.openDoctor')}</Link><Link href="/mypage/messages">{t('messages.title')}</Link><Link href="/mypage/notifications">{t('notifications.title')}</Link></section>
      </div>}
      {role === MemberType.RECEPTIONIST && receptionist.data && <div className="clinical-dashboard clinical-dashboard-receptionist">
        <section className="clinical-dashboard-group"><header><span>{t('dashboard.receptionistQueue')}</span><strong>{t('dashboard.receptionistTasks')}</strong></header><div className="clinical-dashboard-metrics"><Metric label={t('dashboard.allTasks')} value={receptionist.data.getMyReceptionistDashboardStats.taskCount} /><Metric label={t('dashboard.pendingTasks')} value={receptionist.data.getMyReceptionistDashboardStats.pendingTaskCount} /><Metric label={t('dashboard.acceptedTasks')} value={receptionist.data.getMyReceptionistDashboardStats.acceptedTaskCount} /><Metric label={t('dashboard.inProgressTasks')} value={receptionist.data.getMyReceptionistDashboardStats.inProgressTaskCount} /><Metric label={t('dashboard.completedTasks')} value={receptionist.data.getMyReceptionistDashboardStats.completedTaskCount} /><Metric label={t('dashboard.cancelledTasks')} value={receptionist.data.getMyReceptionistDashboardStats.cancelledTaskCount} /></div></section>
        <section className="clinical-dashboard-links"><Link href="/mypage/messages">{t('messages.title')}</Link><Link href="/mypage/notifications">{t('notifications.title')}</Link></section>
      </div>}
    </>}
  </div>;
};

export default withLayoutMain(Dashboard);
