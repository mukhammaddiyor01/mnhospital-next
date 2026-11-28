import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { clinicDateTime } from '@/libs/payments/clinic';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTIONIST_REPORTS } from '@/apollo/staff-workspace/query';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import {
	DoctorReport,
	StaffList,
} from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
export default function ReceptionistReports() {
	const t = useTranslation();
	const w = useWorkspaceText();
    const clinic = useClinicSettings();
	const session = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const { data, loading, error, refetch } = useQuery<{ getMyReceptionistReports: StaffList<DoctorReport> }>(GET_RECEPTIONIST_REPORTS, {
    variables: { input: { page, limit: LIMIT } }, skip: !session._id || session.memberType !== MemberType.RECEPTIONIST, fetchPolicy: 'network-only',
  });
	useLiveWorkspaceRefresh(
		() => refetch(),
		Boolean(session._id && session.memberType === MemberType.RECEPTIONIST),
	);
	const list = data?.getMyReceptionistReports.list ?? [];
	const total = data?.getMyReceptionistReports.metaCounter?.[0]?.total ?? 0;
	return (
		<StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.myReports" introKey="staff.reportsIntro">
			<section className="clinical-staff-panel clinical-admin-resource">
				<header><h2>{t('dashboard.myReports')}</h2></header>
				{loading && (
					<p className="clinical-staff-state">{t('dashboard.loading')}</p>
				)}
				{error && (
					<p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>
				)}
				{!loading && !error && !list.length && (
					<p className="clinical-staff-state">{t('admin.noResults')}</p>
				)}
				{!loading && !error && !!list.length && (
					<div className="clinical-staff-table-scroll">
						<table>
							<thead>
								<tr>
									<th>{w('appointment')}</th>
									<th>{w('patient')}</th>
									<th>{t('staff.diagnosis')}</th>
									<th>{t('staff.followUp')}</th>
								</tr>
							</thead>
							<tbody>
								{list.map((report) => (
									<tr key={report._id}>
										<td>{recordReference(report.appointmentCode)}<small>{report.serviceName}</small></td>
										<td>{report.patientName || w('patient')}</td>
										<td><strong>{report.docReportDiagnosis}</strong><small>{report.docReportSymptoms}</small></td>
										<td>
											{t(({ NONE: 'staff.none', OPTIONAL: 'staff.optional', REQUIRED: 'staff.required' } as const)[report.docReportFollowUp ?? 'NONE'] ?? 'staff.none')}
											<small>{report.docReportRecommendation}</small>{report.docReportFollowUpDate && <small>{clinicDateTime(report.docReportFollowUpDate, 'en-US', clinic.timeZone)}</small>}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				<AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
			</section>
		</StaffRolePage>
	);
}
