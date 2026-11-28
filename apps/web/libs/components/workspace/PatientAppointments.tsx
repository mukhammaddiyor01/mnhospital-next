import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { appointmentStatusKeys } from '@/libs/components/dashboard/staffLabels';
import { AppointmentStatus } from '@/libs/components/dashboard/staffTypes';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { clinicDateTime } from '@/libs/payments/clinic';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
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
	const t = useTranslation();
	const { language } = usePreferences();
	const clinic = useClinicSettings();
	const [selected, setSelected] = useState<RecordItem | null>(null);
	const [revision, setRevision] = useState(0);
	const [feedback, setFeedback] = useState('');
	const [cancel, state] = useMutation(CANCEL_APPOINTMENT);
	const config = useMemo<ResourceConfig>(
		() => ({
			role: MemberType.PATIENT,
			live: true,
			onRowsChange: (rows) =>
				setSelected((current) =>
					current
						? (rows.find((row) => row._id === current._id) ?? null)
						: null,
				),
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
					<h2>{recordReference(selected.appointmentCode)}</h2>
					<p>{selected.appointmentReason}</p>
					<p>{selected.appointmentDesc}</p>
					<p>
						{clinicDateTime(
							selected.startsAt,
							{ EN: 'en-US', UZ: 'uz-UZ', KR: 'ko-KR' }[language],
							clinic.timeZone,
						)}{' '}
						·{' '}
						{t(
							appointmentStatusKeys[
								selected.appointmentStatus as AppointmentStatus
							],
						)}
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
