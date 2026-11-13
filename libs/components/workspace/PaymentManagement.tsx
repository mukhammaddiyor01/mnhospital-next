import { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem } from './ResourcePanel';
import { payments } from './adminResources';
import { useWorkspaceText } from './useWorkspaceText';
const UPDATE = operation(
	'mutation',
	'updatePaymentStatus',
	'PaymentStatusInput',
	'_id paymentStatus',
);
const transitions: Record<string, string[]> = {
	PENDING: ['PAID', 'FAILED', 'CANCELLED'],
	PAID: ['REFUNDED'],
	FAILED: [],
	CANCELLED: [],
	REFUNDED: [],
};
export default function PaymentManagement({
	role,
}: {
	role: MemberType.ADMIN | MemberType.RECEPTIONIST;
}) {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [feedback, setFeedback] = useState('');
	const [revision, setRevision] = useState(0);
	const [update, { loading }] = useMutation(UPDATE);
	const config = useMemo(
		() => ({ ...payments(role), onSelect: setSelected }),
		[role],
	);
	const save = async (status: string) => {
		if (
			!selected ||
			loading ||
			!window.confirm(
				`${w('approve')}: ${selected.paymentAmount} ${selected.paymentCurrency} → ${status}?`,
			)
		)
			return;
		setFeedback('');
		try {
			await update({
				variables: {
					input: { paymentId: selected._id, paymentStatus: status },
				},
			});
			setSelected(null);
			setRevision((v) => v + 1);
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<>
			<ResourcePanel key={revision} config={config} />
			{selected && (
				<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel clinical-admin-detail">
					<header>
						<h2>{w('payments')}</h2>
						<button type="button" onClick={() => setSelected(null)}>
							{w('cancel')}
						</button>
					</header>
					<dl>
						<div><dt>{w('total')}</dt><dd>{selected.paymentAmount} {selected.paymentCurrency}</dd></div>
						<div><dt>{w('status')}</dt><dd>{selected.paymentStatus.replaceAll('_', ' ')}</dd></div>
						<div><dt>{w('provider')}</dt><dd>{selected.paymentProvider || '—'}</dd></div>
						<div><dt>{w('paymentMethod')}</dt><dd>{selected.paymentMethod || '—'}</dd></div>
						{(
							['bookingOrderId', 'patientId', 'doctorId', 'serviceId'] as const
						).map((field, index) => (
							<div key={field}>
								<dt>
									{w(
										(['booking', 'patient', 'doctor', 'service'] as const)[
											index
										],
									)}
								</dt>
								<dd>{selected[field]}</dd>
							</div>
						))}
					</dl>
					{feedback && <p role="alert">{feedback}</p>}
					<div className="clinical-resource-actions">
						{(transitions[selected.paymentStatus] ?? []).map((status) => (
							<button
								key={status}
								type="button"
								disabled={loading}
								onClick={() => void save(status)}
							>
								{status.replaceAll('_', ' ')}
							</button>
						))}
					</div>
				</section>
			)}
		</>
	);
}
