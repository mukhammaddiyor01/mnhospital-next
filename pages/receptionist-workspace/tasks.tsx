import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { operation } from '@/apollo/workspace/operations';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTION_TASKS } from '@/apollo/staff-workspace/query';
import {
	CREATE_RECEPTION_TASK,
	UPDATE_RECEPTION_TASK,
} from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import {
	ReceptionTask,
	ReceptionTaskStatus,
	StaffList,
} from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MessageKey } from '@/libs/i18n/messages';
import {
	taskPriorityKeys,
	taskStatusKeys,
	taskTypeKeys,
} from '@/libs/components/dashboard/staffLabels';

const DETAIL = operation(
	'query',
	'getReceptionTask',
	'String',
	'_id taskInstruction taskResult dueAt taskStatus',
	'taskId',
);
const LIMIT = 10;
const taskTypes = [
	{ value: 'CHECK_IN', label: 'staff.taskCheckIn' },
	{ value: 'PREPARE_ROOM', label: 'staff.taskPrepareRoom' },
	{ value: 'CALL_PATIENT', label: 'staff.taskCallPatient' },
	{ value: 'ASSIST', label: 'staff.taskAssist' },
	{ value: 'OTHER', label: 'staff.taskOther' },
] as const;
const priorities = [
	{ value: 'LOW', label: 'staff.priorityLow' },
	{ value: 'MEDIUM', label: 'staff.priorityMedium' },
	{ value: 'HIGH', label: 'staff.priorityHigh' },
	{ value: 'URGENT', label: 'staff.priorityUrgent' },
] as const;
export default function ReceptionistTasks() {
	const t = useTranslation();
	const w = useWorkspaceText();
	const [selected, setSelected] = useState('');
	const label = (value: string, keys: Partial<Record<string, MessageKey>>) => {
		const key = keys[value];
		return key ? t(key) : value.replaceAll('_', ' ');
	};
	const router = useRouter();
	const session = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [busyId, setBusyId] = useState('');
	const [feedback, setFeedback] = useState('');
	const { data, loading, error, refetch } = useQuery<{
		getReceptionTasks: StaffList<ReceptionTask>;
	}>(GET_RECEPTION_TASKS, {
		variables: { input: { page, limit: LIMIT } },
		skip: !session._id || session.memberType !== MemberType.RECEPTIONIST,
		fetchPolicy: 'network-only',
	});
	const detail = useQuery(DETAIL, {
		variables: { taskId: selected },
		skip: !selected || session.memberType !== MemberType.RECEPTIONIST,
		fetchPolicy: 'network-only',
	});
	const [updateTask] = useMutation(UPDATE_RECEPTION_TASK);
	const [createTask, createState] = useMutation(CREATE_RECEPTION_TASK);
	const list = data?.getReceptionTasks.list ?? [];
	const total = data?.getReceptionTasks.metaCounter?.[0]?.total ?? 0;
	const appointmentId =
		typeof router.query.appointmentId === 'string'
			? router.query.appointmentId
			: '';
	const create = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFeedback('');
		const form = event.currentTarget;
		const values = new FormData(form);
		const input = {
			appointmentId: String(values.get('appointmentId') ?? '').trim(),
			taskType: String(values.get('taskType')),
			taskPriority: String(values.get('taskPriority')),
			taskInstruction: String(values.get('taskInstruction') ?? '').trim(),
			...(values.get('dueAt')
				? { dueAt: new Date(String(values.get('dueAt'))).toISOString() }
				: {}),
		};
		try {
			await createTask({ variables: { input } });
			form.reset();
			setPage(1);
			await refetch({ input: { page: 1, limit: LIMIT } });
			setFeedback(t('admin.saved'));
			if (appointmentId)
				void router.replace('/receptionist-workspace/tasks', undefined, {
					shallow: true,
				});
		} catch (requestError: any) {
			setFeedback(requestError?.message ?? t('admin.actionError'));
		}
	};
	const transitions = (task: ReceptionTask): ReceptionTaskStatus[] => {
		if (task.taskStatus === 'PENDING')
			return task.receptionistId ? ['ACCEPTED', 'CANCELLED'] : ['ACCEPTED'];
		if (task.taskStatus === 'ACCEPTED')
			return task.taskType === 'CHECK_IN'
				? ['CANCELLED']
				: ['IN_PROGRESS', 'CANCELLED'];
		if (task.taskStatus === 'IN_PROGRESS') return ['COMPLETED', 'CANCELLED'];
		return [];
	};
	const submit = async (
		event: FormEvent<HTMLFormElement>,
		task: ReceptionTask,
	) => {
		event.preventDefault();
		const values = new FormData(event.currentTarget);
		const status = String(values.get('status')) as ReceptionTaskStatus;
		if (!transitions(task).includes(status)) return;
		const result = String(values.get('result') ?? '').trim();
		if (status === 'COMPLETED' && !result && !task.taskResult) {
			setFeedback(t('staff.result'));
			return;
		}
		setBusyId(task._id);
		setFeedback('');
		try {
			await updateTask({
				variables: {
					input: {
						taskId: task._id,
						taskStatus: status,
						...(result ? { taskResult: result } : {}),
						reason: String(values.get('reason') ?? '').trim(),
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

	return (
		<StaffRolePage
			role={MemberType.RECEPTIONIST}
			titleKey="dashboard.pendingWork"
			introKey="staff.tasksIntro"
		>
			{detail.error && <p role="alert">{detail.error.message}</p>}
			{detail.data && (
				<section className="clinical-staff-panel">
					<h2>{w('details')}</h2>
					<p>{detail.data.getReceptionTask.taskInstruction}</p>
					<p>{detail.data.getReceptionTask.taskResult}</p>
					<p>{detail.data.getReceptionTask.dueAt}</p>
				</section>
			)}
			<section className="clinical-staff-panel clinical-admin-resource">
				<header>
					<h2>{t('staff.createTask')}</h2>
				</header>
				<form
					className="clinical-staff-form"
					onSubmit={(event) => void create(event)}
					key={appointmentId || 'new'}
				>
					<label>
						{t('staff.appointmentId')}
						<input name="appointmentId" defaultValue={appointmentId} required />
					</label>
					<label>
						{t('admin.serviceType')}
						<select name="taskType" required defaultValue="CHECK_IN">
							{taskTypes.map((type) => (
								<option key={type.value} value={type.value}>
									{t(type.label)}
								</option>
							))}
						</select>
					</label>
					<label>
						{t('staff.priority')}
						<select name="taskPriority" required defaultValue="MEDIUM">
							{priorities.map((priority) => (
								<option key={priority.value} value={priority.value}>
									{t(priority.label)}
								</option>
							))}
						</select>
					</label>
					<label>
						{t('staff.instruction')}
						<textarea
							name="taskInstruction"
							minLength={1}
							maxLength={2000}
							required
						/>
					</label>
					<label>
						{w('due')}
						<input type="datetime-local" name="dueAt" />
					</label>
					<button type="submit" disabled={createState.loading}>
						{t('staff.createTask')}
					</button>
				</form>
			</section>
			<section className="clinical-staff-panel clinical-admin-resource">
				<header>
					<h2>{t('dashboard.receptionistTasks')}</h2>
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
									<th>{t('staff.appointmentId')}</th>
									<th>{t('staff.instruction')}</th>
									<th>{t('staff.priority')}</th>
									<th>{t('admin.status')}</th>
									<th>{t('staff.update')}</th>
								</tr>
							</thead>
							<tbody>
								{list.map((task) => (
									<tr key={task._id}>
										<td>
											<button onClick={() => setSelected(task._id)}>
												{w('details')}
											</button>
											<small>{task.appointmentId}</small>
										</td>
										<td>
											<strong>{label(task.taskType, taskTypeKeys)}</strong>
											<small>{task.taskInstruction}</small>
										</td>
										<td>{label(task.taskPriority, taskPriorityKeys)}</td>
										<td>
											<span
												className={`clinical-staff-status status-${task.taskStatus.toLowerCase()}`}
											>
												{t(taskStatusKeys[task.taskStatus])}
											</span>
										</td>
										<td>
											<div className="clinical-staff-row-actions">
												{task.taskType === 'CHECK_IN' &&
													task.taskStatus === 'ACCEPTED' && (
														<Link href="/receptionist-workspace/appointments">
															{t('staff.checkIn')}
														</Link>
													)}
												{transitions(task).length ? (
													<form
														className="clinical-staff-inline-form"
														onSubmit={(event) => void submit(event, task)}
													>
														<select
															name="status"
															aria-label={`${label(task.taskType, taskTypeKeys)}: ${t('staff.nextStatus')}`}
															required
															defaultValue=""
														>
															<option value="" disabled>
																{t('staff.nextStatus')}
															</option>
															{transitions(task).map((status) => (
																<option value={status} key={status}>
																	{t(taskStatusKeys[status])}
																</option>
															))}
														</select>
														{task.taskStatus === 'IN_PROGRESS' && (
															<input
																name="result"
																placeholder={t('staff.result')}
																aria-label={t('staff.result')}
																maxLength={2000}
															/>
														)}
														<input
															name="reason"
															placeholder={w('reason')}
															maxLength={1000}
														/>
														<button
															type="submit"
															disabled={busyId === task._id}
														>
															{t('staff.update')}
														</button>
													</form>
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
