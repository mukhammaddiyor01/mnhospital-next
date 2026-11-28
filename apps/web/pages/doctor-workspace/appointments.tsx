import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { useAppointmentFlowText } from '@/libs/components/workspace/useAppointmentFlowText';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import RecordThumbnail from '@/libs/components/common/RecordThumbnail';
import thumbnailStyles from '@/libs/components/common/RecordThumbnail.module.scss';
import { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_STAFF_APPOINTMENTS } from '@/apollo/staff-workspace/query';
import { UPDATE_APPOINTMENT_STATUS } from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import {
	AppointmentStatus,
	StaffAppointment,
	StaffList,
} from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { MessageKey } from '@/libs/i18n/messages';
import Link from 'next/link';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';

const LIMIT = 10;
const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
	PENDING: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
	CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
	IN_PROGRESS: ['ENDED', 'COMPLETED'],
	ENDED: ['COMPLETED'],
	COMPLETED: [],
	CANCELLED: [],
	NO_SHOW: [],
};
const statusKeys: Record<AppointmentStatus, MessageKey> = {
	PENDING: 'dashboard.statusPending',
	CONFIRMED: 'dashboard.statusConfirmed',
	IN_PROGRESS: 'dashboard.statusInProgress',
	ENDED: 'dashboard.statusEnded',
	COMPLETED: 'dashboard.statusCompleted',
	CANCELLED: 'dashboard.statusCancelled',
	NO_SHOW: 'dashboard.statusNoShow',
};

