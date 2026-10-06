import { operation } from '@/apollo/workspace/operations';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import { GET_MY_NOTIFICATIONS } from '@/apollo/notification/query';
import {
	ARCHIVE_MY_NOTIFICATION,
	MARK_ALL_MY_NOTIFICATIONS_READ,
	MARK_MY_NOTIFICATION_READ,
} from '@/apollo/notification/mutation';
import {
	NotificationItem,
	NotificationStatus,
} from '@/libs/components/notification/types';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { MemberType } from '@/libs/components/member/enums/member.enum';

type Filter = 'ALL' | NotificationStatus;
const DETAIL = operation(
	'query',
	'getMyNotification',
	'String',
	'_id notificationTitle notificationDesc notificationStatus notificationGroup notificationRefId createdAt',
	'notificationId',
);
const PAGE_SIZE = 10;
const filterLabels = {
	ALL: 'notifications.all',
	UNREAD: 'notifications.unread',
	READ: 'notifications.read',
	ARCHIVED: 'notifications.archived',
} as const;

export const NotificationsPage = ({
	embedded = false,
}: {
	embedded?: boolean;
}) => {
	const t = useTranslation();
	const w = useWorkspaceText();
	const [selected, setSelected] = useState('');
	const router = useRouter();
	const session = useReactiveVar(userVar);
	const staffWorkspace =
		session.memberType === MemberType.ADMIN
			? '/admin'
			: session.memberType === MemberType.DOCTOR
				? '/doctor-workspace'
				: session.memberType === MemberType.RECEPTIONIST
					? '/receptionist-workspace'
					: '';
	useEffect(() => {
		if (staffWorkspace && !embedded)
			void router.replace(`${staffWorkspace}/notifications`);
	}, [router, staffWorkspace, embedded]);
	const [filter, setFilter] = useState<Filter>('ALL');
	const [page, setPage] = useState(1);
	const [actionError, setActionError] = useState('');
	const input = {
		page,
		limit: PAGE_SIZE,
		...(filter === 'ALL' ? {} : { notificationStatus: filter }),
	};
	const { data, loading, error, refetch } = useQuery<{
		getMyNotifications: {
			list: NotificationItem[];
			metaCounter: { total?: number }[];
		};
	}>(GET_MY_NOTIFICATIONS, {
		variables: { input },
		skip: !session._id || (Boolean(staffWorkspace) && !embedded),
		fetchPolicy: 'cache-and-network',
		pollInterval: session._id && (embedded || !staffWorkspace) ? 30000 : 0,
	});
	const detail = useQuery(DETAIL, {
		variables: { notificationId: selected },
		skip: !selected || !session._id || (Boolean(staffWorkspace) && !embedded),
		fetchPolicy: 'network-only',
	});
	const [markRead, readState] = useMutation(MARK_MY_NOTIFICATION_READ);
	const [markAllRead, allState] = useMutation(MARK_ALL_MY_NOTIFICATIONS_READ);
	const [archive, archiveState] = useMutation(ARCHIVE_MY_NOTIFICATION);
	const list = data?.getMyNotifications.list ?? [];
	const total = data?.getMyNotifications.metaCounter?.[0]?.total ?? 0;
	const busy = readState.loading || allState.loading || archiveState.loading;

	const act = async (kind: 'read' | 'archive' | 'all', id?: string) => {
		setActionError('');
		try {
			if (kind === 'all') await markAllRead();
			if (kind === 'read')
				await markRead({ variables: { notificationId: id } });
			if (kind === 'archive')
				await archive({ variables: { notificationId: id } });
			await refetch();
		} catch (requestError: any) {
			setActionError(requestError?.message ?? t('notifications.actionError'));
		}
	};

	const destination = (item: NotificationItem) => {
		const root = staffWorkspace || '/mypage';
		const group = item.notificationGroup;
		if (group === 'CONVERSATION') return `${root}/messages`;
		if (group === 'PAYMENT') return `${root}/payments`;
		if (group === 'BOOKING_ORDER') return `${root}/bookings`;
		if (group === 'APPOINTMENT') return `${root}/appointments`;
		if (group === 'REPORT') return `${root}/reports`;
		if (
			group === 'RECEPTION_TASK' &&
			session.memberType !== MemberType.PATIENT &&
			session.memberType !== MemberType.DOCTOR
		)
			return `${root}/tasks`;
		return null;
	};

	if (staffWorkspace && !embedded) return null;

	return (
		<div className="clinical-inner-page">
			{!embedded && (
				<section className="clinical-inner-hero">
					<div>
						<div className="clinical-crumb">
							<Link href="/">{t('page.home')}</Link> /{' '}
							<Link href="/mypage">{t('page.profile')}</Link> /{' '}
							{t('notifications.title')}
						</div>
						<span className="clinical-eyebrow">
							{t('notifications.kicker')}
						</span>
						<h1>{t('notifications.title')}</h1>
						<p>{t('notifications.intro')}</p>
					</div>
				</section>
			)}
			{!session._id ? (
				<section className="clinical-inner-section clinical-auth-gate">
					<h2>{t('notifications.signinTitle')}</h2>
					<p>{t('notifications.signinIntro')}</p>
					<Link className="clinical-primary-button" href="/account/signin">
						{t('patient.signin')}
					</Link>
				</section>
			) : (
				<section className="clinical-inner-section clinical-notifications">
					<div className="clinical-notifications-toolbar">
						<div
							className="clinical-notifications-filters"
							aria-label={t('notifications.filter')}
						>
							{(['ALL', 'UNREAD', 'READ', 'ARCHIVED'] as Filter[]).map(
								(value) => (
									<button
										key={value}
										type="button"
										className={filter === value ? 'active' : ''}
										aria-pressed={filter === value}
										onClick={() => {
											setFilter(value);
											setPage(1);
										}}
									>
										{t(filterLabels[value])}
									</button>
								),
							)}
						</div>
						<button
							className="clinical-secondary-button"
							type="button"
							disabled={busy}
							onClick={() => void act('all')}
						>
							{t('notifications.markAll')}
						</button>
					</div>
					{loading && !data && (
						<p className="clinical-query-status">
							{t('notifications.loading')}
						</p>
					)}
					{error && (
						<p className="clinical-form-error">
							{t('notifications.loadError')}
						</p>
					)}
					{actionError && (
						<p className="clinical-form-error" role="alert">
							{actionError}
						</p>
					)}
					{!loading && !list.length && !error && (
						<p className="clinical-notifications-empty">
							{t('notifications.empty')}
						</p>
					)}
					{detail.error && <p role="alert">{detail.error.message}</p>}
					{detail.data && (
						<article className="clinical-staff-panel">
							<h2>{detail.data.getMyNotification.notificationTitle}</h2>
							<p>{detail.data.getMyNotification.notificationDesc}</p>
							<button onClick={() => setSelected('')}>{w('cancel')}</button>
						</article>
					)}
					<div className="clinical-notifications-list">
						{list.map((item) => (
							<article
								key={item._id}
								className={item.notificationStatus === 'UNREAD' ? 'unread' : ''}
							>
								<div>
									<span className="clinical-notifications-type">
										{item.notificationType}
									</span>
									<time dateTime={item.createdAt}>
										{new Date(item.createdAt).toLocaleString()}
									</time>
								</div>
								<h2>{item.notificationTitle}</h2>
								<p>{item.notificationDesc}</p>
								<div className="clinical-notifications-actions">
									<button type="button" onClick={() => setSelected(item._id)}>
										{w('details')}
									</button>
									{destination(item) && (
										<Link href={destination(item)!}>
											{t('notifications.open')}
										</Link>
									)}
									{item.notificationStatus === 'UNREAD' && (
										<button
											type="button"
											disabled={busy}
											onClick={() => void act('read', item._id)}
										>
											{t('notifications.markRead')}
										</button>
									)}
									{item.notificationStatus !== 'ARCHIVED' && (
										<button
											type="button"
											disabled={busy}
											onClick={() => void act('archive', item._id)}
										>
											{t('notifications.archive')}
										</button>
									)}
								</div>
							</article>
						))}
					</div>
					{total > PAGE_SIZE && (
						<nav
							className="clinical-notifications-pagination"
							aria-label={t('notifications.pages')}
						>
							<button
								type="button"
								disabled={page <= 1}
								onClick={() => setPage(page - 1)}
							>
								{t('notifications.previous')}
							</button>
							<span>
								{page} / {Math.ceil(total / PAGE_SIZE)}
							</span>
							<button
								type="button"
								disabled={page * PAGE_SIZE >= total}
								onClick={() => setPage(page + 1)}
							>
								{t('notifications.next')}
							</button>
						</nav>
					)}
				</section>
			)}
		</div>
	);
};

export default withLayoutMain(NotificationsPage);
