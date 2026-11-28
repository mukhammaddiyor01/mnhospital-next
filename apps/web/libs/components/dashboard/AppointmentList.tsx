import { recordReference } from '@/libs/components/workspace/recordPresentation';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { WorkspaceAppointment } from './types';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { MessageKey } from '@/libs/i18n/messages';

const statusKeys: Record<
	WorkspaceAppointment['appointmentStatus'],
	MessageKey
> = {
	PENDING: 'dashboard.statusPending',
	CONFIRMED: 'dashboard.statusConfirmed',
	IN_PROGRESS: 'dashboard.statusInProgress',
	ENDED: 'dashboard.statusEnded',
	COMPLETED: 'dashboard.statusCompleted',
	CANCELLED: 'dashboard.statusCancelled',
	NO_SHOW: 'dashboard.statusNoShow',
};
const locales = { KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' };

const AppointmentList = ({
	appointments,
	loading,
	error,
}: {
	appointments?: WorkspaceAppointment[];
	loading: boolean;
	error: boolean;
}) => {
	const t = useTranslation();
	const { language } = usePreferences();
	const clinic = useClinicSettings();
	const format = new Intl.DateTimeFormat(locales[language], {
		timeZone: clinic.timeZone,
		dateStyle: 'medium',
		timeStyle: 'short',
	});

	return (
		<section className="clinical-staff-panel clinical-staff-appointment-panel">
			<header>
				<div>
					<span className="clinical-staff-panel-kicker">
						{t('dashboard.workSummary')}
					</span>
					<h2>{t('dashboard.assignedAppointments')}</h2>
				</div>
			</header>
			{loading && (
				<p className="clinical-staff-state">{t('dashboard.loading')}</p>
			)}
			{error && (
				<p className="clinical-staff-state clinical-form-error" role="alert">
					{t('dashboard.appointmentsError')}
				</p>
			)}
			{!loading && !error && !appointments?.length && (
				<p className="clinical-staff-state">{t('dashboard.noAppointments')}</p>
			)}
			{!loading && !error && !!appointments?.length && (
				<div className="clinical-staff-table-scroll">
					<table>
						<thead>
							<tr>
								<th>{t('dashboard.appointmentCode')}</th>
								<th>{t('dashboard.appointmentTime')}</th>
								<th>{t('dashboard.appointmentStatus')}</th>
							</tr>
						</thead>
						<tbody>
							{appointments.map((item) => (
								<tr key={item._id}>
									<td>
										<strong>{recordReference(item.appointmentCode)}</strong>
										<small>{item.appointmentReason}</small>
									</td>
									<td>
										<time dateTime={item.startsAt}>
											{format.format(new Date(item.startsAt))}
										</time>
									</td>
									<td>
										<span
											className={`clinical-staff-status status-${item.appointmentStatus.toLowerCase()}`}
										>
											{t(statusKeys[item.appointmentStatus])}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default AppointmentList;
