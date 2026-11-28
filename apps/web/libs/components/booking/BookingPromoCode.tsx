import { FormEvent, useRef, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { APPLY_BOOKING_PROMO } from '@/apollo/promotion/operations';
import { userVar } from '@/apollo/store';
import { CheckoutState } from '@/libs/payments/clinic';
import { formatMoney } from '../common/currency';
import { usePromotionText } from '../workspace/usePromotionText';
import Icon from '../common/Icon';
import styles from '../promotions/Promotions.module.scss';
export default function BookingPromoCode({
	state,
	disabled,
	onApplied,
}: {
	state: CheckoutState;
	disabled: boolean;
	onApplied: () => Promise<unknown>;
}) {
	const text = usePromotionText(),
		session = useReactiveVar(userVar),
		[code, setCode] = useState(''),
		[error, setError] = useState('');
	const lock = useRef(false),
		[apply, mutation] = useMutation(APPLY_BOOKING_PROMO);
	const ineligible =
		state.order.pricingVersion !== 1 ||
		disabled ||
		Boolean(state.order.pricingLockedAt) ||
		state.order.bookingOrderStatus !== 'PENDING' ||
		state.payments.length > 0;
	const blocked = ineligible || mutation.loading;
	const save = async (promoCode: string | null) => {
		if (blocked || lock.current) return;
		lock.current = true;
		setError('');
		try {
			await apply({
				variables: { input: { bookingOrderId: state.order._id, promoCode } },
				context: { expectedAccount: `${session.memberType}:${session._id}` },
			});
			await onApplied();
			setCode('');
		} catch (error) {
			setError(error instanceof Error ? error.message : text.retryLoad);
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
		<section className={styles.checkoutSummary} aria-label={text.checkoutTitle}>
			<h3>{text.checkoutTitle}</h3>
			<dl className={styles.priceSummary}>
				<div>
					<dt>{text.subtotal}</dt>
					<dd>
						{formatMoney(state.order.bookingOrderSubtotalAmount, currency)}
					</dd>
				</div>
				{(state.order.serviceDiscountAmount ?? 0) > 0 && (
					<div className={styles.discountLine}>
						<dt>{text.serviceDiscount}</dt>
						<dd>
							−{formatMoney(state.order.serviceDiscountAmount ?? 0, currency)}
						</dd>
					</div>
				)}
				{(state.order.promoDiscountAmount ?? 0) > 0 && (
					<div className={styles.discountLine}>
						<dt>{text.promoDiscount}</dt>
						<dd>
							−{formatMoney(state.order.promoDiscountAmount ?? 0, currency)}
						</dd>
					</div>
				)}
			</dl>
			{state.order.promoCode && (
				<div className={styles.appliedCode}>
					<span>
						<Icon name="check_circle" />
						{text.applied}: <strong>{state.order.promoCode}</strong>
					</span>
					<button
						className={styles.textButton}
						type="button"
						disabled={blocked}
						onClick={() => void save(null)}
					>
						{text.remove}
					</button>
				</div>
			)}
			{!ineligible && (
				<details className={styles.codeDisclosure}>
					<summary>
						<Icon name="local_offer" />
						{text.haveCode}
						<Icon name="expand_more" />
					</summary>
					<form onSubmit={submit}>
						<label>
							{text.code}
							<div className={styles.codeEntry}>
								<input
									aria-label={text.code}
									value={code}
									onChange={(event) =>
										setCode(event.target.value.toUpperCase())
									}
									placeholder={text.codePlaceholder}
									required
									minLength={3}
									maxLength={32}
									pattern="[A-Za-z0-9_-]+"
									autoComplete="off"
									disabled={mutation.loading}
								/>
								<button
									className={styles.primary}
									type="submit"
									disabled={mutation.loading || code.trim().length < 3}
								>
									{mutation.loading ? text.saving : text.apply}
								</button>
							</div>
						</label>
						<p className={styles.help}>{text.checkoutHelp}</p>
					</form>
				</details>
			)}
			{state.order.pricingLockedAt && (
				<p className={styles.help}>
					<Icon name="lock" />
					{text.locked}
				</p>
			)}
			{error && (
				<p className={styles.error} role="alert">
					{error}
				</p>
			)}
			<div className={styles.checkoutTotal}>
				<span>{text.total}</span>
				<strong>
					{formatMoney(state.order.bookingOrderTotalAmount, currency)}
				</strong>
			</div>
		</section>
	);
}
