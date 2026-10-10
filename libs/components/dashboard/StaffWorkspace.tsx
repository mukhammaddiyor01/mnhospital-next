import UnreadBadge, { UnreadLink } from '@/libs/components/notification/UnreadBadge';
import {
	useWorkspaceText,
	WorkspaceTextKey,
} from '@/libs/components/workspace/useWorkspaceText';
import { ReactNode, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { usePromotionText } from '@/libs/components/workspace/usePromotionText';
import GeneralChat from '@/libs/components/chat/GeneralChat';
import { logOut } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { MessageKey } from '@/libs/i18n/messages';
import { useRouter } from 'next/router';
import LanguageControl from '@/libs/components/preference/LanguageControl';
import ThemeControl from '@/libs/components/preference/ThemeControl';

type StaffRole = MemberType.ADMIN | MemberType.DOCTOR | MemberType.RECEPTIONIST;

const StaffWorkspace = ({
	role,
	name,
	title,
	intro,
	children,
}: {
	role: StaffRole;
	name: string;
	title: string;
	intro?: string;
	children: ReactNode;
}) => {
	const t = useTranslation();
	const w = useWorkspaceText();
	const promotionText = usePromotionText();
	const router = useRouter();
	const [chatOpen, setChatOpen] = useState(false);
	const [navigationOpen, setNavigationOpen] = useState(false);
	const navigationToggle = useRef<HTMLButtonElement>(null);
	const isAdmin = role === MemberType.ADMIN;
	const dashboardHref = '/mypage/dashboard';
	const workspaceRoot = isAdmin
		? '/admin'
		: role === MemberType.DOCTOR
			? '/doctor-workspace'
			: '/receptionist-workspace';
	const profileHref = `${workspaceRoot}/profile`;
	const notificationHref = `${workspaceRoot}/notifications`;
	const roleLabel: MessageKey =
		role === MemberType.ADMIN
			? 'dashboard.adminWorkspace'
			: role === MemberType.DOCTOR
				? 'dashboard.doctorTitle'
				: 'dashboard.receptionistTitle';
	const nav: {
		href: string;
		icon: string;
		label: MessageKey;
		workspaceLabel?: WorkspaceTextKey;
		promotion?: boolean;
	}[] = [
		{ href: dashboardHref, icon: 'dashboard', label: 'dashboard.title' },
		{ href: profileHref, icon: 'account_circle', label: 'dashboard.profileLink' },
		...(role === MemberType.ADMIN
			? [
					{
						href: '/admin/doctors',
						icon: 'stethoscope',
						label: 'nav.doctors' as MessageKey,
					},
					{
						href: '/admin/services',
						icon: 'medical_services',
						label: 'nav.services' as MessageKey,
					},
					{
						href: '/admin/promo-codes',
						icon: 'local_offer',
						label: 'nav.services' as MessageKey,
						promotion: true,
					},
					{
						href: '/admin/receptionists',
						icon: 'support_agent',
						label: 'dashboard.receptionists' as MessageKey,
					},
				]
			: role === MemberType.DOCTOR
				? [
						{
							href: `${workspaceRoot}/appointments`,
							icon: 'event',
							label: 'dashboard.myAppointments' as MessageKey,
						},
						{
							href: `${workspaceRoot}/services`,
							icon: 'medical_services',
							label: 'dashboard.myServices' as MessageKey,
						},
						{
							href: `${workspaceRoot}/reports`,
							icon: 'description',
							label: 'dashboard.myReports' as MessageKey,
						},
					]
				: [
						{
							href: `${workspaceRoot}/appointments`,
							icon: 'event',
							label: 'dashboard.myAppointments' as MessageKey,
						},
						{
							href: `${workspaceRoot}/tasks`,
							icon: 'assignment',
							label: 'dashboard.pendingWork' as MessageKey,
						},
						{
							href: `${workspaceRoot}/reports`,
							icon: 'description',
							label: 'dashboard.myReports' as MessageKey,
						},
					]),
		...(role === MemberType.ADMIN
			? [
					'patients',
					'bookings',
					'appointments',
					'payments',
					'articles',
					'comments',
					'advertisements',
					'notices',
					'rooms',
					'tasks',
				]
			: role === MemberType.DOCTOR
				? ['bookings', 'articles', 'departments', 'schedule']
				: ['bookings', 'payments']
		).map((page) => ({
			href: `${workspaceRoot}/${page}`,
			icon:
				page === 'payments'
					? 'payments'
					: page === 'articles'
						? 'description'
						: 'assignment',
			label: 'dashboard.title' as MessageKey,
			workspaceLabel: (page === 'appointments'
				? 'appointment'
				: page === 'rooms'
					? 'room'
					: page) as WorkspaceTextKey,
		})),
		{
			href: `${workspaceRoot}/messages`,
			icon: 'mail',
			label: 'messages.title',
		},
		{
			href: notificationHref,
			icon: 'notifications',
			label: 'notifications.title',
		},
	];

	return (
		<div
			className={`clinical-staff-shell clinical-staff-${role.toLowerCase()}`}
		>
			<aside className={`clinical-staff-sidebar${navigationOpen ? ' is-navigation-open' : ''}`} onKeyDown={(event) => {
				if (event.key === 'Escape' && navigationOpen) {
					setNavigationOpen(false);
					navigationToggle.current?.focus();
				}
			}}>
				<Link className="clinical-staff-brand" href={dashboardHref}>
					<span>
						<Icon name="local_hospital" />
					</span>
					<div>
						<strong>MN Hospital</strong>
						<small>{t('dashboard.staffPortal')}</small>
					</div>
				</Link>
				<button className="mn-staff-navigation-toggle" ref={navigationToggle} type="button" aria-label={t('dashboard.workspaceNavigation')} aria-expanded={navigationOpen} aria-controls="staff-navigation" onClick={() => setNavigationOpen((current) => !current)}>
					<Icon name={navigationOpen ? 'close' : 'menu'} />
				</button>
				<div className="clinical-staff-role">{t(roleLabel)}</div>
				<nav id="staff-navigation" aria-label={t('dashboard.workspaceNavigation')}>
					{nav.map((item) => (
						<Link
							key={item.href}
							className={router.pathname === item.href ? 'active' : ''}
							href={item.href}
							aria-current={router.pathname === item.href ? 'page' : undefined}
							onClick={() => setNavigationOpen(false)}
						>
							<Icon name={item.icon} />
							<span>
								{item.promotion ? promotionText.promotions : item.workspaceLabel ? w(item.workspaceLabel) : t(item.label)}
							</span>
                            {item.href.endsWith('/messages') && <UnreadBadge kind="messages" />}
                            {item.href.endsWith('/notifications') && <UnreadBadge kind="notifications" />}
						</Link>
					))}
				</nav>
				<div className="clinical-staff-sidebar-footer">
					<button type="button" onClick={() => void logOut()}>
						<Icon name="logout" />
						{t('patient.signoutTitle')}
					</button>
				</div>
			</aside>
			<div className="clinical-staff-column">
				<header className="clinical-staff-topbar">
					<div>
						<span>{t('dashboard.staffPortal')}</span>
						<strong>{t(roleLabel)}</strong>
					</div>
					<div className="clinical-staff-top-actions">
						{!isAdmin && (
							<div
								className={
									role === MemberType.DOCTOR
										? 'clinical-doctor-preferences'
										: 'clinical-reception-preferences'
								}
							>
								<ThemeControl />
								<LanguageControl />
							</div>
						)}
						<button
							type="button"
							onClick={() => setChatOpen(true)}
							aria-label={t('chat.open')}
						>
							<Icon name="chat_bubble" />
						</button>
                        <UnreadLink kind="messages" href={`${workspaceRoot}/messages`} label={t('messages.title')}><Icon name="mail" /></UnreadLink>
                        <UnreadLink kind="notifications" href={notificationHref} label={t('notifications.title')}><Icon name="notifications" /></UnreadLink>
						<Link
							className="clinical-staff-avatar"
							href={profileHref}
							aria-label={t(
								isAdmin ? 'dashboard.title' : 'dashboard.profileLink',
							)}
						>
							<Icon name="person" />
						</Link>
					</div>
				</header>
				<main className="clinical-staff-content">
					<div className="clinical-staff-page-heading">
						<div>
							<span>{t(roleLabel)}</span>
							<h1>{title}</h1>
							<p>{intro ?? t('dashboard.intro')}</p>
						</div>
						<Link href={profileHref}>
							<Icon name="person" />
							{name}
						</Link>
					</div>
					{children}
				</main>
			</div>
			<GeneralChat open={chatOpen} onClose={() => setChatOpen(false)} />
		</div>
	);
};

export default StaffWorkspace;
