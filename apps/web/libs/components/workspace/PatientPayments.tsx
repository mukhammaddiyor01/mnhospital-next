import EximbayTestCard from '@/libs/payments/EximbayTestCard';
import { BOOKING_OPTIONS } from '@/apollo/booking/checkout';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
	MY_PAYMENTS,
	MY_PAYMENT,
} from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem, ResourceConfig } from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';

export default function PatientPayments() {
	const w = useWorkspaceText();
	const options = useQuery(BOOKING_OPTIONS);
	const [selected, setSelected] = useState<RecordItem | null>(null);


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

	return (
		<>
			<ResourcePanel config={config} />
			{selected && (
				<section className="clinical-inner-section clinical-resource-panel">
					<header>
						<h2>{w('payments')}</h2>
						<button onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					{detail.error && <p role="alert">{detail.error.message}</p>}

					{selected.paymentProvider === 'EXIMBAY' && <><p>{w('paymentSandbox')}</p><EximbayTestCard mode={options.data?.getBookingPaymentOptions.onlineMode} /></>}

					{payment && (
						<>
							<p>
								{payment.paymentAmount} {payment.paymentCurrency} ·{' '}
								{payment.paymentStatus}
							</p>
							<p>{w('paymentNotice')}</p>
							<Link href={`/booking/${payment.bookingOrderId}/payment`}>{w('bookingSummary')}</Link>
							<button
								onClick={() => void detail.refetch().catch(() => undefined)}
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
