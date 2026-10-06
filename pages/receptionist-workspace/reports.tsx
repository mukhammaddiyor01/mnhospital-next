import { useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTIONIST_REPORTS } from '@/apollo/staff-workspace/query';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { DoctorReport, StaffList } from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
export default function ReceptionistReports() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const { data, loading, error } = useQuery<{ getMyReceptionistReports: StaffList<DoctorReport> }>(GET_RECEPTIONIST_REPORTS, {
    variables: { input: { page, limit: LIMIT } }, skip: !session._id || session.memberType !== MemberType.RECEPTIONIST, fetchPolicy: 'network-only',
  });
  const list = data?.getMyReceptionistReports.list ?? [];
  const total = data?.getMyReceptionistReports.metaCounter?.[0]?.total ?? 0;
  return <StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.myReports" introKey="staff.reportsIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.myReports')}</h2></header>
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!loading && !error && !!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('staff.appointmentId')}</th><th>{t('staff.patientId')}</th><th>{t('staff.diagnosis')}</th><th>{t('staff.followUp')}</th></tr></thead><tbody>{list.map((report) => <tr key={report._id}><td>{report.appointmentId}</td><td>{report.patientId}</td><td><strong>{report.docReportDiagnosis}</strong><small>{report.docReportSymptoms}</small></td><td>{report.docReportFollowUp}</td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </StaffRolePage>;
}
