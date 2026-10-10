import { recordReference } from '@/libs/components/workspace/recordPresentation';
import EximbayTestCard from '@/libs/payments/EximbayTestCard';
import BookingPromoCode from '@/libs/components/booking/BookingPromoCode';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRef, useState } from 'react';
import { userVar } from '@/apollo/store';
import { BOOKING_OPTIONS, CHOOSE_PAYMENT, COMPLETE_TEST_PAYMENT, MY_CHECKOUT } from '@/apollo/booking/checkout';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { useEximbayCheckout } from '@/libs/payments/useEximbayCheckout';
import { CheckoutState, clinicDateTime } from '@/libs/payments/clinic';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '@/libs/components/common/currency';

function PaymentPage() {
	const router = useRouter();
	const w = useWorkspaceText();
	const clinic = useClinicSettings();
	const user = useReactiveVar(userVar);
	const { language } = usePreferences();
	const locale = language === 'UZ' ? 'uz-UZ' : language === 'KR' ? 'ko-KR' : 'en-US';
	const orderId = typeof router.query.bookingOrderId === 'string' ? router.query.bookingOrderId : '';
	const valid = /^[a-f\d]{24}$/i.test(orderId);
	const allowed = Boolean(user._id && user.memberType === MemberType.PATIENT);
	const checkout = useQuery<{ getMyBookingCheckout: CheckoutState }>(MY_CHECKOUT, {
		variables: { bookingOrderId: orderId }, skip: !router.isReady || !valid || !allowed, fetchPolicy: 'network-only', pollInterval: allowed && valid ? 10000 : 0,
	});
	const options = useQuery<{ getBookingPaymentOptions: { onlineMode: string } }>(BOOKING_OPTIONS);
	const mode = options.data?.getBookingPaymentOptions.onlineMode;
	const state = checkout.data?.getMyBookingCheckout;
	const requiresCashConfirmation = Boolean(state?.order.bookingOrderItems.some(line => Number(line.servicePrice) === 0));
	const activePayments = state?.payments.filter((payment) => ['PENDING', 'PAID'].includes(payment.paymentStatus)) ?? [];
	const pendingOnline = activePayments.filter((payment) => payment.paymentProvider === 'EXIMBAY' && payment.paymentStatus === 'PENDING');
	const [provider, setProvider] = useState('CASH');
	const [message, setMessage] = useState('');
	const [success, setSuccess] = useState(false);
	const lock = useRef(false);
	const eximbay = useEximbayCheckout(mode === 'SANDBOX');
	const [choose, choosing] = useMutation(CHOOSE_PAYMENT);
	const [complete, completing] = useMutation(COMPLETE_TEST_PAYMENT);
	const busy = choosing.loading || completing.loading || eximbay.loading;
	const reservations = state?.appointments.filter((appointment) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(appointment.appointmentStatus) && (!appointment.holdExpiresAt || new Date(appointment.holdExpiresAt).getTime() > Date.now())) ?? [];
	const allReserved = Boolean(state && reservations.length === state.order.bookingOrderItems.length);
	const allPaid = Boolean(state && state.order.bookingOrderItems.every((line) => activePayments.some((payment) => payment.serviceId === line.serviceId && payment.doctorId === line.doctorId && payment.paymentStatus === 'PAID')));
	const cashBooked = allReserved && activePayments.length === state?.order.bookingOrderItems.length && activePayments.every((payment) => payment.paymentProvider === 'CASH' || payment.paymentStatus === 'PAID');
	const unavailable = state?.order.bookingOrderStatus === 'CANCELLED' || state?.order.bookingOrderStatus === 'COMPLETED';
	const submit = async () => {
		if (lock.current || busy || !state || unavailable) return;
		lock.current = true;
		setMessage('');
		try {
			const chosen = await choose({ variables: { input: { bookingOrderId: orderId, paymentProvider: provider } } });
			await checkout.refetch();
			setSuccess(provider === 'CASH');
			const nextPayment = (chosen.data?.chooseBookingPayment as CheckoutState | undefined)?.payments.find((payment) => payment.paymentProvider === 'EXIMBAY' && payment.paymentStatus === 'PENDING');
			if (mode === 'SANDBOX' && nextPayment && eximbay.ready) await eximbay.openCheckout(nextPayment._id);
		} catch (error) { setMessage(error instanceof Error ? error.message : w('paymentUnavailable')); }
		finally { lock.current = false; }
	};
	const testPayment = async (outcome: 'PAID' | 'FAILED' | 'CANCELLED') => {
		if (lock.current || busy || !pendingOnline.length) return;
		lock.current = true;
		setMessage('');
		try {
			for (const payment of pendingOnline) await complete({ variables: { input: { paymentId: payment._id, outcome } } });
			setSuccess(outcome === 'PAID');
			if (outcome !== 'PAID') setMessage(w('testPaymentRetry'));
		} catch (error) { setMessage(error instanceof Error ? error.message : w('paymentUnavailable')); }
		finally { await checkout.refetch().catch(() => undefined); lock.current = false; }
	};
	const openSandbox = async (paymentId: string) => {
		setMessage('');
		try { await eximbay.openCheckout(paymentId); } catch (error) { setMessage(error instanceof Error ? error.message : w('paymentUnavailable')); }
	};
	return <PatientGate title={w('payments')}>
		{eximbay.script}
		<section className="clinical-inner-section clinical-resource-panel booking-checkout">
			<div className="wizard-steps"><span className="active"><b>01</b>{w('chooseVisit')}</span><span className="active"><b>02</b>{w('payments')}</span></div>
			{checkout.loading && !state && <p role="status">{w('paymentChecking')}</p>}
			{(checkout.error || (router.isReady && !valid)) && <p role="alert">{checkout.error?.message || w('paymentUnavailable')}</p>}
			{state && <>
				<h2>{w('bookingSummary')}</h2><p>{recordReference(state.order.orderCode)}</p>
				{state.order.bookingOrderItems.map((line) => <div className="clinical-booking-review" key={`${line.serviceId}:${line.doctorId}`}><div><h3>{line.serviceName}</h3><p>{clinicDateTime(line.requestedStartAt, locale, clinic.timeZone)}</p><small>{w('clinicTime')} · {clinic.timeZone}</small></div><strong>{formatMoney(line.servicePrice, state.order.bookingOrderCurrency)}</strong></div>)}
				<BookingPromoCode state={state} disabled={busy} onApplied={() => checkout.refetch()} />
				{unavailable && <p role="status">{w('status')}: {state.order.bookingOrderStatus}</p>}
				{!unavailable && !cashBooked && !(allPaid && allReserved) && pendingOnline.length === 0 && <>
					<fieldset className="checkout-methods" disabled={busy}><legend>{w('choosePayment')}</legend>
						<label><input type="radio" name="paymentProvider" value="CASH" checked={provider === 'CASH'} onChange={() => setProvider('CASH')} /><span><strong>{w('cash')}</strong><small>{w('cashBookingHelp')}</small></span></label>
						<label><input type="radio" name="paymentProvider" value="EXIMBAY" checked={provider === 'EXIMBAY'} disabled={!mode || mode === 'DISABLED' || requiresCashConfirmation} onChange={() => setProvider('EXIMBAY')} /><span><strong>{w('eximbayTest')}</strong><small>{mode === 'SIMULATED' ? w('localPaymentTest') : w('paymentSandbox')}</small></span></label>
					</fieldset>
					{(options.error || mode === 'DISABLED') && <p role="status">{w('onlineTestDisabled')}</p>}
					<button type="button" className="clinical-primary-button" disabled={busy || (provider === 'EXIMBAY' && (!mode || mode === 'DISABLED' || requiresCashConfirmation))} onClick={() => void submit()}>{busy ? w('paymentChecking') : provider === 'CASH' ? w('confirmCashBooking') : w('continueOnline')}</button>
				</>}
				{!unavailable && !allPaid && !cashBooked && (provider === 'EXIMBAY' || pendingOnline.length > 0) && <EximbayTestCard mode={mode} />}
				{pendingOnline.length > 0 && !unavailable && <div className="checkout-online"><h3>{w('eximbayTest')}</h3><p>{w('paymentSandbox')}</p><p>{w('paymentHold')}</p>
					{mode === 'SIMULATED' && pendingOnline.every((payment) => payment.testPayment) ? <><p>{w('localPaymentTest')}</p><div className="clinical-resource-actions"><button className="clinical-primary-button" type="button" disabled={busy} onClick={() => void testPayment('PAID')}>{w('testPaySuccess')}</button><button type="button" disabled={busy} onClick={() => void testPayment('FAILED')}>{w('testPayFailure')}</button><button type="button" disabled={busy} onClick={() => void testPayment('CANCELLED')}>{w('cancel')}</button></div></> : mode === 'SANDBOX' ? <>{eximbay.error && <p role="alert">{eximbay.error}</p>}{pendingOnline.map((payment) => <button type="button" key={payment._id} disabled={busy || !eximbay.ready} onClick={() => void openSandbox(payment._id)}>{w('pay')} · {formatMoney(payment.paymentAmount, payment.paymentCurrency)}</button>)}</> : <p role="alert">{w('onlineTestDisabled')}</p>}
				</div>}
				{((success && allReserved) || cashBooked || (allPaid && allReserved)) && <div className="checkout-success" role="status"><h3>{w('appointmentSaved')}</h3><p>{cashBooked && !allPaid ? w('cashBookingHelp') : w('paidBookingHelp')}</p></div>}
				{reservations.map((appointment) => <p key={appointment._id}>{appointment.appointmentCode} · {w('status')}: {appointment.appointmentStatus}</p>)}
				{activePayments.map((payment) => <p key={payment._id}>{payment.paymentProvider} · {w('status')}: {payment.paymentStatus}</p>)}
				<div className="clinical-resource-actions"><Link href="/mypage/appointments">{w('appointments')}</Link><Link href="/mypage/bookings">{w('bookings')}</Link><Link href="/appointment">{w('newAppointment')}</Link><button type="button" disabled={checkout.loading || busy} onClick={() => void checkout.refetch().catch(() => undefined)}>{w('refresh')}</button></div>
			</>}
			{message && <p className="clinical-form-error" role="alert">{message}</p>}
		</section>
	</PatientGate>;
}
export default withLayoutMain(PaymentPage);
