import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { useApolloClient } from '@apollo/client';
import { useQueryClient } from '@tanstack/react-query';
import {
	clearSession,
	renewVisibleSession,
	restoreSession,
} from '@/libs/auth/session';
import { sessionEventInvalidatesTab } from '@/libs/auth/token';

const SessionReady = createContext(false);
export const useSessionReady = () => useContext(SessionReady);

export default function SessionBootstrap({
	children,
}: {
	children: ReactNode;
}) {
	const client = useApolloClient();
	const queries = useQueryClient();
	const [ready, setReady] = useState(false);
	useEffect(() => {
		let stopped = false;
		void restoreSession().finally(() => {
			if (!stopped) setReady(true);
		});
		const ended = () => {
			void client.clearStore();
			queries.clear();
		};
		const storage = (event: StorageEvent) => {
			if (sessionEventInvalidatesTab(event.key, event.newValue)) clearSession(false);
		};
		const heartbeat = () => { void renewVisibleSession().catch(() => undefined); };
		const resumed = () => {
			if (document.visibilityState !== 'hidden' && navigator.onLine !== false)
				void restoreSession().then(renewVisibleSession).catch(() => undefined);
		};
		const interval = window.setInterval(heartbeat, 60_000);
		window.addEventListener('storage', storage);
		window.addEventListener('focus', resumed);
		window.addEventListener('online', resumed);
		document.addEventListener('visibilitychange', resumed);
		window.addEventListener('mn-hospital-session-ended', ended);
		window.addEventListener('mn-hospital-session-changed', ended);
		return () => {
			stopped = true;
			window.clearInterval(interval);
			window.removeEventListener('storage', storage);
			window.removeEventListener('focus', resumed);
			window.removeEventListener('online', resumed);
			document.removeEventListener('visibilitychange', resumed);
			window.removeEventListener('mn-hospital-session-ended', ended);
			window.removeEventListener('mn-hospital-session-changed', ended);
		};
	}, [client, queries]);
	return (
		<SessionReady.Provider value={ready}>{children}</SessionReady.Provider>
	);
}
