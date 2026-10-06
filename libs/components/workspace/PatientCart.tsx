import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import {
	MY_CART,
	CREATE_CART,
	REMOVE_CART_ITEM,
} from '@/apollo/workspace/patientOperations';
import { CREATE_BOOKING_ORDER } from '@/apollo/booking/mutation';
import { useWorkspaceText } from './useWorkspaceText';
export default function PatientCart() {
	const w = useWorkspaceText();
	const [feedback, setFeedback] = useState('');
	const { data, loading, error, refetch } = useQuery(MY_CART, {
		fetchPolicy: 'network-only',
	});
	const [create, creating] = useMutation(CREATE_CART);
	const [remove, removing] = useMutation(REMOVE_CART_ITEM);
	const [checkout, checking] = useMutation(CREATE_BOOKING_ORDER);
	const busy = creating.loading || removing.loading || checking.loading;
	const cart = data?.getMyCart;
	const run = async (action: () => Promise<any>) => {
		setFeedback('');
		try {
			await action();
			await refetch();
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<section className="clinical-inner-section clinical-resource-panel">
			<header>
				<h2>{w('cart')}</h2>
				<Link href="/appointment">{w('create')}</Link>
			</header>
			{loading && <p>{w('refresh')}</p>}
			{error && <p role="alert">{error.message}</p>}
			{feedback && <p role="status">{feedback}</p>}
			{!cart && !loading && (
				<button
					disabled={busy}
					onClick={() => void run(() => create({ variables: { input: {} } }))}
				>
					{w('create')}
				</button>
			)}
			{cart && (
				<>
					<p>
						{cart.totalAmount} {cart.currency}
					</p>
					{cart.items?.map((item: any) => (
						<div className="clinical-resource-actions" key={item._id}>
							<span>
								{item.serviceName} · {item.servicePrice} ·{' '}
								{new Date(item.requestedStartAt).toLocaleString()}
							</span>
							<button
								disabled={busy}
								onClick={() => {
									if (window.confirm(w('confirmRemove')))
										void run(() =>
											remove({ variables: { cartItemId: item._id } }),
										);
								}}
							>
								{w('remove')}
							</button>
						</div>
					))}
					<button
						disabled={busy || !cart.items?.length}
						onClick={async () => {
							if (!window.confirm(w('checkout'))) return;
							try {
								await checkout();
								window.location.assign('/mypage/bookings');
							} catch (e: any) {
								setFeedback(e.message);
							}
						}}
					>
						{w('checkout')}
					</button>
				</>
			)}
		</section>
	);
}
