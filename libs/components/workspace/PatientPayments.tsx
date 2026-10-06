import { useMemo, useState } from 'react';
import Script from 'next/script';
import { useMutation, useQuery } from '@apollo/client';
import {
	MY_PAYMENTS,
	MY_PAYMENT,
	PREPARE_EXIMBAY,
} from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem, ResourceConfig } from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';
const configured =
	process.env.NEXT_PUBLIC_EXIMBAY_SDK_URL ??
	'https://api-test.eximbay.com/v1/javascriptSDK.js';
const sdkUrl =
	/^https:\/\/(api-test|api)\.eximbay\.com\/v1\/javascriptSDK\.js$/.test(
		configured,
	)
		? configured
		: '';
export default function PatientPayments() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [feedback, setFeedback] = useState('');
	const [ready, setReady] = useState(false);
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
	const [prepare, state] = useMutation(PREPARE_EXIMBAY);
	const payment = detail.data?.getMyPayment;
	const pay = async () => {
		if (!selected || state.loading || !ready) return;
		setFeedback('');
		try {
			const response = await prepare({
				variables: { input: { paymentId: selected._id } },
			});
			const payload = JSON.parse(
				JSON.stringify(response.data.prepareEximbayPayment),
				(key, value) => (key === '__typename' ? undefined : value),
			);
			const sdk = (window as any).EXIMBAY;
			if (!sdk?.request_pay) throw new Error(w('paymentUnavailable'));
			sdk.request_pay(payload);
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<>
			{selected?.paymentProvider === 'EXIMBAY' && sdkUrl && (
				<Script
					src={sdkUrl}
					onReady={() => setReady(true)}
					onError={() => {
						setReady(false);
						setFeedback(w('paymentUnavailable'));
					}}
				/>
			)}
			<ResourcePanel config={config} />
			{selected && (
				<section className="clinical-inner-section clinical-resource-panel">
					<header>
						<h2>{w('payments')}</h2>
						<button onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{feedback && <p role="alert">{feedback}</p>}
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
										disabled={state.loading || !ready}
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
