import { useServiceOptionText } from '@/libs/components/workspace/useServiceOptionText';
import { usePromotionText } from '@/libs/components/workspace/usePromotionText';
import { operation } from '@/apollo/workspace/operations';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import Icon from '@/libs/components/common/Icon';
import { GET_MY_NOTIFICATIONS } from '@/apollo/notification/query';
import { NotificationItem } from '@/libs/components/notification/types';
import { AdminDashboardStats } from './types';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';

const PROFILE = operation(
	'query',
	'getMyAdminProfile',
	null,
	'_id adminNick adminPhone adminMail adminDesc adminImage',
);
const AdminDashboard = ({ stats }: { stats: AdminDashboardStats }) => {
	const t = useTranslation();
	const promoText = usePromotionText();
	const optionText = useServiceOptionText();
	const w = useWorkspaceText();
	const profile = useQuery(PROFILE, { fetchPolicy: 'network-only' });
	const [profileOpen, setProfileOpen] = useState(false);
	const { language } = usePreferences();
	const format = new Intl.DateTimeFormat(
		{ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language],
		{ dateStyle: 'medium', timeStyle: 'short' },
	);
	const updates = useQuery<{
		getMyNotifications: { list: NotificationItem[] };
	}>(GET_MY_NOTIFICATIONS, {
		variables: { input: { page: 1, limit: 4 } },
		fetchPolicy: 'no-cache',
	});
	const metrics = [
		{
			key: 'patients',
			icon: 'groups',
			label: t('dashboard.patients'),
			value: stats.totalPatients,
			href: '/admin/patients',
			detail: `${stats.activePatients.toLocaleString()} ${t('dashboard.activePatients')}`,
		},
		{
			key: 'doctors',
			icon: 'stethoscope',
			label: t('dashboard.doctors'),
			value: stats.totalDoctors,
			detail: `${stats.activeDoctors.toLocaleString()} ${t('dashboard.activeDoctors')}`,
			href: '/admin/doctors',
		},
		{
			key: 'bookings',
			icon: 'receipt_long',
			label: t('dashboard.bookings'),
			value: stats.totalBookings,
			href: '/admin/bookings',
		},
		{
			key: 'receptionists',
			icon: 'support_agent',
			label: t('dashboard.receptionists'),
			value: stats.totalReceptionists,
			detail: `${stats.activeReceptionists.toLocaleString()} ${t('dashboard.activeReceptionists')}`,
			href: '/admin/receptionists',
		},
		{
			key: 'appointments',
			icon: 'event',
			label: t('dashboard.appointments'),
			value: stats.totalAppointments,
			href: '/admin/appointments',
		},
	];
	const shortcuts = [
		{ href: '/admin/services?view=options', icon: 'format_list_bulleted', label: optionText.title },
		{ href: '/admin/promo-codes', icon: 'sell', label: promoText.promotions },
		{ href: '/admin/doctors', icon: 'stethoscope', label: t('nav.doctors') },
		{
			href: '/admin/receptionists',
			icon: 'support_agent',
			label: t('dashboard.receptionists'),
		},
		{
			href: '/admin/services',
			icon: 'medical_services',
			label: t('nav.services'),
		},
		{ href: '/admin/messages', icon: 'mail', label: t('messages.title') },
	];

	return (
		<div className="clinical-staff-admin-content clinical-admin-command">
			<Link href="/admin/profile">{w('edit')} · {w('accountProfile')}</Link>
			<button
				type="button"
				className="clinical-staff-table-action"
				aria-expanded={profileOpen}
				onClick={() => setProfileOpen((v) => !v)}
			>
				{t('dashboard.profileLink')}
			</button>
			{profileOpen && (
				<section className="clinical-staff-panel clinical-resource-panel">
					<h2>{profile.data?.getMyAdminProfile.adminNick}</h2>
					{profile.error && <p role="alert">{profile.error.message}</p>}
					{profile.data && (
						<dl>
							{(['adminPhone', 'adminMail', 'adminDesc'] as const).map(
								(key, index) => (
									<div key={key}>
										<dt>
											{w((['phone', 'email', 'description'] as const)[index])}
										</dt>
										<dd>{profile.data.getMyAdminProfile[key] ?? '—'}</dd>
									</div>
								),
							)}
						</dl>
					)}
				</section>
			)}
			<div
				className="clinical-admin-command-strip"
				aria-label={t('dashboard.adminActivity')}
			>
				<div>
					<span className="clinical-admin-signal" />
					<strong>MN Hospital</strong>
					<span>{t('dashboard.adminOperations')}</span>
				</div>
				<div>
					<Icon name="groups" />
					<span>{t('dashboard.activePatients')}</span>
					<strong>{stats.activePatients.toLocaleString()}</strong>
				</div>
				<div>
					<Icon name="stethoscope" />
					<span>{t('dashboard.activeDoctors')}</span>
					<strong>{stats.activeDoctors.toLocaleString()}</strong>
				</div>
				<div>
					<Icon name="support_agent" />
					<span>{t('dashboard.activeReceptionists')}</span>
					<strong>{stats.activeReceptionists.toLocaleString()}</strong>
				</div>
			</div>
			<div className="clinical-admin-command-grid">
				<section
					className="clinical-admin-constellation"
					aria-labelledby="admin-overview-heading"
				>
					<header>
						<div>
							<small>{t('dashboard.adminOverview')}</small>
							<h2 id="admin-overview-heading">MN Hospital</h2>
						</div>
						<span>{t('dashboard.adminPeople')}</span>
					</header>
					<div className="clinical-admin-constellation-map">
						<svg
							className="clinical-admin-constellation-lines"
							viewBox="0 0 1000 560"
							preserveAspectRatio="none"
							aria-hidden="true"
						>
							<path d="M500 260 L215 115 M500 260 L785 115 M500 260 L175 385 M500 260 L825 385 M500 260 L500 490" />
						</svg>
						<div className="clinical-admin-core">
							<span>MN</span>
							<small>HOSPITAL</small>
						</div>
						{metrics.map((metric) => {
							const content = (
								<>
									<span className="clinical-admin-node-icon">
										<Icon name={metric.icon} />
									</span>
									<span className="clinical-admin-node-copy">
										<small>{metric.label}</small>
										<strong>{metric.value.toLocaleString()}</strong>
										{metric.detail && <em>{metric.detail}</em>}
									</span>
								</>
							);
							return metric.href ? (
								<Link
									key={metric.key}
									href={metric.href}
									className={`clinical-admin-node clinical-admin-node-${metric.key}`}
								>
									{content}
								</Link>
							) : (
								<div
									key={metric.key}
									className={`clinical-admin-node clinical-admin-node-${metric.key}`}
								>
									{content}
								</div>
							);
						})}
					</div>
					<p className="clinical-admin-constellation-note">
						<Icon name="info" />
						{t('dashboard.intro')}
					</p>
				</section>
				<div className="clinical-admin-command-side">
					<section
						className="clinical-admin-command-panel"
						aria-labelledby="admin-shortcuts-heading"
					>
						<header>
							<Icon name="bolt" />
							<h2 id="admin-shortcuts-heading">
								{t('dashboard.adminOperations')}
							</h2>
						</header>
						<div className="clinical-admin-shortcuts">
							{shortcuts.map((item) => (
								<Link key={item.href} href={item.href}>
									<Icon name={item.icon} />
									<span>{item.label}</span>
									<Icon name="arrow_forward" />
								</Link>
							))}
						</div>
					</section>
					<section
						className="clinical-admin-command-panel clinical-admin-directives"
						aria-labelledby="admin-updates-heading"
					>
						<header>
							<Icon name="notifications_active" />
							<h2 id="admin-updates-heading">{t('dashboard.adminRecent')}</h2>
							<Link
								href="/admin/notifications"
								aria-label={t('dashboard.adminViewAll')}
							>
								<Icon name="arrow_forward" />
							</Link>
						</header>
						{updates.loading && (
							<p className="clinical-query-status">
								{t('notifications.loading')}
							</p>
						)}
						{updates.error && (
							<p className="clinical-form-error" role="alert">
								{t('notifications.loadError')}
							</p>
						)}
						{!updates.loading &&
							!updates.error &&
							!updates.data?.getMyNotifications.list.length && (
								<p className="clinical-admin-empty">
									{t('dashboard.adminEmpty')}
								</p>
							)}
						{!updates.loading &&
							!updates.error &&
							!!updates.data?.getMyNotifications.list.length && (
								<ul>
									{updates.data.getMyNotifications.list.map((item) => (
										<li key={item._id}>
											<span
												className={`clinical-admin-update-dot ${item.notificationStatus === 'UNREAD' ? 'unread' : ''}`}
											/>
											<div>
												<strong>{item.notificationTitle}</strong>
												<p>{item.notificationDesc}</p>
												<time dateTime={item.createdAt}>
													{format.format(new Date(item.createdAt))}
												</time>
												<span className="clinical-admin-update-status">
													{t(
														item.notificationStatus === 'UNREAD'
															? 'notifications.unread'
															: item.notificationStatus === 'ARCHIVED'
																? 'notifications.archived'
																: 'notifications.read',
													)}
												</span>
											</div>
										</li>
									))}
								</ul>
							)}
						<Link
							className="clinical-admin-directives-all"
							href="/admin/notifications"
						>
							{t('dashboard.adminViewAll')} <Icon name="arrow_forward" />
						</Link>
					</section>
				</div>
			</div>
			<div className="clinical-admin-command-bottom">
				<section className="clinical-admin-command-panel" id="admin-operations">
					<header>
						<Icon name="monitoring" />
						<h2>{t('dashboard.adminActivity')}</h2>
					</header>
					<dl>
						<div>
							<dt>{t('dashboard.bookings')}</dt>
							<dd>{stats.totalBookings.toLocaleString()}</dd>
						</div>
						<div>
							<dt>{t('dashboard.appointments')}</dt>
							<dd>{stats.totalAppointments.toLocaleString()}</dd>
						</div>
						<div>
							<dt>{t('dashboard.patients')}</dt>
							<dd>{stats.totalPatients.toLocaleString()}</dd>
						</div>
					</dl>
				</section>
				<section className="clinical-admin-command-panel" id="admin-staff">
					<header>
						<Icon name="badge" />
						<h2>{t('dashboard.adminStaff')}</h2>
					</header>
					<dl>
						<div>
							<dt>{t('dashboard.activeDoctors')}</dt>
							<dd>
								{stats.activeDoctors.toLocaleString()} /{' '}
								{stats.totalDoctors.toLocaleString()}
							</dd>
						</div>
						<div>
							<dt>{t('dashboard.activeReceptionists')}</dt>
							<dd>
								{stats.activeReceptionists.toLocaleString()} /{' '}
								{stats.totalReceptionists.toLocaleString()}
							</dd>
						</div>
					</dl>
				</section>
			</div>
		</div>
	);
};

export default AdminDashboard;
