import { ChangeEvent } from 'react';
import { useTheme } from './ThemeProvider';
import { PreferenceTheme } from './types/preference';

const iconByTheme: Record<PreferenceTheme, string> = {
	LIGHT: 'light_mode',
	DARK: 'dark_mode',
	SYSTEM: 'brightness_auto',
};

const ThemeControl = () => {
	const { theme, setTheme, error, saving } = useTheme();
	const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
		void setTheme(event.target.value as PreferenceTheme);
	};

	return <div className="clinical-theme-setting">
		<label className="clinical-theme-control">
			<span className="material-symbols-rounded" aria-hidden="true">{iconByTheme[theme]}</span>
			<span className="sr-only">Color theme</span>
			<select aria-label="Color theme" value={theme} onChange={onChange} disabled={saving}>
				<option value="LIGHT">Light</option>
				<option value="DARK">Dark</option>
				<option value="SYSTEM">System</option>
			</select>
		</label>
		{error ? <span className="clinical-theme-error" role="status">{error}</span> : null}
	</div>;
};

export default ThemeControl;
