import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel from '@/libs/components/workspace/ResourcePanel';
import { patients, accounts } from '@/libs/components/workspace/adminResources';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
const DETAIL = operation(
	'query',
	'getPatientByAdmin',
	'String',
	'_id patientFullName patientBirthDate patientGender patientBloodType patientAddress patientDesc memberStatus',
	'patientId',
);
const ACTIVITY = operation(
	'query',
	'getPatientActivityByAdmin',
	'String',
	'patient { _id } bookingOrders { _id orderCode bookingOrderStatus bookingOrderTotalAmount bookingOrderCurrency } appointments { _id appointmentCode appointmentStatus startsAt endsAt } services { _id serviceName }',
	'patientId',
);
export default function Page() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState('');
	const config = useMemo(
		() => ({ ...patients, onSelect: (row: any) => setSelected(row._id) }),
		[],
	);
	const detail = useQuery(DETAIL, {
		variables: { patientId: selected },
		skip: !selected,
	});
	const activity = useQuery(ACTIVITY, {
		variables: { patientId: selected },
		skip: !selected,
	});
	const p = detail.data?.getPatientByAdmin;
	const a = activity.data?.getPatientActivityByAdmin;
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('patients')}>
			<ResourcePanel config={config} />
			<ResourcePanel config={accounts} />
			{selected && (
				<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel clinical-admin-detail">
					<header>
						<h2>{w('details')}</h2>
						<button type="button" onClick={() => setSelected('')}>{w('cancel')}</button>
					</header>
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{activity.error && <p role="alert">{activity.error.message}</p>}
					{p && (
						<dl>
							{[
								['fullName', p.patientFullName],
								['date', p.patientBirthDate],
								['gender', p.patientGender],
								['blood', p.patientBloodType],
								['address', p.patientAddress],
								['status', p.memberStatus],
							].map(([key, value]) => (
								<div key={key}>
									<dt>{w(key as any)}</dt>
									<dd>{value ?? '—'}</dd>
								</div>
							))}
						</dl>
					)}
					{a && (
						<div className="clinical-admin-detail-groups">
							<section><h3>{w('bookings')}</h3><ul>
								{a.bookingOrders.map((o: any) => (
									<li key={o._id}><strong>{o.orderCode}</strong><span>{o.bookingOrderStatus.replaceAll('_', ' ')} · {o.bookingOrderTotalAmount} {o.bookingOrderCurrency}</span></li>
								))}
							</ul></section>
							<section><h3>{w('appointment')}</h3><ul>
								{a.appointments.map((r: any) => (
									<li key={r._id}><strong>{r.appointmentCode}</strong><span>{r.appointmentStatus.replaceAll('_', ' ')} · <time dateTime={r.startsAt}>{new Date(r.startsAt).toLocaleString()}</time></span></li>
								))}
							</ul></section>
							<section><h3>{w('service')}</h3><ul>
								{a.services.map((r: any) => <li key={r._id}><strong>{r.serviceName}</strong></li>)}
							</ul></section>
						</div>
					)}
				</section>
			)}
		</WorkspacePage>
	);
}
