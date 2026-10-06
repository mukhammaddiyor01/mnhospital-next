import { useApolloClient, useReactiveVar } from '@apollo/client';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { userVar } from '@/apollo/store';
import { GET_MY_PREFERENCES } from '@/apollo/preference/query';
import { UPDATE_MY_PREFERENCES } from '@/apollo/preference/mutation';
import { getJwtToken } from '@/libs/auth/token';
import { PreferenceTheme, UserPreference } from './types/preference';

const THEME_KEY = 'mn-hospital-theme';
const themes: PreferenceTheme[] = ['LIGHT', 'DARK', 'SYSTEM'];

interface ThemeContextValue {
	theme: PreferenceTheme;
	setTheme: (theme: PreferenceTheme) => Promise<void>;
	error: string;
	saving: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const storeTheme = (theme: PreferenceTheme) => {
	try { window.localStorage.setItem(THEME_KEY, theme); } catch { /* Browser storage may be unavailable. */ }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const client = useApolloClient();
	const session = useReactiveVar(userVar);
	const selectionVersion = useRef(0);
	const [theme, setThemeState] = useState<PreferenceTheme>('LIGHT');
	const [hydrated, setHydrated] = useState(false);
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		try {
			const saved = window.localStorage.getItem(THEME_KEY) as PreferenceTheme | null;
			if (saved && themes.includes(saved)) setThemeState(saved);
		} catch { /* Use the light default when browser storage is unavailable. */ }
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const applyTheme = () => {
			const dark = theme === 'DARK' || (theme === 'SYSTEM' && media.matches);
			document.documentElement.dataset.theme = dark ? 'dark' : 'light';
			document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
		};
		applyTheme();
		media.addEventListener('change', applyTheme);
		return () => media.removeEventListener('change', applyTheme);
	}, [theme, hydrated]);

	useEffect(() => {
		if (!session._id || !getJwtToken()) return;
		let cancelled = false;
		const version = selectionVersion.current;
		void client.query<{ getMyPreferences: UserPreference }>({ query: GET_MY_PREFERENCES, fetchPolicy: 'network-only' })
			.then(({ data }) => {
				if (cancelled || version !== selectionVersion.current || !themes.includes(data.getMyPreferences.theme)) return;
				setThemeState(data.getMyPreferences.theme);
				storeTheme(data.getMyPreferences.theme);
				setError('');
			})
			.catch(() => { if (!cancelled && version === selectionVersion.current) setError('Theme preference could not be loaded.'); });
		return () => { cancelled = true; };
	}, [client, session._id, session.memberType]);

	const setTheme = async (nextTheme: PreferenceTheme) => {
		if (!themes.includes(nextTheme) || nextTheme === theme || saving) return;
		const version = ++selectionVersion.current;
		const previousTheme = theme;
		setThemeState(nextTheme);
		storeTheme(nextTheme);
		setError('');
		if (!session._id || !getJwtToken()) return;
		setSaving(true);
		try {
			await client.mutate<{ updateMyPreferences: UserPreference }>({
				mutation: UPDATE_MY_PREFERENCES,
				variables: { input: { theme: nextTheme } },
			});
		} catch {
			if (userVar()._id !== session._id || version !== selectionVersion.current) return;
			setThemeState(previousTheme);
			storeTheme(previousTheme);
			setError('Theme preference could not be saved.');
		} finally {
			setSaving(false);
		}
	};

	return <ThemeContext.Provider value={{ theme, setTheme, error, saving }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error('useTheme must be used within ThemeProvider');
	return context;
};
