import Link from 'next/link';
import { ReactNode } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useUnread } from './UnreadProvider';
import styles from './UnreadBadge.module.scss';
export type UnreadKind = 'notifications' | 'messages';
export default function UnreadBadge({ kind }: { kind: UnreadKind }) {
	const count = useUnread()[kind],
		t = useTranslation();
	if (!count) return null;
	return (
		<>
			<span className={styles.badge} aria-hidden="true">
				{count > 99 ? '99+' : count}
			</span>
			<span className={styles.srOnly}>
				{count} {t('notifications.unread')}
			</span>
		</>
	);
}
export function UnreadLink({
	kind,
	href,
	label,
	children,
}: {
	kind: UnreadKind;
	href: string;
	label: string;
	children: ReactNode;
}) {
	const count = useUnread()[kind],
		t = useTranslation();
	const name = count
		? `${label}: ${count} ${t('notifications.unread')}`
		: label;
	return (
		<Link href={href} className={styles.action} aria-label={name} title={name}>
			{children}
			<UnreadBadge kind={kind} />
		</Link>
	);
}
