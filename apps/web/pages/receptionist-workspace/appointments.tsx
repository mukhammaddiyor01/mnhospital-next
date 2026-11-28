import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { useAppointmentFlowText } from '@/libs/components/workspace/useAppointmentFlowText';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import RecordThumbnail from '@/libs/components/common/RecordThumbnail';
import thumbnailStyles from '@/libs/components/common/RecordThumbnail.module.scss';
import { useState } from 'react';
import Link from 'next/link';
import {
	useApolloClient,
	useMutation,
	useQuery,
	useReactiveVar,
} from '@apollo/client';
import { userVar } from '@/apollo/store';
import {
	GET_RECEPTIONIST_QUEUE,
	GET_RECEPTION_TASKS,
} from '@/apollo/staff-workspace/query';
import {
	CREATE_RECEPTION_TASK,
	UPDATE_RECEPTION_TASK,
	CHECK_IN_RECEPTIONIST_APPOINTMENT,
	UPDATE_APPOINTMENT_STATUS,
} from '@/apollo/staff-workspace/mutation';
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
import { appointmentStatusKeys } from '@/libs/components/dashboard/staffLabels';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';

const LIMIT = 10;
export default function ReceptionistAppointments() {
	const t = useTranslation();
	const w = useWorkspaceText();
	const f = useAppointmentFlowText();
	const client = useApolloClient();
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
	const authorized = Boolean(
		session._id && session.memberType === MemberType.RECEPTIONIST,
	);
	const { data, loading, error, refetch } = useQuery<{
		getMyReceptionistAppointmentQueue: StaffList<StaffAppointment>;
	}>(GET_RECEPTIONIST_QUEUE, {
		variables: { input: { page, limit: LIMIT } },
		skip: !authorized,
		fetchPolicy: 'network-only',
	});
	useLiveWorkspaceRefresh(() => refetch(), authorized && !busyId);
	const [updateStatus] = useMutation(UPDATE_APPOINTMENT_STATUS);
	const [createTask] = useMutation(CREATE_RECEPTION_TASK);
	const [updateTask] = useMutation(UPDATE_RECEPTION_TASK);
	const [checkIn] = useMutation(CHECK_IN_RECEPTIONIST_APPOINTMENT);
	const list = data?.getMyReceptionistAppointmentQueue.list ?? [];
	const total =
		data?.getMyReceptionistAppointmentQueue.metaCounter?.[0]?.total ?? 0;
	const act = async (
		appointment: StaffAppointment,
		status: AppointmentStatus | 'CHECK_IN',
	) => {
		if (busyId || loading || error) return;
		const allowed =
			appointment.appointmentStatus === 'PENDING'
				? ['CONFIRMED', 'NO_SHOW']
				: appointment.appointmentStatus === 'CONFIRMED'
					? ['NO_SHOW', 'CHECK_IN']
					: appointment.appointmentStatus === 'IN_PROGRESS'
						? ['CHECK_IN']
						: [];
		if (!allowed.includes(status)) return;
		if (
			status === 'NO_SHOW' &&
			!window.confirm(
				`${f('confirmState')}\n${recordReference(appointment.appointmentCode)} · ${t(appointmentStatusKeys.NO_SHOW)}`,
			)
		)
			return;
		setBusyId(appointment._id);
		setFeedback('');
		try {
			if (status === 'CHECK_IN')
				await checkIn({
					variables: { input: { appointmentId: appointment._id } },
				});
			else
				await updateStatus({
					variables: {
						input: {
							appointmentId: appointment._id,
							appointmentStatus: status,
						},
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

	const accept = async (appointment: StaffAppointment) => {
		if (busyId) return;
		setBusyId(appointment._id);
		setFeedback('');
		try {
			const existing = await client.query({
				query: GET_RECEPTION_TASKS,
				variables: {
					input: { page: 1, limit: 100, appointmentId: appointment._id },
				},
				fetchPolicy: 'network-only',
			});
			let task = existing.data.getReceptionTasks.list.find(
				(row: any) =>
					row.taskType === 'CHECK_IN' &&
					['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(row.taskStatus) &&
					(!row.receptionistId || row.receptionistId === session._id),
			);
			if (!task) {
				const created = await createTask({
					variables: {
						input: {
							appointmentId: appointment._id,
							taskType: 'CHECK_IN',
							taskPriority: 'MEDIUM',
							taskInstruction: f('arrivalInstruction'),
						},
					},
				});
				task = created.data.createReceptionTask;
			}
			if (task.taskStatus === 'PENDING')
				await updateTask({
					variables: { input: { taskId: task._id, taskStatus: 'ACCEPTED' } },
				});
			await refetch();
			setFeedback(t('admin.saved'));
		} catch (error) {
			setFeedback(
				error instanceof Error ? error.message : t('admin.actionError'),
			);
			await refetch().catch(() => {});
		} finally {
			setBusyId('');
		}
	};

	return (
		<StaffRolePage
			role={MemberType.RECEPTIONIST}
			titleKey="dashboard.myAppointments"
			introKey="staff.appointmentsIntro"
		>
			<p>{w('receptionAppointmentScope')}</p>
			<div className="clinical-resource-actions">
				<Link href="/receptionist-workspace/bookings">{w('bookings')}</Link>
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
									<th>{t('staff.update')}</th>
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
												{t(
													appointmentStatusKeys[appointment.appointmentStatus],
												)}
											</span>
										</td>
										<td>
											<div className="clinical-staff-row-actions">
												{appointment.receptionAssigned &&
													appointment.appointmentStatus === 'PENDING' && (
														<button
														type="button"
														disabled={
															Boolean(busyId) || loading || Boolean(error)
														}
														onClick={() => void act(appointment, 'CONFIRMED')}
													>
															{t('dashboard.statusConfirmed')}
														</button>
													)}
												{appointment.receptionAssigned &&
													['PENDING', 'CONFIRMED'].includes(
													appointment.appointmentStatus,
												) && (
														<button
														type="button"
														disabled={
															Boolean(busyId) || loading || Boolean(error)
														}
														onClick={() => void act(appointment, 'NO_SHOW')}
													>
															{t('dashboard.statusNoShow')}
														</button>
													)}
												{['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(
													appointment.appointmentStatus,
												) && (
													<CheckInAction
														appointment={appointment}
														disabled={
															Boolean(busyId) || loading || Boolean(error)
														}
														onAccept={() => void accept(appointment)}
														onCheckIn={() => void act(appointment, 'CHECK_IN')}
													/>
												)}
												<Link
													href={`/receptionist-workspace/tasks?appointmentId=${appointment._id}`}
												>
													{t('dashboard.receptionistTasks')}
												</Link>
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

function CheckInAction({
	appointment,
	disabled,
	onCheckIn,
	onAccept,
}: {
	appointment: StaffAppointment;
	disabled: boolean;
	onCheckIn: () => void;
	onAccept: () => void;
}) {
	const session = useReactiveVar(userVar);
	const t = useTranslation();
	const f = useAppointmentFlowText();
	const task = useQuery(GET_RECEPTION_TASKS, {
		variables: {
			input: {
				page: 1,
				limit: 100,
				appointmentId: appointment._id,
			},
		},
		skip: !session._id || session.memberType !== MemberType.RECEPTIONIST,
		fetchPolicy: 'network-only',
	});
	useLiveWorkspaceRefresh(
		() => task.refetch(),
		Boolean(
			session._id &&
			session.memberType === MemberType.RECEPTIONIST &&
			!disabled,
		),
	);
	const accepted = task.data?.getReceptionTasks.list.some(
		(row: any) =>
			row.taskType === 'CHECK_IN' && row.receptionistId === session._id && row.taskStatus === 'ACCEPTED',
	);
	if (task.data?.getReceptionTasks.list.some((row: any) => row.taskType === 'CHECK_IN' && row.receptionistId === session._id && row.taskStatus === 'IN_PROGRESS')) return null;
	if (!accepted || task.error)
		return (
			<button
				type="button"
				disabled={disabled || task.loading || Boolean(task.error)}
				onClick={onAccept}
			>
				{f('prepare')}
			</button>
		);
	if (appointment.appointmentStatus === 'PENDING') return null;
	return (
		<button
			type="button"
			disabled={disabled || task.loading || Boolean(task.error)}
			onClick={onCheckIn}
		>
			{t('staff.checkIn')}
		</button>
	);
}
