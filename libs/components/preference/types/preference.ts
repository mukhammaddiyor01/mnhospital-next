export type PreferenceTheme = 'LIGHT' | 'DARK' | 'SYSTEM';
export type PreferenceLanguage = 'KR' | 'UZ' | 'EN';

export interface UserPreference {
	theme: PreferenceTheme;
	language: PreferenceLanguage;
}
