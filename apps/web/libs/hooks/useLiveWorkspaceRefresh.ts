import { useEffect, useRef } from 'react';

/** Refresh visible workspaces after another role changes their shared records. */
export function useLiveWorkspaceRefresh(
	refresh: () => Promise<unknown>,
	enabled: boolean,
) {
	const latest = useRef(refresh);
	latest.current = refresh;
	useEffect(() => {
		if (!enabled) return;
		let disposed = false;
		let running = false;
		const update = async () => {
			if (disposed || running || document.visibilityState !== 'visible') return;
			running = true;
			try {
				await latest.current();
			} catch {
				/* The query owns its error/retry UI. */
			} finally {
				running = false;
			}
		};
		const timer = window.setInterval(() => void update(), 10000);
		const visible = () => {
			if (document.visibilityState === 'visible') void update();
		};
		window.addEventListener('focus', visible);
		document.addEventListener('visibilitychange', visible);
		return () => {
			disposed = true;
			window.clearInterval(timer);
			window.removeEventListener('focus', visible);
			document.removeEventListener('visibilitychange', visible);
		};
	}, [enabled]);
}
