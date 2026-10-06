import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import {
	MY_APPOINTMENTS,
	CANCEL_APPOINTMENT,
} from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import ResourcePanel, { ResourceConfig, RecordItem } from './ResourcePanel';
import { useWorkspaceText } from './useWorkspaceText';
export default function PatientAppointments() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [revision, setRevision] = useState(0);
	const [feedback, setFeedback] = useState('');
	const [cancel, state] = useMutation(CANCEL_APPOINTMENT);
	const config = useMemo<ResourceConfig>(
		() => ({
			role: MemberType.PATIENT,
			title: 'appointment',
			list: MY_APPOINTMENTS,
			listKey: 'getMyAppointments',
			columns: [
				{ name: 'appointmentCode', label: 'code' },
				{ name: 'startsAt', label: 'start' },
				{ name: 'endsAt', label: 'end' },
				{ name: 'appointmentStatus', label: 'status' },
			],
			onSelect: setSelected,
		}),
		[],
	);
	return (
		<>
			<ResourcePanel key={revision} config={config} />
			{selected && (
				<section className="clinical-inner-section clinical-resource-panel">
					<h2>{selected.appointmentCode}</h2>
					<p>{selected.appointmentReason}</p>
					<p>{selected.appointmentDesc}</p>
					<p>
						{new Date(selected.startsAt).toLocaleString()} ·{' '}
						{selected.appointmentStatus}
					</p>
					{feedback && <p role="alert">{feedback}</p>}
					<Link href="/mypage/reports">{w('reports')}</Link>
					{['PENDING', 'CONFIRMED'].includes(selected.appointmentStatus) && (
						<button
							disabled={state.loading}
							onClick={async () => {
								if (!window.confirm(w('cancelAppointment'))) return;
								try {
									await cancel({ variables: { appointmentId: selected._id } });
									setSelected(null);
									setRevision((v) => v + 1);
								} catch (e: any) {
									setFeedback(e.message);
								}
							}}
						>
							{w('cancel')}
						</button>
					)}
				</section>
			)}
		</>
	);
}
