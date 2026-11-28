import { ensureAccessToken, refreshSessionToken } from '@/libs/auth/session';
import { socketAddress } from '@/libs/components/chat/GeneralChat';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	ReactNode,
} from 'react';
import { gql, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';

export const GET_UNREAD_COUNTS = gql`
	query GetMyUnreadCounts {
		getMyUnreadNotificationCount
		getMyUnreadMessageCount
	}
`;
type Counts = {
	notifications: number;
	messages: number;
	refresh: () => Promise<unknown>;
};
const empty: Counts = {
	notifications: 0,
	messages: 0,
	refresh: async () => undefined,
};
const UnreadContext = createContext<Counts>(empty);
export const useUnread = () => useContext(UnreadContext);
function SessionCounts({
	identity,
	children,
}: {
	identity: string;
	children: ReactNode;
}) {
	const { data, refetch } = useQuery<{
		getMyUnreadNotificationCount: number;
		getMyUnreadMessageCount: number;
	}>(GET_UNREAD_COUNTS, {
		fetchPolicy: 'network-only',
		context: { expectedAccount: identity },
	});
	const refresh = useCallback(
		() => refetch().catch(() => undefined),
		[refetch],
	);
	useLiveWorkspaceRefresh(refresh, true);
	const account = useReactiveVar(userVar);
	useEffect(() => {
		let stopped = false,
			socket: WebSocket | undefined;
		let retry: ReturnType<typeof setTimeout> | undefined;
		const connect = async () => {
			try {
				const token = await ensureAccessToken();
				if (stopped || !token) return;
				socket = new WebSocket(socketAddress(token));
				socket.onopen = () => {
					if (!stopped && document.visibilityState === 'visible')
						void refresh();
				};
				socket.onmessage = ({ data }) => {
					if (stopped || document.visibilityState !== 'visible') return;
					try {
						const packet = JSON.parse(String(data));
						if (
							packet.event === 'privateMessage' ||
							packet.event === 'privateRead'
						)
							void refresh();
					} catch {
						/* Malformed frames cannot change unread state. */
					}
				};
				socket.onclose = async (event) => {
					if (stopped) return;
					if (event.code === 1008) {
						try {
							await refreshSessionToken();
						} catch {
							return;
						}
					}
					if (!stopped) retry = setTimeout(connect, 3000);
				};
			} catch {
				if (!stopped) retry = setTimeout(connect, 3000);
			}
		};
		void connect();
		return () => {
			stopped = true;
			clearTimeout(retry);
			socket?.close();
		};
	}, [identity, account.accessToken, refresh]);
	return (
		<UnreadContext.Provider
			value={{
				notifications: data?.getMyUnreadNotificationCount ?? 0,
				messages: data?.getMyUnreadMessageCount ?? 0,
				refresh,
			}}
		>
			{children}
		</UnreadContext.Provider>
	);
}
export default function UnreadProvider({ children }: { children: ReactNode }) {
	const account = useReactiveVar(userVar);
	const identity =
		account._id && account.memberType
			? `${account.memberType}:${account._id}`
			: '';
	return identity ? (
		<SessionCounts key={identity} identity={identity}>
			{children}
		</SessionCounts>
	) : (
		<UnreadContext.Provider value={empty}>{children}</UnreadContext.Provider>
	);
}
