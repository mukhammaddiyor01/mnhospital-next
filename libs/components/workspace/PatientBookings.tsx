import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { PATIENT_ORDERS, PATIENT_ORDER, CANCEL_ORDER } from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem, ResourceConfig } from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { clinicDateTime } from '@/libs/payments/clinic';
export default function PatientBookings() {
	const w = useWorkspaceText();
	const clinic = useClinicSettings();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [revision, setRevision] = useState(0);
	const [feedback, setFeedback] = useState('');
	const config = useMemo<ResourceConfig>(() => ({ role: MemberType.PATIENT, title: 'bookings', list: PATIENT_ORDERS, listKey: 'getMyBookingOrders',
		columns: [{ name: 'orderCode', label: 'code' }, { name: 'bookingOrderStatus', label: 'status' }, { name: 'bookingOrderTotalAmount', label: 'total' }, { name: 'bookingOrderCurrency', label: 'currency' }],
		onSelect: (record) => { setSelected(record); setFeedback(''); }, }), []);
	const detail = useQuery(PATIENT_ORDER, { variables: { bookingOrderId: selected?._id || '' }, skip: !selected, fetchPolicy: 'network-only' });
	const order = detail.data?.getMyBookingOrder;
	const [cancel, cancelling] = useMutation(CANCEL_ORDER);
	const cancelOrder = async () => {
		if (!order || cancelling.loading || !window.confirm(w('cancelBooking'))) return;
		try { await cancel({ variables: { bookingOrderId: order._id } }); await detail.refetch(); setRevision((value) => value + 1); }
		catch (error) { setFeedback(error instanceof Error ? error.message : w('paymentUnavailable')); }
	};
	return <><ResourcePanel config={config} key={revision} />{selected && <section className="clinical-inner-section clinical-resource-panel">
		<header><h2>{w('bookings')}</h2><button type="button" onClick={() => setSelected(null)}>{w('cancel')}</button></header>
		{detail.loading && <p role="status">{w('refresh')}</p>}{detail.error && <p role="alert">{detail.error.message}</p>}{feedback && <p role="alert">{feedback}</p>}
		{order && <><p>{order.orderCode} · {order.bookingOrderStatus}</p>{order.bookingOrderItems.map((line: { serviceId: string; doctorId: string; serviceName: string; requestedStartAt: string }) => <p key={`${line.serviceId}:${line.doctorId}`}>{line.serviceName} · {clinicDateTime(line.requestedStartAt, 'en-US', clinic.timeZone)}</p>)}
			<p>{w('bookingFlow')}</p><div className="clinical-resource-actions"><Link className="clinical-primary-button" href={`/booking/${order._id}/payment`}>{w('bookingSummary')}</Link><Link href="/mypage/appointments">{w('appointments')}</Link>
			{['PENDING', 'CONFIRMED'].includes(order.bookingOrderStatus) && <button type="button" disabled={cancelling.loading} onClick={() => void cancelOrder()}>{w('cancel')}</button>}</div></>}
	</section>}</>;
}
