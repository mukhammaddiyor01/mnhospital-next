import { FormEvent, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { APPLY_BOOKING_PROMO } from '@/apollo/promotion/operations';
import { CheckoutState } from '@/libs/payments/clinic';
import { formatMoney } from '../common/currency';
import { usePromotionText } from '../workspace/usePromotionText';
export default function BookingPromoCode({
	state,
	disabled,
	onApplied,
}: {
	state: CheckoutState;
	disabled: boolean;
	onApplied: () => Promise<unknown>;
}) {
	const text = usePromotionText();
	const [code, setCode] = useState(''),
		[error, setError] = useState('');
	const lock = useRef(false);
	const [apply, mutation] = useMutation(APPLY_BOOKING_PROMO);
	const blocked =
		state.order.pricingVersion !== 1 ||
		disabled ||
		mutation.loading ||
		Boolean(state.order.pricingLockedAt) ||
		state.order.bookingOrderStatus !== 'PENDING' ||
		state.payments.length > 0;
	const save = async (promoCode: string | null) => {
		if (blocked || lock.current) return;
		lock.current = true;
		setError('');
		try {
			await apply({ variables: { input: { bookingOrderId: state.order._id, promoCode } } });
			await onApplied();
			setCode('');
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Error');
		} finally {
			lock.current = false;
		}
	};
	const submit = (event: FormEvent) => {
		event.preventDefault();
		void save(code.trim().toUpperCase());
	};
	const currency = state.order.bookingOrderCurrency;
	return (
		<section aria-label={text.promotions}>
			<dl>
				<dt>{text.subtotal}</dt>
				<dd>{formatMoney(state.order.bookingOrderSubtotalAmount, currency)}</dd>
				<dt>{text.serviceDiscount}</dt>
				<dd>−{formatMoney(state.order.serviceDiscountAmount ?? 0, currency)}</dd>
				<dt>{text.promoDiscount}</dt>
				<dd>−{formatMoney(state.order.promoDiscountAmount ?? 0, currency)}</dd>
			</dl>
			{state.order.promoCode && (
				<p>
					{text.applied}: <strong>{state.order.promoCode}</strong>{' '}
					<button type="button" disabled={blocked} onClick={() => void save(null)}>
						{text.remove}
					</button>
				</p>
			)}
			{!blocked && (
				<form className="clinical-resource-form" onSubmit={submit}>
					<fieldset className="clinical-resource-fields" disabled={mutation.loading}>
						<label>
							{text.code}
							<input
								value={code}
								onChange={(e) => setCode(e.target.value.toUpperCase())}
								required
								minLength={3}
								maxLength={32}
								pattern="[A-Za-z0-9_-]+"
								autoComplete="off"
							/>
						</label>
						<button type="submit" disabled={mutation.loading}>
							{text.apply}
						</button>
					</fieldset>
				</form>
			)}
			{state.order.pricingLockedAt && <p>{text.locked}</p>}
			{error && (
				<p className="clinical-form-error" role="alert">
					{error}
				</p>
			)}
		</section>
	);
}
