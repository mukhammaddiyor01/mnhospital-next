import { useApolloClient, useReactiveVar } from '@apollo/client';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { userVar } from '@/apollo/store';
import { GET_MY_PREFERENCES } from '@/apollo/preference/query';
import { UPDATE_MY_PREFERENCES } from '@/apollo/preference/mutation';
import { getJwtToken } from '@/libs/auth/token';
import { PreferenceLanguage, PreferenceTheme, UserPreference } from './types/preference';

const THEME_KEY = 'mn-hospital-theme';
const LANGUAGE_KEY = 'mn-hospital-language';
const themes: PreferenceTheme[] = ['LIGHT', 'DARK', 'SYSTEM'];
const languages: PreferenceLanguage[] = ['KR', 'UZ', 'EN'];
const defaultPreference: UserPreference = { theme: 'LIGHT', language: 'EN' };
const htmlLanguage: Record<PreferenceLanguage, string> = { KR: 'ko', UZ: 'uz', EN: 'en' };

interface PreferenceContextValue extends UserPreference {
	setTheme: (theme: PreferenceTheme) => Promise<void>;
	setLanguage: (language: PreferenceLanguage) => Promise<void>;
	error: 'load' | 'save' | '';
	saving: boolean;
}

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

const storePreference = (key: string, value: string) => {
	try { window.localStorage.setItem(key, value); } catch { /* Browser storage may be unavailable. */ }
};

export const PreferenceProvider = ({ children }: { children: ReactNode }) => {
	const client = useApolloClient();
	const session = useReactiveVar(userVar);
	const selectionVersion = useRef(0);
	const [preference, setPreference] = useState<UserPreference>(defaultPreference);
	const [hydrated, setHydrated] = useState(false);
	const [error, setError] = useState<'load' | 'save' | ''>('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		try {
			const theme = window.localStorage.getItem(THEME_KEY) as PreferenceTheme | null;
			const language = window.localStorage.getItem(LANGUAGE_KEY) as PreferenceLanguage | null;
			setPreference({ theme: theme && themes.includes(theme) ? theme : 'LIGHT', language: language && languages.includes(language) ? language : 'EN' });
		} catch { /* Use default preferences when browser storage is unavailable. */ }
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const applyTheme = () => {
			const dark = preference.theme === 'DARK' || (preference.theme === 'SYSTEM' && media.matches);
			document.documentElement.dataset.theme = dark ? 'dark' : 'light';
			document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
		};
		applyTheme();
		media.addEventListener('change', applyTheme);
		return () => media.removeEventListener('change', applyTheme);
	}, [preference.theme, hydrated]);

	useEffect(() => {
		if (hydrated) document.documentElement.lang = htmlLanguage[preference.language];
	}, [preference.language, hydrated]);

	useEffect(() => {
		if (!session._id || !getJwtToken()) {
			setError('');
			return;
		}
		let cancelled = false;
		const version = selectionVersion.current;
		void client.query<{ getMyPreferences: UserPreference }>({ query: GET_MY_PREFERENCES, fetchPolicy: 'network-only' })
			.then(({ data }) => {
				const saved = data.getMyPreferences;
				if (cancelled || version !== selectionVersion.current || !themes.includes(saved.theme) || !languages.includes(saved.language)) return;
				setPreference(saved);
				storePreference(THEME_KEY, saved.theme);
				storePreference(LANGUAGE_KEY, saved.language);
				setError('');
			})
			.catch(() => { if (!cancelled && version === selectionVersion.current) setError('load'); });
		return () => { cancelled = true; };
	}, [client, session._id, session.memberType]);

	const updatePreference = async <K extends keyof UserPreference>(key: K, value: UserPreference[K]) => {
		if (saving || preference[key] === value) return;
		const version = ++selectionVersion.current;
		const previous = preference[key];
		const storageKey = key === 'theme' ? THEME_KEY : LANGUAGE_KEY;
		setPreference((current) => ({ ...current, [key]: value }));
		storePreference(storageKey, value);
		setError('');
		if (!session._id || !getJwtToken()) return;
		setSaving(true);
		try {
			await client.mutate<{ updateMyPreferences: UserPreference }>({ mutation: UPDATE_MY_PREFERENCES, variables: { input: { [key]: value } } });
		} catch {
			if (userVar()._id !== session._id || version !== selectionVersion.current) return;
			setPreference((current) => ({ ...current, [key]: previous }));
			storePreference(storageKey, previous);
			setError('save');
		} finally {
			setSaving(false);
		}
	};

	const setTheme = async (theme: PreferenceTheme) => { if (themes.includes(theme)) await updatePreference('theme', theme); };
	const setLanguage = async (language: PreferenceLanguage) => { if (languages.includes(language)) await updatePreference('language', language); };

	return <PreferenceContext.Provider value={{ ...preference, setTheme, setLanguage, error, saving }}>{children}</PreferenceContext.Provider>;
};

export const usePreferences = () => {
	const context = useContext(PreferenceContext);
	if (!context) throw new Error('usePreferences must be used within PreferenceProvider');
	return context;
};
