import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel, {
	ResourceConfig,
	RecordItem,
} from '@/libs/components/workspace/ResourcePanel';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
const fields =
	'_id appointmentId receptionistId taskType taskPriority taskStatus taskInstruction taskResult dueAt';
const LIST = operation(
	'query',
	'getReceptionTasks',
	'ReceptionTaskInquiry',
	`list { ${fields} } metaCounter { total }`,
);
const DETAIL = operation(
	'query',
	'getReceptionTask',
	'String',
	fields,
	'taskId',
);
const CREATE = operation(
	'mutation',
	'createReceptionTask',
	'ReceptionTaskInput',
	'_id',
);
const UPDATE = operation(
	'mutation',
	'updateReceptionTaskStatus',
	'ReceptionTaskStatusInput',
	'_id taskStatus',
);
const STAFF = operation(
	'query',
	'getReceptionists',
	'ReceptionistInquiry',
	'list { _id receptionistFullName memberStatus } metaCounter { total }',
);
const APPOINTMENTS = operation(
	'query',
	'getAppointments',
	'StaffAppointmentInquiry',
	'list { _id appointmentCode appointmentStatus } metaCounter { total }',
);
const transitions: Record<string, string[]> = {
	PENDING: ['ACCEPTED', 'CANCELLED'],
	ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
	IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
};
function Tasks() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [revision, setRevision] = useState(0);
	const [feedback, setFeedback] = useState('');
	const [update, state] = useMutation(UPDATE);
	const staff = useQuery(STAFF, {
		variables: { input: { page: 1, limit: 100 } },
	});
	const appointments = useQuery(APPOINTMENTS, {
		variables: { input: { page: 1, limit: 100 } },
	});
	const detail = useQuery(DETAIL, {
		variables: { taskId: selected?._id ?? '' },
		skip: !selected,
		fetchPolicy: 'network-only',
	});
	const task = detail.data?.getReceptionTask;
	const config = useMemo<ResourceConfig>(
		() => ({
			role: MemberType.ADMIN,
			title: 'tasks',
			list: LIST,
			listKey: 'getReceptionTasks',
			columns: [
				{ name: 'appointmentId', label: 'appointment' },
				{ name: 'taskType', label: 'type' },
				{ name: 'taskInstruction', label: 'instruction' },
				{ name: 'taskStatus', label: 'status' },
			],
			create: CREATE,
			fields: [
				{
					name: 'appointmentId',
					label: 'appointment',
					required: true,
					options: (appointments.data?.getAppointments.list ?? [])
						.filter((a: any) =>
							['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(
								a.appointmentStatus,
							),
						)
						.map((a: any) => ({ value: a._id, label: a.appointmentCode })),
				},
				{
					name: 'receptionistId',
					label: 'receptionist',
					options: (staff.data?.getReceptionists.list ?? [])
						.filter((a: any) => a.memberStatus === 'ACTIVE')
						.map((a: any) => ({ value: a._id, label: a.receptionistFullName })),
				},
				{
					name: 'taskType',
					label: 'type',
					options: [
						'CHECK_IN',
						'PREPARE_ROOM',
						'CALL_PATIENT',
						'ASSIST',
						'OTHER',
					],
					required: true,
				},
				{
					name: 'taskPriority',
					label: 'priority',
					options: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
					required: true,
					defaultValue: 'MEDIUM',
				},
				{
					name: 'taskInstruction',
					label: 'instruction',
					type: 'textarea',
					required: true,
					maxLength: 2000,
				},
				{ name: 'dueAt', label: 'due', type: 'datetime-local' },
			],
			onSelect: setSelected,
		}),
		[staff.data, appointments.data],
	);
	const save = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!task || state.loading) return;
		const values = new FormData(e.currentTarget);
		try {
			await update({
				variables: {
					input: {
						taskId: task._id,
						taskStatus: values.get('status'),
						taskResult: String(values.get('result') ?? '').trim(),
						reason: String(values.get('reason') ?? '').trim(),
					},
				},
			});
			setSelected(null);
			setRevision((v) => v + 1);
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<>
			<ResourcePanel key={revision} config={config} />
			{(staff.error || appointments.error) && (
				<p role="alert">
					{staff.error?.message ?? appointments.error?.message}
				</p>
			)}
			{selected && (
				<section className="clinical-staff-panel clinical-resource-panel">
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{feedback && <p role="alert">{feedback}</p>}
					{task && (
						<>
							<h2>{task.taskType}</h2>
							<p>{task.taskInstruction}</p>
							<p>
								{task.taskStatus} · {task.taskResult}
							</p>
							{transitions[task.taskStatus] && (
								<form className="clinical-resource-form" onSubmit={save}>
									<label>
										{w('status')}
										<select name="status" required>
											<option value="">{w('choose')}</option>
											{transitions[task.taskStatus].map((status) => (
												<option key={status}>{status}</option>
											))}
										</select>
									</label>
									<label>
										{w('result')}
										<textarea
											name="result"
											maxLength={2000}
											defaultValue={task.taskResult}
										/>
									</label>
									<label>
										{w('reason')}
										<input name="reason" maxLength={1000} />
									</label>
									<button disabled={state.loading}>{w('save')}</button>
								</form>
							)}
						</>
					)}
				</section>
			)}
		</>
	);
}
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('tasks')}>
			<Tasks />
		</WorkspacePage>
	);
}
