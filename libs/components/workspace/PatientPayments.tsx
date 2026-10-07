import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
	MY_PAYMENTS,
	MY_PAYMENT,
} from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem, ResourceConfig } from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';
import { useEximbayCheckout } from '@/libs/payments/useEximbayCheckout';
export default function PatientPayments() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [feedback, setFeedback] = useState('');
	const eximbay = useEximbayCheckout(selected?.paymentProvider === 'EXIMBAY');
	const config = useMemo<ResourceConfig>(
		() => ({
			role: MemberType.PATIENT,
			title: 'payments',
			list: MY_PAYMENTS,
			listKey: 'getMyPayments',
			columns: [
				{ name: 'createdAt', label: 'date' },
				{ name: 'paymentAmount', label: 'total' },
				{ name: 'paymentCurrency', label: 'currency' },
				{ name: 'paymentProvider', label: 'provider' },
				{ name: 'paymentStatus', label: 'status' },
			],
			onSelect: setSelected,
		}),
		[],
	);
	const detail = useQuery(MY_PAYMENT, {
		variables: { paymentId: selected?._id ?? '' },
		skip: !selected,
		fetchPolicy: 'network-only',
	});
	const payment = detail.data?.getMyPayment;
	const pay = async () => {
		if (!selected || eximbay.loading || !eximbay.ready) return;
		setFeedback('');
		try {
			await eximbay.openCheckout(selected._id);
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<>
			{eximbay.script}
			<ResourcePanel config={config} />
			{selected && (
				<section className="clinical-inner-section clinical-resource-panel">
					<header>
						<h2>{w('payments')}</h2>
						<button onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{feedback && <p role="alert">{feedback}</p>}
					{eximbay.error && <p role="alert">{eximbay.error}</p>}
					{selected.paymentProvider === 'EXIMBAY' && !eximbay.ready && !eximbay.error && <p role="status">{w('paymentLoading')}</p>}
					{payment && (
						<>
							<p>
								{payment.paymentAmount} {payment.paymentCurrency} ·{' '}
								{payment.paymentStatus}
							</p>
							<p>{w('paymentNotice')}</p>
							{selected.paymentProvider === 'EXIMBAY' &&
								payment.paymentStatus === 'PENDING' && (
									<button
										disabled={eximbay.loading || !eximbay.ready}
										onClick={() => void pay()}
									>
										{w('pay')}
									</button>
								)}
							<button
								onClick={() => void detail.refetch()}
								disabled={detail.loading}
							>
								{w('refresh')}
							</button>
						</>
					)}
				</section>
			)}
		</>
	);
}
