import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { operation } from '@/apollo/workspace/operations';
import { GET_RECEPTION_TASKS } from '@/apollo/staff-workspace/query';
import {
	CREATE_RECEPTION_TASK,
	UPDATE_RECEPTION_TASK,
} from '@/apollo/staff-workspace/mutation';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import {
	appointmentStatusKeys,
	taskStatusKeys,
} from '@/libs/components/dashboard/staffLabels';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { clinicDateTime } from '@/libs/payments/clinic';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import { useWorkspaceText } from './useWorkspaceText';
import { useAppointmentFlowText } from './useAppointmentFlowText';
import { bookingSelection } from './adminResources';
import { RecordItem } from './ResourcePanel';
import styles from './BookingManagement.module.scss';
const ORDERS = operation(
	'query',
	'getBookingOrders',
	'StaffBookingOrderInquiry',
	bookingSelection,
);
const RECEIVE = operation(
	'mutation',
	'updatePaymentStatus',
	'PaymentStatusInput',
	'_id paymentStatus',
);

export default function BookingManagement({
	role,
}: {
	role: MemberType.ADMIN | MemberType.RECEPTIONIST;
}) {
	const w = useWorkspaceText();
	const f = useAppointmentFlowText();
	const t = useTranslation();
	const { language } = usePreferences();
	const clinic = useClinicSettings();
	const session = useReactiveVar(userVar);
	const authorized = Boolean(session._id && session.memberType === role);
	const [page, setPage] = useState(1);
	const [selectedId, select] = useState('');
	const [busy, setBusy] = useState(false);
	const [feedback, setFeedback] = useState('');
	const [search, setSearch] = useState('');
	const query = useQuery(ORDERS, {
		variables: { input: { page, limit: 10 } },
		skip: !authorized,
		fetchPolicy: 'network-only',
	});
	const list: RecordItem[] = query.data?.getBookingOrders.list ?? [];
	const selected = list.find((row) => row._id === selectedId);
	const [receive] = useMutation(RECEIVE);
	useLiveWorkspaceRefresh(async () => {
		await query.refetch();
	}, authorized && !busy);
	const stateLabel = (state: string) =>
		({
			PAID: f('paid'),
			PENDING: f('awaiting'),
			CONFIRMED: f('paid'),
			COMPLETED: t('dashboard.statusCompleted'),
			FAILED: f('failed'),
			CANCELLED: f('cancelled'),
			REFUNDED: f('refunded'),
		})[state] ?? state;
	const appointmentLabel = (state: keyof typeof appointmentStatusKeys) =>
		t(appointmentStatusKeys[state]);
	const action = async (run: () => Promise<unknown>) => {
		if (busy) return;
		setBusy(true);
		setFeedback('');
		try {
			await run();
			await query.refetch();
			setFeedback(f('done'));
		} catch (error) {
			setFeedback(
				error instanceof Error ? error.message : t('admin.actionError'),
			);
			await query.refetch().catch(() => {});
		} finally {
			setBusy(false);
		}
	};
	const term = search.trim().toLocaleLowerCase();
	return (
		<section
			className={`${styles.panel} clinical-staff-panel clinical-admin-resource`}
		>
			<header>
				<h2>{w('bookings')}</h2>
				<button
					type="button"
					disabled={busy || query.loading}
					onClick={() => void query.refetch()}
				>
					{f('refresh')}
				</button>
			</header>
			<p className={styles.explanation}>{f('independent')}</p>
			<label className={styles.search}>
				{w('search')}
				<input
					type="search"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					placeholder={w('search')}
				/>
			</label>
			{feedback && (
				<p role="status" className="clinical-admin-feedback">
					{feedback}
				</p>
			)}
			{query.error && (
				<p role="alert" className="clinical-form-error">
					{query.error.message}
				</p>
			)}
			{query.loading && !query.data && <p>{t('dashboard.loading')}</p>}
			{!query.loading && !list.length && <p>{t('admin.noResults')}</p>}
			<div className="clinical-staff-table-scroll">
				<table>
					<thead>
						<tr>
							<th>{w('code')}</th>
							<th>{f('settlement')}</th>
							<th>{f('appointment')}</th>
							<th>{w('total')}</th>
							<th>{w('details')}</th>
						</tr>
					</thead>
					<tbody>
						{list
							.filter(
								(row) =>
									!term ||
									`${recordReference(row.orderCode)} ${row.bookingOrderItems.map((line: RecordItem) => line.serviceName).join(' ')}`
										.toLocaleLowerCase()
										.includes(term),
							)
							.map((row) => (
								<tr key={row._id}>
									<td>
										<strong>{recordReference(row.orderCode)}</strong>
										<small>
											{row.bookingOrderItems
												.map((line: RecordItem) => line.serviceName)
												.join(', ')}
										</small>
									</td>
									<td>{stateLabel(row.bookingOrderStatus)}</td>
									<td>
										{row.bookingOrderItems.map((line: RecordItem) => (
											<span
												key={`${line.serviceId}:${line.doctorId}`}
												className={`clinical-staff-status status-${line.appointmentStatus?.toLowerCase() ?? 'pending'}`}
											>
												{line.appointmentStatus
													? appointmentLabel(line.appointmentStatus)
													: f('unbooked')}
											</span>
										))}
									</td>
									<td>
										{row.bookingOrderTotalAmount.toLocaleString()}{' '}
										{row.bookingOrderCurrency}
									</td>
									<td>
										<button
											type="button"
											aria-expanded={selectedId === row._id}
											onClick={() => {
												select(selectedId === row._id ? '' : row._id);
												setFeedback('');
											}}
										>
											{f('details')}
										</button>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
			<AdminPagination
				page={page}
				total={query.data?.getBookingOrders.metaCounter?.[0]?.total ?? 0}
				limit={10}
				onChange={(next) => {
					setPage(next);
					select('');
				}}
			/>
			{selected && (
				<div className={styles.detail}>
					<h3>{recordReference(selected.orderCode)}</h3>
					{selected.bookingOrderItems.map((line: RecordItem) => {
						const active = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(
							line.appointmentStatus,
						);
						return (
							<article
								key={`${line.serviceId}:${line.doctorId}`}
								className={styles.line}
							>
								<header>
									<div>
										<h4>{line.serviceName}</h4>
										<time>
											{clinicDateTime(
												line.requestedStartAt,
												{ EN: 'en-US', UZ: 'uz-UZ', KR: 'ko-KR' }[language],
												clinic.timeZone,
											)}
										</time>
									</div>
									<strong>
										{Number(line.servicePrice).toLocaleString()}{' '}
										{selected.bookingOrderCurrency}
									</strong>
								</header>
								<dl>
									<div>
										<dt>{f('appointment')}</dt>
										<dd>
											{line.appointmentStatus
												? appointmentLabel(line.appointmentStatus)
												: f('unbooked')}
										</dd>
									</div>
									<div>
										<dt>{f('payment')}</dt>
										<dd>
											{line.paymentStatus
												? `${line.paymentProvider === 'CASH' ? f('cash') : f('online')} · ${stateLabel(line.paymentStatus)}`
												: f('awaiting')}
										</dd>
									</div>
								</dl>
								<div className={styles.actions}>
									{line.paymentStatus === 'PENDING' &&
										line.paymentProvider === 'CASH' &&
										active &&
										selected.bookingOrderStatus !== 'CANCELLED' && (
											<button
												type="button"
												disabled={busy || Boolean(query.error)}
												onClick={() => {
													if (
														window.confirm(
															`${f('receiptConfirm')}\n${line.paymentAmount.toLocaleString()} ${selected.bookingOrderCurrency}`,
														)
													)
														void action(() =>
															receive({
																variables: {
																	input: {
																		paymentId: line.paymentId,
																		paymentStatus: 'PAID',
																	},
																},
															}),
														);
												}}
											>
												{f('receive')}
											</button>
										)}
									{role === MemberType.RECEPTIONIST && active && (
										<ReceptionBookingAction
											line={line}
											disabled={busy || Boolean(query.error)}
										/>
									)}
									{line.appointmentId && (
										<Link
											href={`/${role === MemberType.ADMIN ? 'admin' : 'receptionist-workspace'}/tasks?appointmentId=${line.appointmentId}`}
										>
											{t('dashboard.receptionistTasks')}
										</Link>
									)}
								</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}

function ReceptionBookingAction({
	line,
	disabled,
}: {
	line: RecordItem;
	disabled: boolean;
}) {
	const session = useReactiveVar(userVar);
	const f = useAppointmentFlowText();
	const t = useTranslation();
	const [busy, setBusy] = useState(false);
	const [feedback, setFeedback] = useState('');
	const tasks = useQuery(GET_RECEPTION_TASKS, {
		variables: {
			input: { page: 1, limit: 100, appointmentId: line.appointmentId },
		},
		skip:
			!line.appointmentId ||
			!session._id ||
			session.memberType !== MemberType.RECEPTIONIST,
		fetchPolicy: 'network-only',
	});
	const [create] = useMutation(CREATE_RECEPTION_TASK);
	const [update] = useMutation(UPDATE_RECEPTION_TASK);
	useLiveWorkspaceRefresh(
		() => tasks.refetch(),
		Boolean(
			line.appointmentId &&
			session._id &&
			session.memberType === MemberType.RECEPTIONIST &&
			!busy &&
			!disabled,
		),
	);
	const accepted = tasks.data?.getReceptionTasks.list.find(
		(task: RecordItem) =>
			task.taskType === 'CHECK_IN' &&
			task.receptionistId === session._id &&
			['ACCEPTED', 'IN_PROGRESS'].includes(task.taskStatus),
	);
	const prepare = async () => {
		if (busy || disabled) return;
		setBusy(true);
		setFeedback('');
		try {
			const fresh = await tasks.refetch();
			let task = fresh.data.getReceptionTasks.list.find(
				(row: RecordItem) =>
					row.taskType === 'CHECK_IN' &&
					['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(row.taskStatus) &&
					(!row.receptionistId || row.receptionistId === session._id),
			);
			if (!task) {
				const result = await create({
					variables: {
						input: {
							appointmentId: line.appointmentId,
							taskType: 'CHECK_IN',
							taskPriority: 'MEDIUM',
							taskInstruction: f('arrivalInstruction'),
						},
					},
				});
				task = result.data.createReceptionTask;
			}
			if (task.taskStatus === 'PENDING')
				await update({
					variables: { input: { taskId: task._id, taskStatus: 'ACCEPTED' } },
				});
			await tasks.refetch();
		} catch (error) {
			setFeedback(
				error instanceof Error ? error.message : t('admin.actionError'),
			);
		} finally {
			setBusy(false);
		}
	};
	return (
		<>
			<span>
				{f('reception')}:{' '}
				{accepted
					? t(
							taskStatusKeys[
								accepted.taskStatus as keyof typeof taskStatusKeys
							],
						)
					: f('taskNeeded')}
			</span>
			{accepted ? (
				<Link href="/receptionist-workspace/appointments">
					{t('dashboard.myAppointments')}
				</Link>
			) : (
				<button
					type="button"
					disabled={disabled || busy || tasks.loading || Boolean(tasks.error)}
					onClick={() => void prepare()}
				>
					{f('prepare')}
				</button>
			)}
			{(feedback || tasks.error) && (
				<p role="alert">{feedback || tasks.error?.message}</p>
			)}
		</>
	);
}
