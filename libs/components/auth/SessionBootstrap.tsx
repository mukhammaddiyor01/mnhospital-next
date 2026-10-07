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
	applySessionToken,
	clearSession,
	restoreSession,
} from '@/libs/auth/session';
import { getJwtToken } from '@/libs/auth/token';

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
			if (event.key !== 'accessToken' && event.key !== 'logout') return;
			const token = getJwtToken();
			if (token) {
				try {
					applySessionToken(token);
				} catch {
					void restoreSession();
				}
			} else clearSession(false);
			void client.clearStore();
		};
		window.addEventListener('storage', storage);
		window.addEventListener('mn-hospital-session-ended', ended);
		window.addEventListener('mn-hospital-session-changed', ended);
		return () => {
			stopped = true;
			window.removeEventListener('storage', storage);
			window.removeEventListener('mn-hospital-session-ended', ended);
			window.removeEventListener('mn-hospital-session-changed', ended);
		};
	}, [client, queries]);
	return (
		<SessionReady.Provider value={ready}>{children}</SessionReady.Provider>
	);
}
