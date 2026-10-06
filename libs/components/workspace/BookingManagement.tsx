import { useMemo, useState } from 'react';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { RecordItem } from './ResourcePanel';
import { bookings } from './adminResources';
import { useWorkspaceText } from './useWorkspaceText';
export default function BookingManagement({
	role,
}: {
	role: MemberType.ADMIN | MemberType.RECEPTIONIST;
}) {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const config = useMemo(
		() => ({ ...bookings(role), onSelect: setSelected }),
		[role],
	);
	return (
		<>
			<ResourcePanel config={config} />
			{selected && (
				<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel">
					<header>
						<h2>{selected.orderCode}</h2>
						<button onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					<p>
						{selected.bookingOrderStatus} · {selected.bookingOrderTotalAmount}{' '}
						{selected.bookingOrderCurrency}
					</p>
					{selected.bookingOrderItems.map((item: any, index: number) => (
						<p key={index}>
							{item.serviceName} · {item.servicePrice} ·{' '}
							{new Date(item.requestedStartAt).toLocaleString()}
						</p>
					))}
				</section>
			)}
		</>
	);
}
