import RecordThumbnail from '@/libs/components/common/RecordThumbnail';
import thumbnailStyles from '@/libs/components/common/RecordThumbnail.module.scss';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTIONIST_QUEUE } from '@/apollo/staff-workspace/query';
import { CHECK_IN_RECEPTIONIST_APPOINTMENT, UPDATE_APPOINTMENT_STATUS } from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { AppointmentStatus, StaffAppointment, StaffList } from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { appointmentStatusKeys } from '@/libs/components/dashboard/staffLabels';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';

const LIMIT = 10;
export default function ReceptionistAppointments() {
  const t = useTranslation();
  const w = useWorkspaceText();
  const { language } = usePreferences();
  const format = new Intl.DateTimeFormat({ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language], { dateStyle: 'medium', timeStyle: 'short' });
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState('');
  const authorized = Boolean(session._id && session.memberType === MemberType.RECEPTIONIST);
  const { data, loading, error, refetch } = useQuery<{ getMyReceptionistAppointmentQueue: StaffList<StaffAppointment> }>(GET_RECEPTIONIST_QUEUE, {
    variables: { input: { page, limit: LIMIT } }, skip: !authorized, fetchPolicy: 'network-only',
  });
  const [updateStatus] = useMutation(UPDATE_APPOINTMENT_STATUS);
  const [checkIn] = useMutation(CHECK_IN_RECEPTIONIST_APPOINTMENT);
  const list = data?.getMyReceptionistAppointmentQueue.list ?? [];
  const total = data?.getMyReceptionistAppointmentQueue.metaCounter?.[0]?.total ?? 0;
  const act = async (appointment: StaffAppointment, status: AppointmentStatus | 'CHECK_IN') => {
    const allowed = appointment.appointmentStatus === 'PENDING' ? ['CONFIRMED', 'NO_SHOW'] : appointment.appointmentStatus === 'CONFIRMED' ? ['NO_SHOW', 'CHECK_IN'] : [];
    if (!allowed.includes(status)) return;
    setBusyId(appointment._id); setFeedback('');
    try {
      if (status === 'CHECK_IN') await checkIn({ variables: { input: { appointmentId: appointment._id } } });
      else await updateStatus({ variables: { input: { appointmentId: appointment._id, appointmentStatus: status } } });
      await refetch(); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFeedback(requestError?.message ?? t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  return <StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.myAppointments" introKey="staff.appointmentsIntro">
    <p>{w('receptionAppointmentScope')}</p>
    <div className="clinical-resource-actions"><Link href="/receptionist-workspace/bookings">{w('bookings')}</Link></div>
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.myAppointments')}</h2></header>
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('dashboard.appointmentsError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('dashboard.noAppointments')}</p>}
      {!loading && !error && !!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('dashboard.appointmentCode')}</th><th>{t('dashboard.appointmentTime')}</th><th>{t('staff.patientId')}</th><th>{t('dashboard.appointmentStatus')}</th><th>{t('staff.update')}</th></tr></thead><tbody>{list.map((appointment) => <tr key={appointment._id}><td><strong>{appointment.appointmentCode}</strong><small>{appointment.appointmentReason}</small></td><td><time dateTime={appointment.startsAt}>{format.format(new Date(appointment.startsAt))}</time></td><td><span className={thumbnailStyles.identity}><RecordThumbnail image={appointment.patientPreview?.patientImage} name={appointment.patientPreview?.patientFullName || appointment.patientId} portrait /><span>{appointment.patientPreview?.patientFullName && <small>{appointment.patientPreview.patientFullName}</small>}{appointment.patientId}</span></span></td><td><span className={`clinical-staff-status status-${appointment.appointmentStatus.toLowerCase()}`}>{t(appointmentStatusKeys[appointment.appointmentStatus])}</span></td><td><div className="clinical-staff-row-actions">{appointment.appointmentStatus === 'PENDING' && <button type="button" disabled={busyId === appointment._id} onClick={() => void act(appointment, 'CONFIRMED')}>{t('dashboard.statusConfirmed')}</button>}{['PENDING', 'CONFIRMED'].includes(appointment.appointmentStatus) && <button type="button" disabled={busyId === appointment._id} onClick={() => void act(appointment, 'NO_SHOW')}>{t('dashboard.statusNoShow')}</button>}{appointment.appointmentStatus === 'CONFIRMED' && <button type="button" disabled={busyId === appointment._id} onClick={() => void act(appointment, 'CHECK_IN')}>{t('staff.checkIn')}</button>}<Link href={`/receptionist-workspace/tasks?appointmentId=${appointment._id}`}>{t('staff.createTask')}</Link></div></td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </StaffRolePage>;
}
