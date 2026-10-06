import { ChangeEvent } from 'react';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from './PreferenceProvider';
import { PreferenceLanguage } from './types/preference';

const LanguageControl = () => {
	const t = useTranslation();
	const { language, setLanguage, saving } = usePreferences();
	const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
		void setLanguage(event.target.value as PreferenceLanguage);
	};

	return <label className="clinical-language-control">
		<span className="material-symbols-rounded" aria-hidden="true">language</span>
		<span className="sr-only">{t('nav.language')}</span>
		<select aria-label={t('nav.language')} value={language} onChange={onChange} disabled={saving}>
			<option value="KR">한국어</option>
			<option value="UZ">O‘zbekcha</option>
			<option value="EN">English</option>
		</select>
	</label>;
};

export default LanguageControl;
