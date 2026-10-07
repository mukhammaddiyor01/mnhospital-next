import { userVar } from '@/apollo/store';
import Link from 'next/link';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	PATIENT_ORDERS,
	PATIENT_ORDER,
	CANCEL_ORDER,
	CREATE_PAYMENT,
	CREATE_APPOINTMENT,
	ROOMS,
} from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem, ResourceConfig } from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';
import { useEximbayCheckout } from '@/libs/payments/useEximbayCheckout';
export default function PatientBookings() {
	const w = useWorkspaceText();
	const session = useReactiveVar(userVar);
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [revision, setRevision] = useState(0);
	const [feedback, setFeedback] = useState('');
	const [line, setLine] = useState<number | null>(null);
	const [provider, setProvider] = useState('CASH');
	const eximbay = useEximbayCheckout(provider === 'EXIMBAY');
	const keys = useRef<Record<string, string>>({});
	const config = useMemo<ResourceConfig>(
		() => ({
			role: MemberType.PATIENT,
			title: 'bookings',
			list: PATIENT_ORDERS,
			listKey: 'getMyBookingOrders',
			columns: [
				{ name: 'orderCode', label: 'code' },
				{ name: 'bookingOrderStatus', label: 'status' },
				{ name: 'bookingOrderTotalAmount', label: 'total' },
				{ name: 'bookingOrderCurrency', label: 'currency' },
			],
			onSelect: (r) => {
				setSelected(r);
				setLine(null);
				setFeedback('');
			},
		}),
		[],
	);
	const detail = useQuery(PATIENT_ORDER, {
		variables: { bookingOrderId: selected?._id ?? '' },
		skip: !selected,
		fetchPolicy: 'network-only',
	});
	const order = detail.data?.getMyBookingOrder;
	const rooms = useQuery(ROOMS, { skip: line === null });
	const [cancel, cancelling] = useMutation(CANCEL_ORDER);
	const [payment, paying] = useMutation(CREATE_PAYMENT);
	const [appointment, creating] = useMutation(CREATE_APPOINTMENT);
	const busy = cancelling.loading || paying.loading || creating.loading || eximbay.loading;
	const refresh = async () => {
		await detail.refetch();
		setRevision((v) => v + 1);
	};
	const preparePayment = async (item: any) => {
		if (
			!order ||
			busy ||
			!window.confirm(
				`${w('pay')}: ${item.servicePrice} ${order.bookingOrderCurrency}?`,
			)
		)
			return;
		const key = [
			'mn-payment',
			session._id,
			order._id,
			item.serviceId,
			item.doctorId,
			provider,
		].join(':');
		if (!keys.current[key]) {
			try {
				keys.current[key] =
					window.sessionStorage.getItem(key) || crypto.randomUUID();
				window.sessionStorage.setItem(key, keys.current[key]);
			} catch {
				keys.current[key] = crypto.randomUUID();
			}
		}
		try {
			const result = await payment({
				variables: {
					input: {
						bookingOrderId: order._id,
						serviceId: item.serviceId,
						doctorId: item.doctorId,
						paymentProvider: provider,
						paymentMethod: provider === 'CASH' ? 'CASH' : 'CARD',
						idempotencyKey: keys.current[key],
					},
				},
			});
			setFeedback(w('paymentRecorded'));
			if (provider === 'EXIMBAY' && result.data?.createPayment?.paymentStatus === 'PENDING') {
				await eximbay.openCheckout(result.data.createPayment._id);
			}
			await refresh();
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	const createAppointment = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (line === null || !order || busy) return;
		const item = order.bookingOrderItems[line];
		if (!item || item.appointmentId) return;
		const values = new FormData(event.currentTarget);
		const startsAt = new Date(item.requestedStartAt);
		const minutes = Number.parseInt(item.serviceDuration, 10);
		if (!Number.isFinite(minutes) || minutes <= 0) {
			setFeedback(w('invalidTime'));
			return;
		}
		try {
			await appointment({
				variables: {
					input: {
						bookingOrderId: order._id,
						serviceId: item.serviceId,
						doctorId: item.doctorId,
						roomId: String(values.get('room')),
						appointmentType: String(values.get('type')),
						appointmentReason: String(values.get('reason')).trim(),
						appointmentDesc: String(values.get('description')).trim(),
						startsAt: startsAt.toISOString(),
						endsAt: new Date(
							startsAt.getTime() + minutes * 60000,
						).toISOString(),
					},
				},
			});
			setLine(null);
			setFeedback(w('saved'));
			await refresh();
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<>
			{eximbay.script}
			<ResourcePanel key={revision} config={config} />
			{selected && (
				<section className="clinical-inner-section clinical-resource-panel">
					<header>
						<h2>{w('booking')}</h2>
						<button
							onClick={() => {
								setSelected(null);
								setLine(null);
							}}
						>
							{w('cancel')}
						</button>
					</header>
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{feedback && <p role="status">{feedback}</p>}
					{order && (
						<>
							<p>
								{order.orderCode} · {order.bookingOrderStatus} ·{' '}
								{order.bookingOrderTotalAmount} {order.bookingOrderCurrency}
							</p>
							<Link href="/mypage/payments">{w('payments')}</Link>
							<label>
								{w('provider')}
								<select
									value={provider}
									onChange={(e) => setProvider(e.target.value)}
									disabled={busy}
								>
									<option value="CASH">{w('cash')}</option>
									<option value="EXIMBAY">Eximbay</option>
								</select>
							</label>
							{provider === 'EXIMBAY' && !eximbay.ready && <p role="status">{eximbay.error || w('paymentLoading')}</p>}
							{order.bookingOrderItems.map((item: any, index: number) => (
								<div className="clinical-resource-actions" key={index}>
									<span>
										{item.serviceName} · {item.servicePrice} ·{' '}
										{new Date(item.requestedStartAt).toLocaleString()}
									</span>
									{['PENDING', 'CONFIRMED'].includes(
										order.bookingOrderStatus,
									) && (
										<button
											disabled={busy || (provider === 'EXIMBAY' && !eximbay.ready)}
											onClick={() => void preparePayment(item)}
										>
											{w('pay')}
										</button>
									)}
									{order.bookingOrderStatus === 'CONFIRMED' &&
										!item.appointmentId && (
											<button disabled={busy} onClick={() => setLine(index)}>
												{w('appointment')}
											</button>
										)}
									{item.appointmentId && (
										<Link href="/mypage/appointments">{w('appointment')}</Link>
									)}
								</div>
							))}
							{['PENDING', 'CONFIRMED'].includes(order.bookingOrderStatus) && (
								<button
									disabled={busy}
									onClick={async () => {
										if (!window.confirm(w('cancelBooking'))) return;
										try {
											await cancel({
												variables: { bookingOrderId: order._id },
											});
											await refresh();
											setLine(null);
										} catch (e: any) {
											setFeedback(e.message);
										}
									}}
								>
									{w('cancel')}
								</button>
							)}
							{line !== null && (
								<form
									className="clinical-resource-form"
									onSubmit={createAppointment}
								>
									<p>{w('bookingTime')}</p>
									<label>
										{w('room')}
										<select name="room" required>
											<option value="">{w('choose')}</option>
											{rooms.data?.getRooms
												.filter((r: any) => r.roomStatus === 'AVAILABLE')
												.map((r: any) => (
													<option key={r._id} value={r._id}>
														{r.roomNumber} · {r.roomName}
													</option>
												))}
										</select>
									</label>
									{rooms.error && <p role="alert">{rooms.error.message}</p>}
									<label>
										{w('type')}
										<input name="type" required maxLength={100} />
									</label>
									<label>
										{w('reason')}
										<input name="reason" required maxLength={1000} />
									</label>
									<label>
										{w('description')}
										<textarea name="description" required maxLength={2000} />
									</label>
									<button
										disabled={busy || rooms.loading || Boolean(rooms.error)}
									>
										{w('create')}
									</button>
								</form>
							)}
						</>
					)}
				</section>
			)}
		</>
	);
}
