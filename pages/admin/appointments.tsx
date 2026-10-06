import { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel, {
	RecordItem,
} from '@/libs/components/workspace/ResourcePanel';
import { appointments } from '@/libs/components/workspace/adminResources';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
const UPDATE = operation(
	'mutation',
	'updateAppointmentStatus',
	'AppointmentStatusInput',
	'_id appointmentStatus',
);
const transitions: Record<string, string[]> = {
	PENDING: ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
	CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
	IN_PROGRESS: ['ENDED', 'COMPLETED'],
	ENDED: ['COMPLETED'],
	COMPLETED: [],
	CANCELLED: [],
	NO_SHOW: [],
};
export default function Page() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [reason, setReason] = useState('');
	const [feedback, setFeedback] = useState('');
	const [revision, setRevision] = useState(0);
	const [update, { loading }] = useMutation(UPDATE);
	const config = useMemo(
		() => ({ ...appointments, onSelect: setSelected }),
		[],
	);
	const change = async (status: string) => {
		if (
			!selected ||
			loading ||
			!window.confirm(
				`${w('approve')}: ${selected.appointmentCode} → ${status}?`,
			)
		)
			return;
		try {
			await update({
				variables: {
					input: {
						appointmentId: selected._id,
						appointmentStatus: status,
						...(reason.trim() ? { reason: reason.trim() } : {}),
					},
				},
			});
			setSelected(null);
			setReason('');
			setRevision((v) => v + 1);
		} catch (e: any) {
			setFeedback(e.message);
		}
	};
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('appointment')}>
			<ResourcePanel key={revision} config={config} />
			{selected && (
				<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel">
					<header>
						<h2>{selected.appointmentCode}</h2>
						<button onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					<p>
						{new Date(selected.startsAt).toLocaleString()} –{' '}
						{new Date(selected.endsAt).toLocaleString()}
					</p>
					<p>{selected.appointmentReason}</p>
					<p>{selected.appointmentDesc}</p>
					{feedback && <p role="alert">{feedback}</p>}
					<label>
						{w('reason')}
						<input value={reason} onChange={(e) => setReason(e.target.value)} />
					</label>
					<div className="clinical-resource-actions">
						{(transitions[selected.appointmentStatus] ?? []).map((status) => (
							<button
								key={status}
								disabled={loading}
								onClick={() => void change(status)}
							>
								{status.replaceAll('_', ' ')}
							</button>
						))}
					</div>
				</section>
			)}
		</WorkspacePage>
	);
}