export default function DoctorAppointments() {
	const t = useTranslation();
	const w = useWorkspaceText();
	const f = useAppointmentFlowText();
	const clinic = useClinicSettings();
	const { language } = usePreferences();
	const format = new Intl.DateTimeFormat(
		{ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language],
		{ timeZone: clinic.timeZone, dateStyle: 'medium', timeStyle: 'short' },
	);
	const session = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [busyId, setBusyId] = useState('');
	const [feedback, setFeedback] = useState('');
	const { data, loading, error, refetch } = useQuery<{
		getAppointments: StaffList<StaffAppointment>;
	}>(GET_STAFF_APPOINTMENTS, {
		variables: { input: { page, limit: LIMIT } },
		skip: !session._id || session.memberType !== MemberType.DOCTOR,
		fetchPolicy: 'network-only',
	});
	useLiveWorkspaceRefresh(
		() => refetch(),
		Boolean(session._id && session.memberType === MemberType.DOCTOR && !busyId),
	);
	const [updateStatus] = useMutation(UPDATE_APPOINTMENT_STATUS);
	const list = data?.getAppointments.list ?? [];
	const total = data?.getAppointments.metaCounter?.[0]?.total ?? 0;
	const change = async (
		appointment: StaffAppointment,
		status: AppointmentStatus,
	) => {
		if (busyId || loading || error) return;
		if (!transitions[appointment.appointmentStatus].includes(status)) return;
		if (
			['CANCELLED', 'NO_SHOW'].includes(status) &&
			!window.confirm(
				`${f('confirmState')}\n${recordReference(appointment.appointmentCode)} · ${t(statusKeys[status])}`,
			)
		)
			return;
		setBusyId(appointment._id);
		setFeedback('');
		try {
			await updateStatus({
				variables: {
					input: { appointmentId: appointment._id, appointmentStatus: status },
				},
			});
			await refetch();
			setFeedback(t('admin.saved'));
		} catch (requestError: any) {
			setFeedback(requestError?.message ?? t('admin.actionError'));
		} finally {
			setBusyId('');
		}
	};

	return (
		<StaffRolePage
			role={MemberType.DOCTOR}
			titleKey="dashboard.myAppointments"
			introKey="staff.appointmentsIntro"
		>
			<p>{w('bookingFlow')}</p>
			<div className="clinical-resource-actions">
				<Link href="/doctor-workspace/bookings">{w('bookings')}</Link>
			</div>
			<section className="clinical-staff-panel clinical-admin-resource">
				<header>
					<h2>{t('dashboard.myAppointments')}</h2>
				</header>
				{feedback && (
					<p className="clinical-admin-feedback" role="status">
						{feedback}
					</p>
				)}
				{loading && (
					<p className="clinical-staff-state">{t('dashboard.loading')}</p>
				)}
				{error && (
					<p className="clinical-staff-state clinical-form-error" role="alert">
						{t('dashboard.appointmentsError')}
					</p>
				)}
				{!loading && !error && !list.length && (
					<p className="clinical-staff-state">
						{t('dashboard.noAppointments')}
					</p>
				)}
				{!loading && !error && !!list.length && (
					<div className="clinical-staff-table-scroll">
						<table>
							<thead>
								<tr>
									<th>{t('dashboard.appointmentCode')}</th>
									<th>{t('dashboard.appointmentTime')}</th>
									<th>{w('patient')}</th>
									<th>{t('dashboard.appointmentStatus')}</th>
									<th>{t('staff.nextStatus')}</th>
								</tr>
							</thead>
							<tbody>
								{list.map((appointment) => (
									<tr key={appointment._id}>
										<td>
											<strong>
												{recordReference(appointment.appointmentCode)}
											</strong>
											<small>{appointment.appointmentReason}</small>
											{['IN_PROGRESS', 'ENDED', 'COMPLETED'].includes(
												appointment.appointmentStatus,
											) && (
												<Link
													href={`/doctor-workspace/reports?appointmentId=${appointment._id}`}
												>
													{t('staff.createReport')}
												</Link>
											)}
										</td>
										<td>
											<time dateTime={appointment.startsAt}>
												{format.format(new Date(appointment.startsAt))}
											</time>
										</td>
										<td>
											<span className={thumbnailStyles.identity}>
												<RecordThumbnail
													image={appointment.patientPreview?.patientImage}
													name={
														appointment.patientPreview?.patientFullName ||
														w('patient')
													}
													portrait
												/>
												<span>
													{appointment.patientPreview?.patientFullName ||
														w('patient')}
												</span>
											</span>
										</td>
										<td>
											<span
												className={`clinical-staff-status status-${appointment.appointmentStatus.toLowerCase()}`}
											>
												{t(statusKeys[appointment.appointmentStatus])}
											</span>
										</td>
										<td>
											<div className="clinical-staff-row-actions">
												{[
													'PENDING',
													'CONFIRMED',
													'IN_PROGRESS',
													'ENDED',
												].includes(appointment.appointmentStatus) && (
													<button
														type="button"
														disabled={
															Boolean(busyId) || loading || Boolean(error)
														}
														onClick={() =>
															void change(
																appointment,
																appointment.appointmentStatus === 'PENDING'
																	? 'CONFIRMED'
																	: appointment.appointmentStatus ===
																		  'CONFIRMED'
																		? 'IN_PROGRESS'
																		: 'COMPLETED',
															)
														}
													>
														{f(
															appointment.appointmentStatus === 'PENDING'
																? 'confirm'
																: appointment.appointmentStatus === 'CONFIRMED'
																	? 'start'
																	: 'finish',
														)}
													</button>
												)}
												{transitions[appointment.appointmentStatus].length ? (
													<select
														value=""
														aria-label={`${recordReference(appointment.appointmentCode)}: ${t('staff.nextStatus')}`}
														disabled={
															Boolean(busyId) || loading || Boolean(error)
														}
														onChange={(event) =>
															void change(
																appointment,
																event.target.value as AppointmentStatus,
															)
														}
													>
														<option value="" disabled>
															{t('staff.nextStatus')}
														</option>
														{transitions[appointment.appointmentStatus].map(
															(status) => (
																<option key={status} value={status}>
																	{t(statusKeys[status])}
																</option>
															),
														)}
													</select>
												) : (
													'—'
												)}
											</div>
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
		</StaffRolePage>
	);
}
