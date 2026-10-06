import { ChangeEvent } from 'react';
import { usePreferences } from './PreferenceProvider';
import { PreferenceTheme } from './types/preference';
import { useTranslation } from '@/libs/i18n/useTranslation';

const iconByTheme: Record<PreferenceTheme, string> = {
	LIGHT: 'light_mode',
	DARK: 'dark_mode',
	SYSTEM: 'brightness_auto',
};

const ThemeControl = () => {
	const { theme, setTheme, error, saving } = usePreferences();
	const t = useTranslation();
	const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
		void setTheme(event.target.value as PreferenceTheme);
	};

	return <div className="clinical-theme-setting">
		<label className="clinical-theme-control">
			<span className="material-symbols-rounded" aria-hidden="true">{iconByTheme[theme]}</span>
			<span className="sr-only">{t('nav.theme')}</span>
			<select aria-label={t('nav.theme')} value={theme} onChange={onChange} disabled={saving}>
				<option value="LIGHT">{t('theme.light')}</option>
				<option value="DARK">{t('theme.dark')}</option>
				<option value="SYSTEM">{t('theme.system')}</option>
			</select>
		</label>
		{error ? <span className="clinical-theme-error" role="status">{t(error === 'load' ? 'preference.loadError' : 'preference.saveError')}</span> : null}
	</div>;
};

export default ThemeControl;
