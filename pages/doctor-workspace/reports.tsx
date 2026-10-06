import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_DOCTOR_REPORTS } from '@/apollo/staff-workspace/query';
import { CREATE_DOCTOR_REPORT } from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { DoctorReport, StaffList } from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
export default function DoctorReports() {
  const t = useTranslation();
  const router = useRouter();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [followUp, setFollowUp] = useState<'NONE' | 'OPTIONAL' | 'REQUIRED'>('NONE');
  const { data, loading, error, refetch } = useQuery<{ getMyDoctorReports: StaffList<DoctorReport> }>(GET_DOCTOR_REPORTS, {
    variables: { input: { page, limit: LIMIT } }, skip: !session._id || session.memberType !== MemberType.DOCTOR, fetchPolicy: 'network-only',
  });
  const [createReport, createState] = useMutation(CREATE_DOCTOR_REPORT);
  const list = data?.getMyDoctorReports.list ?? [];
  const total = data?.getMyDoctorReports.metaCounter?.[0]?.total ?? 0;
  const appointmentId = typeof router.query.appointmentId === 'string' ? router.query.appointmentId : '';
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback('');
    const form = event.currentTarget;
    const values = new FormData(form);
    const followUpDate = String(values.get('followUpDate') ?? '');
    const input = {
      appointmentId: String(values.get('appointmentId') ?? '').trim(),
      docReportSymptoms: String(values.get('symptoms') ?? '').trim(),
      docReportDiagnosis: String(values.get('diagnosis') ?? '').trim(),
      docReportMedication: String(values.get('medication') ?? '').trim(),
      docReportFollowUp: followUp,
      ...(followUpDate ? { docReportFollowUpDate: new Date(`${followUpDate}T12:00:00`).toISOString() } : {}),
    };
    try {
      await createReport({ variables: { input } });
      form.reset(); setFollowUp('NONE'); setPage(1); await refetch({ input: { page: 1, limit: LIMIT } });
      setFeedback(t('admin.saved'));
      if (appointmentId) void router.replace('/doctor-workspace/reports', undefined, { shallow: true });
    } catch (requestError: any) { setFeedback(requestError?.message ?? t('admin.actionError')); }
  };

  return <StaffRolePage role={MemberType.DOCTOR} titleKey="dashboard.myReports" introKey="staff.reportsIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('staff.createReport')}</h2></header>
      <p className="clinical-staff-state">{t('staff.reportOnlyAfterVisit')}</p>
      <form className="clinical-staff-form" onSubmit={(event) => void submit(event)} key={appointmentId || 'new'}>
        <label>{t('staff.appointmentId')}<input name="appointmentId" defaultValue={appointmentId} required /></label>
        <label>{t('staff.symptoms')}<textarea name="symptoms" maxLength={5000} required /></label>
        <label>{t('staff.diagnosis')}<textarea name="diagnosis" maxLength={5000} required /></label>
        <label>{t('staff.medication')}<textarea name="medication" maxLength={5000} required /></label>
        <label>{t('staff.followUp')}<select value={followUp} onChange={(event) => setFollowUp(event.target.value as typeof followUp)}><option value="NONE">{t('staff.none')}</option><option value="OPTIONAL">{t('staff.optional')}</option><option value="REQUIRED">{t('staff.required')}</option></select></label>
        {followUp === 'REQUIRED' && <label>{t('staff.followUp')}<input name="followUpDate" type="date" required /></label>}
        <button type="submit" disabled={createState.loading}>{t('staff.createReport')}</button>
      </form>
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
    </section>
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.myReports')}</h2></header>
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!loading && !error && !!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('staff.appointmentId')}</th><th>{t('staff.patientId')}</th><th>{t('staff.diagnosis')}</th><th>{t('staff.followUp')}</th></tr></thead><tbody>{list.map((report) => <tr key={report._id}><td>{report.appointmentId}</td><td>{report.patientId}</td><td><strong>{report.docReportDiagnosis}</strong><small>{report.docReportSymptoms}</small></td><td>{report.docReportFollowUp}</td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </StaffRolePage>;
}
