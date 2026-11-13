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
				<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel clinical-admin-detail">
					<header>
						<h2>{selected.appointmentCode}</h2>
						<button type="button" onClick={() => setSelected(null)}>{w('cancel')}</button>
					</header>
					<dl>
						<div><dt>{w('start')}</dt><dd><time dateTime={selected.startsAt}>{new Date(selected.startsAt).toLocaleString()}</time></dd></div>
						<div><dt>{w('end')}</dt><dd><time dateTime={selected.endsAt}>{new Date(selected.endsAt).toLocaleString()}</time></dd></div>
						<div><dt>{w('status')}</dt><dd>{selected.appointmentStatus.replaceAll('_', ' ')}</dd></div>
						<div><dt>{w('reason')}</dt><dd>{selected.appointmentReason || '—'}</dd></div>
						<div className="clinical-admin-detail-wide"><dt>{w('description')}</dt><dd>{selected.appointmentDesc || '—'}</dd></div>
					</dl>
					{feedback && <p role="alert">{feedback}</p>}
					<label className="clinical-admin-detail-field">
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
