import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import ResourcePanel from '@/libs/components/workspace/ResourcePanel';
import { MY_REPORT, MY_REPORTS } from '@/apollo/workspace/patientOperations';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
function Reports() {
	const w = useWorkspaceText();
	const [selected, setSelected] = useState('');
	const config = useMemo(
		() => ({
			role: MemberType.PATIENT,
			title: 'reports' as const,
			list: MY_REPORTS,
			listKey: 'getMyPatientReports',
			columns: [
				{ name: 'createdAt', label: 'date' as const },
				{ name: 'docReportDiagnosis', label: 'diagnosis' as const },
				{ name: 'docReportFollowUp', label: 'followUp' as const },
			],
			onSelect: (r: any) => setSelected(r._id),
		}),
		[],
	);
	const detail = useQuery(MY_REPORT, {
		variables: { reportId: selected },
		skip: !selected,
		fetchPolicy: 'network-only',
	});
	const report = detail.data?.getMyPatientReport;
	return (
		<>
			<ResourcePanel config={config} />
			{selected && (
				<section className="clinical-inner-section">
					<h2>{w('medicalInfo')}</h2>
					<button onClick={() => setSelected('')}>{w('cancel')}</button>
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{report &&
						[
							['symptoms', 'docReportSymptoms'],
							['description', 'docReportObservations'],
							['diagnosis', 'docReportDiagnosis'],
							['followUp', 'docReportRecommendation'],
							['medication', 'docReportMedication'],
						].map(([label, key]) => (
							<div key={key}>
								<h3>{w(label as any)}</h3>
								<p>{report[key] ?? '—'}</p>
							</div>
						))}
				</section>
			)}
		</>
	);
}
function Page() {
	const w = useWorkspaceText();
	return (
		<PatientGate title={w('reports')}>
			<Reports />
		</PatientGate>
	);
}
export default withLayoutMain(Page);
