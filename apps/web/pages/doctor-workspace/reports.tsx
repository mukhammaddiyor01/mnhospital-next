import reportStyles from '@/libs/components/workspace/DoctorReportForm.module.scss';
import { useEffect } from 'react';
import Link from 'next/link';
import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { clinicDateTime } from '@/libs/payments/clinic';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { operation } from '@/apollo/workspace/operations';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import {
	GET_DOCTOR_REPORTS,
	GET_REPORT_APPOINTMENTS,
} from '@/apollo/staff-workspace/query';
import {
	CREATE_DOCTOR_REPORT,
	UPDATE_DOCTOR_REPORT,
} from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import {
	DoctorReport,
	StaffList,
} from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const DETAIL = operation(
	'query',
	'getMyDoctorReport',
	'String',
	'_id appointmentId patientId docReportSymptoms docReportObservations docReportDiagnosis docReportRecommendation docReportMedication docReportFollowUp docReportFollowUpDate createdAt',
	'reportId',
);
const LIMIT = 10;
export default function DoctorReports() {
	const t = useTranslation();
	const w = useWorkspaceText();
	const clinic = useClinicSettings();
	const [choicePage, setChoicePage] = useState(1);
	const [chosenAppointment, chooseAppointment] = useState('');
	const router = useRouter();
	const appointmentId =
		typeof router.query.appointmentId === 'string'
			? router.query.appointmentId
			: '';
	const session = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [feedback, setFeedback] = useState('');
	const [followUp, setFollowUp] = useState<'NONE' | 'OPTIONAL' | 'REQUIRED'>(
		'NONE',
	);
	const [editing, setEditing] = useState<DoctorReport | null>(null);
	const [editingFollowUp, setEditingFollowUp] = useState<
		'NONE' | 'OPTIONAL' | 'REQUIRED'
	>('NONE');
	const { data, loading, error, refetch } = useQuery<{
		getMyDoctorReports: StaffList<DoctorReport>;
	}>(GET_DOCTOR_REPORTS, {
		variables: { input: { page, limit: LIMIT } },
		skip: !session._id || session.memberType !== MemberType.DOCTOR,
		fetchPolicy: 'network-only',
	});
	const choices = useQuery(GET_REPORT_APPOINTMENTS, {
		variables: {
			input: {
				page: appointmentId ? 1 : choicePage,
				limit: 20,
				...(appointmentId ? { appointmentId } : {}),
			},
		},
		skip: !session._id || session.memberType !== MemberType.DOCTOR,
		fetchPolicy: 'network-only',
	});
	const visits = choices.data?.getMyDoctorReportAppointments.list ?? [];
	useLiveWorkspaceRefresh(
		async () => {
			await refetch();
			await choices.refetch();
		},
		Boolean(session._id && session.memberType === MemberType.DOCTOR),
	);
	const detail = useQuery(DETAIL, {
		variables: { reportId: editing?._id ?? '' },
		skip: !editing || session.memberType !== MemberType.DOCTOR,
		fetchPolicy: 'network-only',
	});
	const current = detail.data?.getMyDoctorReport;
	const [createReport, createState] = useMutation(CREATE_DOCTOR_REPORT);
	const [updateReport, updateState] = useMutation(UPDATE_DOCTOR_REPORT);
	const list = data?.getMyDoctorReports.list ?? [];
	const total = data?.getMyDoctorReports.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (appointmentId) {
			chooseAppointment(appointmentId);
			setChoicePage(1);
			setEditing(null);
			setFeedback('');
		}
	}, [appointmentId]);
	useEffect(() => {
		const reportId =
			typeof router.query.reportId === 'string' ? router.query.reportId : '';
		if (reportId) setEditing({ _id: reportId } as DoctorReport);
	}, [router.query.reportId]);
	useEffect(() => {
		if (current?.docReportFollowUp)
			setEditingFollowUp(current.docReportFollowUp);
	}, [current?._id]);
	const chosenVisit = visits.find(
		(visit: any) => visit._id === chosenAppointment,
	);
	// Appointment links open the report that already belongs to this visit.
	// Keep the visit picker for creating a report for a different appointment.
	useEffect(() => {
		if (!appointmentId || choices.loading || choices.error || !chosenVisit?.reportId) return;
		void router.replace(
			{ pathname: '/doctor-workspace/reports', query: { reportId: chosenVisit.reportId } },
			undefined,
			{ shallow: true },
		);
	}, [appointmentId, chosenVisit?.reportId, choices.loading, choices.error, router]);
	useEffect(() => {
		if (editing && current?._id === editing._id) {
			document.getElementById('doctor-report-editor')?.scrollIntoView({ block: 'start' });
		}
	}, [editing?._id, current?._id]);
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFeedback('');
		if (
			!chosenVisit ||
			chosenVisit.reportId ||
			choices.loading ||
			choices.error
		)
			return;
		const form = event.currentTarget;
		const values = new FormData(form);
		const followUpDate = String(values.get('followUpDate') ?? '');
		const input = {
			appointmentId: chosenAppointment,
			docReportSymptoms: String(values.get('symptoms') ?? '').trim(),
			docReportDiagnosis: String(values.get('diagnosis') ?? '').trim(),
			docReportMedication: String(values.get('medication') ?? '').trim(),
			docReportObservations: String(values.get('observations') ?? '').trim(),
			docReportRecommendation: String(
				values.get('recommendation') ?? '',
			).trim(),
			docReportFollowUp: followUp,
			...(followUpDate
				? {
						docReportFollowUpDate: new Date(
							`${followUpDate}T12:00:00`,
						).toISOString(),
					}
				: {}),
		};
		try {
			await createReport({ variables: { input } });
			chooseAppointment('');
			await choices.refetch();
			form.reset();
			setFollowUp('NONE');
			setPage(1);
			await refetch({ input: { page: 1, limit: LIMIT } });
			setFeedback(t('admin.saved'));
			if (appointmentId)
				void router.replace('/doctor-workspace/reports', undefined, {
					shallow: true,
				});
		} catch (requestError: any) {
			setFeedback(requestError?.message ?? t('admin.actionError'));
		}
	};
	const saveReport = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editing) return;
		setFeedback('');
		const values = new FormData(event.currentTarget);
		const date = String(values.get('followUpDate') ?? '');
		const input = {
			reportId: editing._id,
			docReportSymptoms: String(values.get('symptoms') ?? '').trim(),
			docReportDiagnosis: String(values.get('diagnosis') ?? '').trim(),
			docReportMedication: String(values.get('medication') ?? '').trim(),
			docReportObservations: String(values.get('observations') ?? '').trim(),
			docReportRecommendation: String(
				values.get('recommendation') ?? '',
			).trim(),
			docReportFollowUp: editingFollowUp,
			...(date
				? { docReportFollowUpDate: new Date(`${date}T12:00:00`).toISOString() }
				: editingFollowUp === 'NONE'
					? { docReportFollowUpDate: null }
					: {}),
		};
		try {
			await updateReport({ variables: { input } });
			await refetch();
			setEditing(null);
			setFeedback(t('admin.saved'));
		} catch (requestError: any) {
			setFeedback(requestError?.message ?? t('admin.actionError'));
		}
	};

	return (
		<StaffRolePage
			role={MemberType.DOCTOR}
			titleKey="dashboard.myReports"
			introKey="staff.reportsIntro"
		>
			<section className="clinical-staff-panel clinical-admin-resource">
				<header>
					<h2>{t('staff.createReport')}</h2>
				</header>
				<p className="clinical-staff-state">
					{t('staff.reportOnlyAfterVisit')}
				</p>
				<AdminPagination
					page={appointmentId ? 1 : choicePage}
					total={
						choices.data?.getMyDoctorReportAppointments.metaCounter?.[0]
							?.total ?? 0
					}
					limit={20}
					onChange={(next) => {
						setChoicePage(next);
						chooseAppointment('');
					}}
				/>
				<form
					className="clinical-staff-form"
					onSubmit={(event) => void submit(event)}
					key={chosenAppointment || 'new'}
				>
					<label className={reportStyles.appointment}>
						{w('appointment')}
						<select
                            aria-label={w('appointment')}
							value={chosenAppointment}
							onChange={(event) => { chooseAppointment(event.target.value); setFollowUp('NONE'); }}
							required
							disabled={choices.loading || Boolean(choices.error)}
						>
							<option value="" disabled>
								{w('choose')}
							</option>
							{visits.map((visit: any) => (
								<option key={visit._id} value={visit._id}>
									{visit.patientPreview?.patientFullName || w('patient')} ·{' '}
									{visit.appointmentReason} ·{' '}
									{clinicDateTime(visit.startsAt, 'en-US', clinic.timeZone)} ·{' '}
									{recordReference(visit.appointmentCode)}
									{visit.reportId ? ` · ${w('edit')}` : ''}
								</option>
							))}
						</select>
                        {chosenVisit && <span className={reportStyles.context}>
                            <strong>{chosenVisit.patientPreview?.patientFullName || w('patient')}</strong>
                            <span>{chosenVisit.appointmentReason}</span>
                            <small>{clinicDateTime(chosenVisit.startsAt, 'en-US', clinic.timeZone)} · {recordReference(chosenVisit.appointmentCode)}</small>
                        </span>}
						{choices.error && <span role="alert">{choices.error.message}</span>}
						{chosenVisit?.reportId && (
							<Link
								href={`/doctor-workspace/reports?reportId=${chosenVisit.reportId}`}
							>
								{w('edit')}
							</Link>
						)}
					</label>
					<label>
						{t('staff.symptoms')}
						<textarea
							disabled={!chosenVisit || Boolean(chosenVisit.reportId)}
							name="symptoms"
							maxLength={5000}
							required
						/>
					</label>
					<label>
						{t('staff.diagnosis')}
						<textarea name="diagnosis" maxLength={5000} required />
					</label>
					<label>
						{t('staff.medication')}
						<textarea name="medication" maxLength={5000} required />
					</label>
					<label>
						{w('observations')}
						<textarea name="observations" maxLength={5000} />
					</label>
					<label>
						{w('recommendation')}
						<textarea name="recommendation" maxLength={5000} />
					</label>
					<label>
						{t('staff.followUp')}
						<select
							value={followUp}
							onChange={(event) =>
								setFollowUp(event.target.value as typeof followUp)
							}
						>
							<option value="NONE">{t('staff.none')}</option>
							<option value="OPTIONAL">{t('staff.optional')}</option>
							<option value="REQUIRED">{t('staff.required')}</option>
						</select>
					</label>
					{followUp === 'REQUIRED' && (
						<label>
							{t('staff.followUp')}
							<input name="followUpDate" type="date" required />
						</label>
					)}
					<button
						type="submit"
						disabled={
							createState.loading ||
							choices.loading ||
							Boolean(choices.error) ||
							!chosenVisit ||
							Boolean(chosenVisit.reportId)
						}
					>
						{t('staff.createReport')}
					</button>
				</form>
				{feedback && (
					<p className="clinical-admin-feedback" role="status">
						{feedback}
					</p>
				)}
			</section>
			<section className="clinical-staff-panel clinical-admin-resource">
				<header>
					<h2>{t('dashboard.myReports')}</h2>
				</header>
				{loading && (
					<p className="clinical-staff-state">{t('dashboard.loading')}</p>
				)}
				{error && (
					<p className="clinical-staff-state clinical-form-error" role="alert">
						{t('admin.loadError')}
					</p>
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
									<th>{t('staff.update')}</th>
								</tr>
							</thead>
							<tbody>
								{list.map((report) => (
									<tr key={report._id}>
										<td>
											{recordReference(report.appointmentCode)}
											<small>{report.serviceName}</small>
										</td>
										<td>{report.patientName || w('patient')}</td>
										<td>
											<strong>{report.docReportDiagnosis}</strong>
											<small>{report.docReportSymptoms}</small>
										</td>
										<td>{t(({ NONE: 'staff.none', OPTIONAL: 'staff.optional', REQUIRED: 'staff.required' } as const)[report.docReportFollowUp ?? 'NONE'] ?? 'staff.none')}</td>
										<td>
											<button
												type="button"
												className="clinical-staff-table-action"
												onClick={() => {
													setEditing(report);
													setEditingFollowUp(
														report.docReportFollowUp as typeof editingFollowUp,
													);
												}}
											>
												{t('staff.update')}
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				<AdminPagination
					page={page}
					total={total}
					limit={LIMIT}
					onChange={setPage}
				/>
			</section>
			{detail.error && <p role="alert">{detail.error.message}</p>}
			{editing && current?._id === editing._id && (
				<section id="doctor-report-editor" className="clinical-staff-panel clinical-admin-resource">
					<header>
						<h2>{t('staff.update')}</h2>
						<button
							type="button"
							className="clinical-staff-table-action"
							onClick={() => setEditing(null)}
						>
							{t('staff.cancel')}
						</button>
					</header>
					<form
						className="clinical-staff-form"
						key={editing._id}
						onSubmit={(event) => void saveReport(event)}
					>
						<label>
							{t('staff.symptoms')}
							<textarea
								name="symptoms"
								defaultValue={current.docReportSymptoms}
								maxLength={5000}
								required
							/>
						</label>
						<label>
							{t('staff.diagnosis')}
							<textarea
								name="diagnosis"
								defaultValue={current.docReportDiagnosis}
								maxLength={5000}
								required
							/>
						</label>
						<label>
							{t('staff.medication')}
							<textarea
								name="medication"
								defaultValue={current.docReportMedication}
								maxLength={5000}
								required
							/>
						</label>
						<label>
							{w('observations')}
							<textarea
								name="observations"
								defaultValue={current.docReportObservations}
								maxLength={5000}
							/>
						</label>
						<label>
							{w('recommendation')}
							<textarea
								name="recommendation"
								defaultValue={current.docReportRecommendation}
								maxLength={5000}
							/>
						</label>
						<label>
							{t('staff.followUp')}
							<select
								value={editingFollowUp}
								onChange={(event) =>
									setEditingFollowUp(
										event.target.value as typeof editingFollowUp,
									)
								}
							>
								<option value="NONE">{t('staff.none')}</option>
								<option value="OPTIONAL">{t('staff.optional')}</option>
								<option value="REQUIRED">{t('staff.required')}</option>
							</select>
						</label>
						{editingFollowUp === 'REQUIRED' && (
							<label>
								{t('staff.followUp')}
								<input
									name="followUpDate"
									type="date"
									defaultValue={current.docReportFollowUpDate?.slice(0, 10)}
									required
								/>
							</label>
						)}
						<button type="submit" disabled={updateState.loading}>
							{t('admin.save')}
						</button>
					</form>
				</section>
			)}
		</StaffRolePage>
	);
}
