import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import {
	GET_ADMIN_DASHBOARD_STATS,
	GET_MY_DOCTOR_APPOINTMENTS,
	GET_MY_DOCTOR_DASHBOARD_STATS,
	GET_MY_RECEPTIONIST_APPOINTMENT_QUEUE,
	GET_MY_RECEPTIONIST_DASHBOARD_STATS,
} from '@/apollo/dashboard/query';
import {
	AdminDashboardStats,
	DoctorDashboardStats,
	ReceptionistDashboardStats,
	WorkspaceAppointment,
} from '@/libs/components/dashboard/types';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MessageKey } from '@/libs/i18n/messages';
import StaffLayout from '@/libs/components/layout/StaffLayout';
import StaffWorkspace from '@/libs/components/dashboard/StaffWorkspace';
import AdminDashboard from '@/libs/components/dashboard/AdminDashboard';
import DoctorDashboard from '@/libs/components/dashboard/DoctorDashboard';
import ReceptionistDashboard from '@/libs/components/dashboard/ReceptionistDashboard';

const Dashboard = () => {
	const t = useTranslation();
	const session = useReactiveVar(userVar);
	const role = session.memberType;
	const staffRole =
		role === MemberType.ADMIN ||
		role === MemberType.DOCTOR ||
		role === MemberType.RECEPTIONIST
			? role
			: null;
	const admin = useQuery<{ getAdminDashboardStats: AdminDashboardStats }>(
		GET_ADMIN_DASHBOARD_STATS,
		{
			skip: !session._id || role !== MemberType.ADMIN,
			fetchPolicy: 'no-cache',
		},
	);
	const doctor = useQuery<{ getMyDoctorDashboardStats: DoctorDashboardStats }>(
		GET_MY_DOCTOR_DASHBOARD_STATS,
		{
			skip: !session._id || role !== MemberType.DOCTOR,
			fetchPolicy: 'no-cache',
		},
	);
	const receptionist = useQuery<{
		getMyReceptionistDashboardStats: ReceptionistDashboardStats;
	}>(GET_MY_RECEPTIONIST_DASHBOARD_STATS, {
		skip: !session._id || role !== MemberType.RECEPTIONIST,
		fetchPolicy: 'no-cache',
	});
	const doctorAppointments = useQuery<{
		getAppointments: { list: WorkspaceAppointment[] };
	}>(GET_MY_DOCTOR_APPOINTMENTS, {
		skip: !session._id || role !== MemberType.DOCTOR,
		fetchPolicy: 'no-cache',
	});
	const receptionistQueue = useQuery<{
		getMyReceptionistAppointmentQueue: { list: WorkspaceAppointment[] };
	}>(GET_MY_RECEPTIONIST_APPOINTMENT_QUEUE, {
		skip: !session._id || role !== MemberType.RECEPTIONIST,
		fetchPolicy: 'no-cache',
	});
	useLiveWorkspaceRefresh(
		async () => {
			if (role === MemberType.DOCTOR)
				await Promise.all([doctor.refetch(), doctorAppointments.refetch()]);
			if (role === MemberType.RECEPTIONIST)
				await Promise.all([
					receptionist.refetch(),
					receptionistQueue.refetch(),
				]);
		},
		Boolean(
			session._id &&
			(role === MemberType.DOCTOR || role === MemberType.RECEPTIONIST),
		),
	);
	const request =
		role === MemberType.ADMIN
			? admin
			: role === MemberType.DOCTOR
				? doctor
				: receptionist;
	const titleKey: MessageKey =
		role === MemberType.ADMIN
			? 'dashboard.adminTitle'
			: role === MemberType.DOCTOR
				? 'dashboard.doctorTitle'
				: role === MemberType.RECEPTIONIST
					? 'dashboard.receptionistTitle'
					: 'dashboard.title';
	const retry = () => {
		void request.refetch();
	};

	return (
		<StaffLayout>
			{!session._id || !staffRole ? (
				<main className="clinical-staff-gate">
					<div>
						<span>{t('dashboard.staffPortal')}</span>
						<h1>{t('dashboard.restricted')}</h1>
						<p>{t('dashboard.restrictedIntro')}</p>
						<nav>
							<Link href="/account/admin-signin">
								{t('dashboard.adminSignin')}
							</Link>
							<Link href="/account/doctor-signin">
								{t('auth.doctorSignin')}
							</Link>
							<Link href="/account/receptionist-signin">
								{t('dashboard.receptionistSignin')}
							</Link>
							<Link href="/">{t('dashboard.visitSite')}</Link>
						</nav>
					</div>
				</main>
			) : (
				<StaffWorkspace
					role={staffRole}
					name={session.memberFullName || session.memberNick}
					title={t(titleKey)}
				>
					{request.loading && !request.data && (
						<p className="clinical-staff-state">{t('dashboard.loading')}</p>
					)}
					{request.error && !request.data && (
						<div className="clinical-staff-state">
							<p className="clinical-form-error" role="alert">
								{t('dashboard.loadError')}
							</p>
							<button
								type="button"
								className="clinical-secondary-button"
								onClick={retry}
							>
								{t('patient.retry')}
							</button>
						</div>
					)}
					{role === MemberType.ADMIN && admin.data && (
						<AdminDashboard stats={admin.data.getAdminDashboardStats} />
					)}
					{role === MemberType.DOCTOR && doctor.data && (
						<DoctorDashboard
							stats={doctor.data.getMyDoctorDashboardStats}
							appointments={doctorAppointments.data?.getAppointments.list}
							loading={doctorAppointments.loading}
							error={Boolean(doctorAppointments.error)}
						/>
					)}
					{role === MemberType.RECEPTIONIST && receptionist.data && (
						<ReceptionistDashboard
							stats={receptionist.data.getMyReceptionistDashboardStats}
							appointments={
								receptionistQueue.data?.getMyReceptionistAppointmentQueue.list
							}
							loading={receptionistQueue.loading}
							error={Boolean(receptionistQueue.error)}
						/>
					)}
				</StaffWorkspace>
			)}
		</StaffLayout>
	);
};

export default Dashboard;
